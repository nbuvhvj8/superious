/* eslint-disable no-console */
/**
 * Sidecar launcher for the bundled Next.js standalone server.
 *
 * Tauri spawns this script via the bundled Node binary at runtime. We:
 *   1. Pick a free port (PORT=0 trick).
 *   2. Boot the standalone server (which resolves `process.env.PORT`).
 *   3. Print `READY:http://127.0.0.1:<port>` to stdout — Rust watches stdout
 *      and navigates the webview to that URL.
 *
 * The standalone build directory is provided by Tauri via the
 * `OUTLIER_NEXT_STANDALONE` env var (set in `src-tauri/src/lib.rs`).
 */

const net = require('node:net');
const path = require('node:path');

function pickFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

async function main() {
  const standaloneDir = process.env.OUTLIER_NEXT_STANDALONE;
  if (!standaloneDir) {
    console.error('[sidecar] OUTLIER_NEXT_STANDALONE env is not set');
    process.exit(1);
  }

  const serverEntry = path.join(standaloneDir, 'server.js');
  const port = await pickFreePort();
  process.env.PORT = String(port);
  process.env.HOSTNAME = '127.0.0.1';
  process.env.OUTLIER_DESKTOP = '1';

  // The standalone server resolves modules relative to its own directory.
  process.chdir(standaloneDir);

  process.on('uncaughtException', (err) => {
    console.error('[sidecar] uncaughtException', err && err.stack ? err.stack : err);
  });
  process.on('unhandledRejection', (reason) => {
    console.error('[sidecar] unhandledRejection', reason);
  });

  // Boot the server. Next's standalone entry self-listens on PORT.
  require(serverEntry);

  // Give Next a tick to bind, then announce readiness with a deterministic
  // line Rust can parse.
  setImmediate(() => {
    console.log(`READY:http://127.0.0.1:${port}`);
  });
}

main().catch((err) => {
  console.error('[sidecar] fatal', err && err.stack ? err.stack : err);
  process.exit(1);
});
