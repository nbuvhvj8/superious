import { existsSync, mkdirSync } from 'node:fs';

console.log('Preparing Next.js standalone placeholders...');
if (!existsSync('.next/standalone')) {
  mkdirSync('.next/standalone', { recursive: true });
}
if (!existsSync('.next/static')) {
  mkdirSync('.next/static', { recursive: true });
}
if (!existsSync('public')) {
  mkdirSync('public', { recursive: true });
}
