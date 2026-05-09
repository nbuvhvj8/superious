import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const stateParam = searchParams.get('state');

  // For the redirect_uri to match on both legs of Google's OAuth flow,
  // server and client must compute it the same way. The client (page.tsx,
  // GoogleDocsIntegrationSection) prefers `NEXT_PUBLIC_SITE_URL` so a
  // reverse-proxied web deploy (where `request.nextUrl.origin` may resolve
  // to `http://` instead of `https://` without `X-Forwarded-Proto`) still
  // matches. The desktop sidecar build strips `NEXT_PUBLIC_SITE_URL`
  // (`scripts/desktop-build-next.mjs` + the launcher's `delete process.env`),
  // so both sides fall back to the live origin — which is always the
  // sidecar's random `127.0.0.1:<port>` and therefore matches too.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

  // Determine where to redirect back to
  let fromPage = 'onboarding';
  try {
    if (stateParam) {
      const state = JSON.parse(decodeURIComponent(stateParam));
      fromPage = state.from || 'onboarding';
    }
  } catch {
    // Ignore parsing errors, fall back to default fromPage
  }

  const redirectBase = fromPage === 'settings' ? `${siteUrl}/settings` : `${siteUrl}/`;

  if (error || !code) {
    const errMsg = error || 'authorization_failed';
    return NextResponse.redirect(
      `${redirectBase}?google_oauth=error&error=${encodeURIComponent(errMsg)}`
    );
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${siteUrl}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${redirectBase}?google_oauth=error&error=${encodeURIComponent('Google OAuth credentials not configured')}`
      );
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      return NextResponse.redirect(
        `${redirectBase}?google_oauth=error&error=${encodeURIComponent(tokenData.error_description || 'Token exchange failed')}`
      );
    }

    const { access_token, refresh_token } = tokenData;

    // Get user email
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const userData = await userRes.json();
    const email = userData.email || '';

    // Redirect back with tokens in query params (stored client-side in localStorage)
    const params = new URLSearchParams({
      google_oauth: 'success',
      access_token: access_token || '',
      email: encodeURIComponent(email),
    });
    if (refresh_token) params.set('refresh_token', refresh_token);

    return NextResponse.redirect(`${redirectBase}?${params.toString()}`);
  } catch (_err) {
    return NextResponse.redirect(
      `${redirectBase}?google_oauth=error&error=${encodeURIComponent('Unexpected error during authorization')}`
    );
  }
}
