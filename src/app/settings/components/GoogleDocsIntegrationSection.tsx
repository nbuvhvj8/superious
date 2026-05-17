

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

    // Prefer NEXT_PUBLIC_SITE_URL so reverse-proxied web deploys keep a
    // deterministic redirect_uri (matches the server callback's
    // `process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin`). The
    // desktop sidecar build strips this env var so the client falls back
    // to `window.location.origin`, which matches the random localhost
    // port the standalone server is listening on.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
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
    <section id="google-docs-integration" className="space-y-12">
      <div className="flex items-center gap-2.5 pb-1 border-b border-border/60">
        <div className="w-8 h-8 rounded-lg bg-[#f2f3f6] flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="15" height="15">
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
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-start justify-between gap-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-foreground">Google Docs</h3>
              {status === 'connected' && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={10} />
                  Connected
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
              {status === 'connected'
                ? `Currently connected to ${email}. You can export scripts directly to your Google Docs.`
                : 'Connect your Google account to export scripts directly to Google Docs with one click.'}
            </p>
          </div>

          <div className="shrink-0">
            {status === 'connected' ? (
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#f2f3f6] rounded-[8px] text-[12px] font-bold text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <Unlink size={13} />
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={status === 'connecting'}
                className="flex items-center gap-2 px-4 py-2 bg-[#f2f3f6] rounded-[8px] text-[12px] font-bold text-foreground hover:bg-[#ebecef] transition-all disabled:opacity-50"
              >
                {status === 'connecting' ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink size={13} />
                    Connect Google Account
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-[8px] bg-red-50 border border-red-100">
            <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 font-medium leading-relaxed">{errorMsg}</p>
          </div>
        )}

        <div className="p-4 rounded-[12px] bg-[#f2f3f6]/50 border border-border/40">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-bold text-foreground uppercase text-[10px] tracking-wider block mb-1">
              Privacy Note
            </span>
            outlier requests access to create and edit Google Docs files only. Your other Drive
            files are not accessible. We value your privacy and only request the minimum necessary
            permissions.
          </p>
        </div>
      </div>
    </section>
  );
}
