//! Outlier desktop shell entrypoint.
//!
//! At runtime this binary spawns the bundled Next.js standalone server as a
//! Node sidecar, waits for it to print `READY:<port>` on stdout, then
//! navigates the main webview at the dynamic localhost URL.
//!
//! In `tauri dev` we skip the sidecar entirely — the webview talks directly
//! to `http://localhost:4028` (the existing `next dev -p 4028` server) so
//! HMR keeps working with zero plumbing.

use std::sync::Mutex;

use once_cell::sync::OnceCell;
use tauri::{Manager, RunEvent};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;

static SIDECAR: OnceCell<Mutex<Option<CommandChild>>> = OnceCell::new();

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // In `tauri dev` Tauri sets the devUrl pipeline, which wires the
            // webview at http://localhost:4028 already. Only start the
            // bundled Node sidecar in release builds.
            if !cfg!(debug_assertions) {
                spawn_sidecar(app.handle())?;
            }

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_handle, event| {
            // Use Exit (fires unconditionally just before process termination)
            // rather than ExitRequested (cancellable, may not fire on
            // programmatic app.exit() or signal paths) so the Node sidecar
            // is always reaped and never leaked as an orphan.
            if let RunEvent::Exit = event {
                shutdown_sidecar();
            }
        });
}

fn spawn_sidecar(app: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let resource_dir = app.path().resource_dir()?;
    let standalone_dir = resource_dir.join("next-standalone");
    let launcher = resource_dir.join("sidecar/start-sidecar.js");

    let sidecar = app
        .shell()
        .sidecar("outlier-sidecar")?
        .env(
            "OUTLIER_NEXT_STANDALONE",
            standalone_dir.to_string_lossy().as_ref(),
        )
        .args([launcher.to_string_lossy().as_ref()]);

    let (mut rx, child) = sidecar.spawn()?;
    SIDECAR
        .get_or_init(|| Mutex::new(None))
        .lock()
        .map_err(|e| e.to_string())?
        .replace(child);

    let app_handle = app.clone();
    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    let line = String::from_utf8_lossy(&line).to_string();
                    log::info!("[sidecar:out] {}", line.trim_end());
                    if let Some(url) = parse_ready_url(line.trim()) {
                        if let Some(window) = app_handle.get_webview_window("main") {
                            if let Ok(parsed) = url.parse() {
                                let _ = window.navigate(parsed);
                            }
                        }
                    }
                }
                CommandEvent::Stderr(line) => {
                    log::warn!(
                        "[sidecar:err] {}",
                        String::from_utf8_lossy(&line).to_string().trim_end()
                    );
                }
                CommandEvent::Error(err) => {
                    log::error!("[sidecar] {err}");
                }
                CommandEvent::Terminated(payload) => {
                    log::error!("[sidecar] terminated: {:?}", payload);
                }
                _ => {}
            }
        }
    });

    Ok(())
}

fn parse_ready_url(line: &str) -> Option<String> {
    line.strip_prefix("READY:").map(|p| p.trim().to_string())
}

fn shutdown_sidecar() {
    if let Some(slot) = SIDECAR.get() {
        if let Ok(mut guard) = slot.lock() {
            if let Some(child) = guard.take() {
                let _ = child.kill();
            }
        }
    }
}
