#!/usr/bin/env node
/**
 * Wraps `next build` for the desktop sidecar bundle.
 *
 * The web build bakes `NEXT_PUBLIC_SITE_URL` into the client JS so OAuth
 * redirect_uri matches across reverse-proxied deployments (where the
 * server's `request.nextUrl.origin` may have a wrong scheme). For the
 * desktop sidecar, the URL is a random localhost port that NEXT_PUBLIC_*
 * env vars can't possibly know at build time — so we explicitly strip
 * the env var here so the client falls back to `window.location.origin`
 * and the server route falls back to `request.nextUrl.origin`, which
 * always agree (no proxy in the desktop case).
 */
import { spawn } from 'node:child_process';
import process from 'node:process';

const env = { ...process.env };
delete env.NEXT_PUBLIC_SITE_URL;

const child = spawn('next', ['build'], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
