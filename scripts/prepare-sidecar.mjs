import { copyFileSync, mkdirSync, existsSync, writeFileSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const targetTriple = process.env.TAURI_ENV_TARGET_TRIPLE ||
  execSync('rustc -vV').toString().split('\n').find(l => l.startsWith('host:')).split(' ')[1];

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
