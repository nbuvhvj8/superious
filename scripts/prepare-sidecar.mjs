#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Downloads the matching Node.js binary for the current host into
 * `src-tauri/binaries/outlier-sidecar-<rust-target-triple>` so that
 * Tauri's `bundle.externalBin` can pick it up.
 *
 * Tauri 2.0 expects sidecar binaries to be named with the Rust target
 * triple suffix (e.g. `outlier-sidecar-x86_64-unknown-linux-gnu`). We
 * resolve the triple via `rustc -vV` so this works on every platform
 * the build runs on (CI matrix or local).
 *
 * The Node version here MUST match the runtime requirements of the
 * Next.js standalone build — keep it on the latest LTS.
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync, rmSync, createWriteStream } from 'node:fs';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const NODE_VERSION = '20.18.0';

function rustTargetTriple() {
  try {
    const out = execSync('rustc -vV', { encoding: 'utf8' });
    const match = out.match(/host:\s*(\S+)/);
    if (match) return match[1];
  } catch {
    console.warn('[prepare-sidecar] rustc not found, falling back to host arch detection');
  }
  const archMap = { x64: 'x86_64', arm64: 'aarch64' };
  const arch = archMap[process.arch] ?? process.arch;
  if (process.platform === 'darwin') return `${arch}-apple-darwin`;
  if (process.platform === 'win32') return `${arch}-pc-windows-msvc`;
  return `${arch}-unknown-linux-gnu`;
}

function nodeAssetForTriple(triple) {
  // Official Node.js prebuilt binaries: https://nodejs.org/dist/
  if (triple.endsWith('apple-darwin')) {
    const arch = triple.startsWith('aarch64') ? 'arm64' : 'x64';
    return {
      url: `https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-darwin-${arch}.tar.gz`,
      ext: 'tar.gz',
      innerPath: `node-v${NODE_VERSION}-darwin-${arch}/bin/node`,
      executable: 'node',
    };
  }
  if (triple.endsWith('pc-windows-msvc')) {
    const arch = triple.startsWith('aarch64') ? 'arm64' : 'x64';
    return {
      url: `https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-win-${arch}.zip`,
      ext: 'zip',
      innerPath: `node-v${NODE_VERSION}-win-${arch}/node.exe`,
      executable: 'node.exe',
    };
  }
  // Linux glibc fallback.
  const arch = triple.startsWith('aarch64') ? 'arm64' : 'x64';
  return {
    url: `https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${arch}.tar.gz`,
    ext: 'tar.gz',
    innerPath: `node-v${NODE_VERSION}-linux-${arch}/bin/node`,
    executable: 'node',
  };
}

async function download(url, dest) {
  console.log(`[prepare-sidecar] downloading ${url}`);
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`download failed: ${res.status} ${res.statusText} (${url})`);
  }
  await pipeline(res.body, createWriteStream(dest));
}

function extractTarGz(archivePath, destDir, innerPath) {
  execSync(`tar -xzf "${archivePath}" -C "${destDir}"`, { stdio: 'inherit' });
  const extracted = path.join(destDir, innerPath);
  if (!existsSync(extracted)) {
    throw new Error(`extracted node binary not found at ${extracted}`);
  }
  return extracted;
}

function extractZip(archivePath, destDir, innerPath) {
  // Win10+ ships `tar.exe` which handles zip; fall back to `unzip` on *nix dev hosts.
  try {
    execSync(`tar -xf "${archivePath}" -C "${destDir}"`, { stdio: 'inherit' });
  } catch {
    execSync(`unzip -q "${archivePath}" -d "${destDir}"`, { stdio: 'inherit' });
  }
  const extracted = path.join(destDir, innerPath);
  if (!existsSync(extracted)) {
    throw new Error(`extracted node binary not found at ${extracted}`);
  }
  return extracted;
}

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const repoRoot = path.resolve(path.dirname(__filename), '..');
  const binariesDir = path.join(repoRoot, 'src-tauri', 'binaries');
  if (!existsSync(binariesDir)) mkdirSync(binariesDir, { recursive: true });

  const triple = rustTargetTriple();
  const asset = nodeAssetForTriple(triple);
  const isWindows = asset.executable === 'node.exe';
  const targetName = isWindows
    ? `outlier-sidecar-${triple}.exe`
    : `outlier-sidecar-${triple}`;
  const targetPath = path.join(binariesDir, targetName);

  if (existsSync(targetPath) && !process.env.FORCE_SIDECAR_REFRESH) {
    console.log(`[prepare-sidecar] cached: ${path.relative(repoRoot, targetPath)}`);
    return;
  }

  const workDir = await mkdtemp(path.join(tmpdir(), 'outlier-sidecar-'));
  try {
    const archivePath = path.join(workDir, `node.${asset.ext}`);
    await download(asset.url, archivePath);
    const extracted =
      asset.ext === 'zip'
        ? extractZip(archivePath, workDir, asset.innerPath)
        : extractTarGz(archivePath, workDir, asset.innerPath);

    if (existsSync(targetPath)) rmSync(targetPath, { force: true });
    // Use copy+remove instead of rename so this works across mounted devices
    // (e.g. /tmp on tmpfs vs the project on a regular disk).
    copyFileSync(extracted, targetPath);

    if (!isWindows) {
      execSync(`chmod +x "${targetPath}"`);
    }
    console.log(`[prepare-sidecar] installed: ${path.relative(repoRoot, targetPath)}`);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error('[prepare-sidecar] failed:', err);
  process.exit(1);
});
