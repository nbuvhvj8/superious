'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Loader2, ExternalLink, Unlink } from 'lucide-react';

export default function GoogleDocsIntegrationSection() {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Check stored connection
    const storedEmail = localStorage.getItem('google_email');
    const storedToken = localStorage.getItem('google_access_token');
    if (storedEmail && storedToken) {
      setEmail(storedEmail);
      setStatus('connected');
    }

    // Handle OAuth callback redirect
    const params = new URLSearchParams(window.location.search);
    const oauthStatus = params?.get('google_oauth');
    const cbEmail = params?.get('email');
    const err = params?.get('error');

    if (oauthStatus === 'success' && cbEmail) {
      const decodedEmail = decodeURIComponent(cbEmail);
      setEmail(decodedEmail);
      setStatus('connected');
      const accessToken = params?.get('access_token');
      const refreshToken = params?.get('refresh_token');
      if (accessToken) localStorage.setItem('google_access_token', accessToken);
      if (refreshToken) localStorage.setItem('google_refresh_token', refreshToken);
      localStorage.setItem('google_email', decodedEmail);
      // Clean URL
      window.history?.replaceState({}, '', '/settings');
    } else if (oauthStatus === 'error' || err) {
      setStatus('error');
      setErrorMsg(err ? decodeURIComponent(err) : 'Google authorization failed.');
      window.history?.replaceState({}, '', '/settings');
    }
  }, []);

  function handleConnect() {
    setStatus('connecting');
    setErrorMsg('');

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setStatus('error');
      setErrorMsg('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured in environment variables.');
      return;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location?.origin;
    const redirectUri = `${siteUrl}/api/auth/google/callback`;
    const scope = encodeURIComponent(
      'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file email profile'
    );
    const state = encodeURIComponent(JSON.stringify({ from: 'settings' }));

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${scope}` +
      `&access_type=offline` +
      `&prompt=consent` +
      `&state=${state}`;

    window.location.href = authUrl;
  }

  function handleDisconnect() {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('google_email');
    setStatus('idle');
    setEmail('');
  }

  return (
    <section id="integrations" className="card p-6 space-y-5">
      <div className="flex items-center gap-2.5 pb-1 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center shadow-sm">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Integrations</h2>
          <p className="text-xs text-muted-foreground">
            Connect third-party services to enhance your outlier workflow.
          </p>
        </div>
      </div>

      {/* Google Docs Card */}
      <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center shadow-sm shrink-0">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
              />
              <path fill="#fff" d="M14 2v6h6" />
              <path
                fill="#fff"
                d="M8 13h8M8 17h5"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground">Google Docs</p>
              {status === 'connected' && (
                <span className="flex items-center gap-1 text-2xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={10} />
                  Connected
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {status === 'connected'
                ? `Signed in as ${email}`
                : 'Export scripts directly to Google Docs with one click.'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 font-medium leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {status === 'connected' ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-primary font-semibold">
                ✓ Google Docs export is active. Use the &quot;Docs&quot; button in any script view.
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-red-500 transition-colors px-3 py-2 rounded-lg border border-border hover:border-red-300 hover:bg-red-50"
            >
              <Unlink size={13} />
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={status === 'connecting'}
            className="btn-secondary w-full gap-2"
          >
            {status === 'connecting' ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Redirecting to Google…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Connect Google Account
                <ExternalLink size={12} />
              </>
            )}
          </button>
        )}

        <p className="text-2xs text-muted-foreground">
          outlier requests access to create and edit Google Docs files only. Your other Drive files
          are not accessible.
        </p>
      </div>
    </section>
  );
}
