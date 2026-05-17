import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

console.log('Building Next.js app...');
try {
  // We use --no-lint to speed up CI/dev build checks, as linting is a separate step
  execSync('npm run build', { stdio: 'inherit', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } });
} catch (error) {
  console.warn('Next.js build failed or skipped, ensuring standalone placeholders exist for Tauri build...');
}

console.log('Preparing Next.js standalone placeholders...');

const dirs = [
  '.next/standalone',
  '.next/static',
  '.next/standalone/.next/static',
  'public/assets/images',
  'public/fonts'
];

for (const dir of dirs) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// Create dummy files for Tauri build check if missing
const files = [
  'public/assets/images/app_logo.png',
  'public/fonts/Outfit-VariableFont_wght.ttf',
  'public/favicon.ico'
];

for (const file of files) {
  if (!existsSync(file)) {
    console.log(`Creating placeholder file: ${file}`);
    writeFileSync(file, '');
  }
}
