import { mkdirSync, existsSync, writeFileSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

// Determine target triple
let targetTriple = process.env.TAURI_ENV_TARGET_TRIPLE;
if (!targetTriple) {
  try {
    targetTriple = execSync('rustc -vV').toString().split('\n').find(l => l.startsWith('host:')).split(' ')[1];
  } catch (e) {
    targetTriple = 'x86_64-unknown-linux-gnu'; // fallback
  }
}

const binariesDir = join(process.cwd(), 'src-tauri', 'binaries');
if (!existsSync(binariesDir)) {
  mkdirSync(binariesDir, { recursive: true });
}

const extension = process.platform === 'win32' ? '.exe' : '';
const sidecarPath = join(binariesDir, `outlier-sidecar-${targetTriple}${extension}`);

if (!existsSync(sidecarPath)) {
  console.log(`Creating dummy sidecar at ${sidecarPath}`);
  if (process.platform !== 'win32') {
    writeFileSync(sidecarPath, '#!/bin/sh\necho "Outlier Sidecar Dummy"\n');
    chmodSync(sidecarPath, 0o755);
  } else {
    writeFileSync(sidecarPath, 'This is a dummy sidecar binary\n');
  }
}

// Also prepare the sidecar starter script (required resource in tauri.conf.json)
const sidecarScriptDir = join(process.cwd(), 'src-tauri', 'sidecar');
if (!existsSync(sidecarScriptDir)) {
  mkdirSync(sidecarScriptDir, { recursive: true });
}

const scriptPath = join(sidecarScriptDir, 'start-sidecar.js');
if (!existsSync(scriptPath)) {
  console.log(`Creating dummy sidecar script at ${scriptPath}`);
  writeFileSync(scriptPath, '// Outlier Sidecar Dummy Script\nconsole.log("Sidecar started");\n');
}
