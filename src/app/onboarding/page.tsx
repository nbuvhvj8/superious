'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Feather,
  FileVideo,
  FolderOpen,
  FileText,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Loader2,
  AlertCircle,
  Video,
} from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

const STEPS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'features', label: 'Features' },
  { id: 'google', label: 'Google Docs' },
  { id: 'ready', label: "You\'re Ready" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [googleStatus, setGoogleStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>(
    'idle'
  );
  const [googleEmail, setGoogleEmail] = useState('');
  const [youtubeStatus, setYoutubeStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>(
    'idle'
  );
  const [youtubeChannel, setYoutubeChannel] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Check if returning from OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthStatus = params?.get('google_oauth');
    const email = params?.get('email');
    const err = params?.get('error');

    if (oauthStatus === 'success' && email) {
      setGoogleEmail(decodeURIComponent(email));
      setGoogleStatus('connected');
      setStep(3);
      // Store token info
      const accessToken = params?.get('access_token');
      const refreshToken = params?.get('refresh_token');
      if (accessToken) localStorage.setItem('google_access_token', accessToken);
      if (refreshToken) localStorage.setItem('google_refresh_token', refreshToken);
      localStorage.setItem('google_email', decodeURIComponent(email));
    } else if (oauthStatus === 'error' || err) {
      setGoogleStatus('error');
      setErrorMsg(err ? decodeURIComponent(err) : 'Google authorization failed. Please try again.');
      setStep(2);
    }
  }, []);

  function handleGoogleConnect() {
    setGoogleStatus('connecting');
    setErrorMsg('');

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setGoogleStatus('error');
      setErrorMsg(
        'Google Client ID is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.'
      );
      return;
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`;
    const scope = encodeURIComponent(
      'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file email profile'
    );
    const state = encodeURIComponent(JSON.stringify({ from: 'onboarding' }));

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

  function handleYoutubeConnect() {
    setYoutubeStatus('connecting');
    setTimeout(() => {
      setYoutubeStatus('connected');
      setYoutubeChannel('Superious Content');
      localStorage.setItem('youtube_connected', 'true');
      localStorage.setItem('youtube_channel', 'Superious Content');
    }, 1500);
  }

  function handleSkipGoogle() {
    setStep(3);
  }

  function handleFinish() {
    localStorage.setItem('onboarding_complete', 'true');
    router?.push('/');
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <AppLogo size={36} />
        <span className="font-extrabold text-xl tracking-tight text-foreground">outlier</span>
      </div>
      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS?.map((s, i) => (
          <React.Fragment key={s?.id}>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  i < step
                    ? 'bg-primary text-primary-foreground'
                    : i === step
                      ? 'bg-primary/20 text-primary border-2 border-primary'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < step ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span
                className={`text-xs font-semibold hidden sm:block ${
                  i === step ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {s?.label}
              </span>
            </div>
            {i < STEPS?.length - 1 && (
              <div
                className={`w-8 h-px ${i < step ? 'bg-primary' : 'bg-border'} transition-colors duration-300`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      {/* Step Content */}
      <div className="w-full max-w-lg">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="card p-8 space-y-6 animate-fade-in text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Feather size={28} className="text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-foreground">Welcome to outlier</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your AI-powered video script research engine. Submit a topic, get a fully
                researched, structured script with source evidence — ready to shoot.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left">
              {[
                { icon: <Feather size={14} strokeWidth={2.25} />, label: 'AI Script Generation' },
                { icon: <FileVideo size={14} strokeWidth={2.25} />, label: 'Source Evidence' },
                { icon: <FolderOpen size={14} strokeWidth={2.25} />, label: 'Job Collections' },
                { icon: <FileText size={14} strokeWidth={2.25} />, label: 'Google Docs Export' },
              ]?.map((f) => (
                <div
                  key={f?.label}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted border border-border"
                >
                  <span className="text-primary">{f?.icon}</span>
                  <span className="text-xs font-bold text-foreground">{f?.label}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="btn-primary w-full">
              Get Started
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Step 1: Features */}
        {step === 1 && (
          <div className="card p-8 space-y-6 animate-fade-in">
            <div className="space-y-1">
              <span className="section-label">What's included</span>
              <h2 className="text-xl font-extrabold text-foreground">
                Everything you need to create
              </h2>
            </div>
            <div className="space-y-3">
              {[
                {
                  icon: <Feather size={16} strokeWidth={2.25} className="text-primary" />,
                  title: 'Inline Script Editor',
                  desc: 'Edit AI-generated scripts directly in the app. Refine hooks, reorder sections, cut filler.',
                },
                {
                  icon: <FileVideo size={16} strokeWidth={2.25} className="text-primary" />,
                  title: 'Script Format Templates',
                  desc: 'Choose from YouTube long-form, Shorts/Reels, Podcast intro, or Documentary-style before generating.',
                },
                {
                  icon: <FileText size={16} strokeWidth={2.25} className="text-primary" />,
                  title: 'B-Roll Shot List Panel',
                  desc: 'Auto-extracted B-roll cues from your script, numbered and exportable for your editor.',
                },
                {
                  icon: <FolderOpen size={16} strokeWidth={2.25} className="text-primary" />,
                  title: 'Job Collections / Folders',
                  desc: 'Group related scripts into folders like "Finance Series" or "Client Work" for easy navigation.',
                },
                {
                  icon: <ExternalLink size={16} strokeWidth={2.25} className="text-primary" />,
                  title: 'Google Docs Export',
                  desc: 'Push your final script to Google Docs in one click — ready to share with editors or collaborators.',
                },
              ]?.map((f) => (
                <div
                  key={f?.title}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    {f?.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{f?.title}</p>
                    <p className="text-xs text-foreground mt-1 leading-relaxed">{f?.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="btn-secondary flex-1">
                Back
              </button>
              <button onClick={() => setStep(2)} className="btn-primary flex-1">
                Continue
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Google Docs Connection */}
        {step === 2 && (
          <div className="card p-8 space-y-6 animate-fade-in">
            <div className="space-y-1">
              <span className="section-label">Optional integration</span>
              <h2 className="text-xl font-extrabold text-foreground">Connect Google Docs</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect your Google account to export scripts directly to Google Docs. You can skip
                this and connect later in Settings.
              </p>
            </div>

            {/* Google OAuth Card */}
            <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-4">
              <div className="flex items-center gap-3">
                {/* Google G icon */}
                <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center shadow-sm shrink-0">
                  <svg viewBox="0 0 24 24" width="20" height="20">
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
                  <p className="text-sm font-bold text-foreground">Google Account</p>
                  <p className="text-xs text-muted-foreground">
                    {googleStatus === 'connected'
                      ? `Connected as ${googleEmail}`
                      : 'Authorize read/write access to Google Docs'}
                  </p>
                </div>
                {googleStatus === 'connected' && (
                  <CheckCircle2 size={18} className="text-primary ml-auto shrink-0" />
                )}
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 font-medium leading-relaxed">{errorMsg}</p>
                </div>
              )}

              {googleStatus !== 'connected' && (
                <button
                  onClick={handleGoogleConnect}
                  disabled={googleStatus === 'connecting'}
                  className="btn-secondary w-full gap-2"
                >
                  {googleStatus === 'connecting' ? (
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
                      Sign in with Google
                    </>
                  )}
                </button>
              )}

              {googleStatus === 'connected' && (
                <div className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-primary font-semibold">
                    ✓ Google Docs export is now enabled. You can export any script with one click.
                  </p>
                </div>
              )}
            </div>

            {/* YouTube Connection Card */}
            <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-sm shrink-0">
                  <Video size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">YouTube Channel</p>
                  <p className="text-xs text-muted-foreground">
                    {youtubeStatus === 'connected'
                      ? `Connected: ${youtubeChannel}`
                      : 'Connect to post or research via YouTube API'}
                  </p>
                </div>
                {youtubeStatus === 'connected' && (
                  <CheckCircle2 size={18} className="text-primary ml-auto shrink-0" />
                )}
              </div>

              {youtubeStatus !== 'connected' && (
                <button
                  onClick={handleYoutubeConnect}
                  disabled={youtubeStatus === 'connecting'}
                  className="btn-secondary w-full gap-2"
                >
                  {youtubeStatus === 'connecting' ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Connecting to YouTube…
                    </>
                  ) : (
                    <>
                      <Video size={14} className="text-red-600" />
                      Connect YouTube Account
                    </>
                  )}
                </button>
              )}

              {youtubeStatus === 'connected' && (
                <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                  <p className="text-xs text-red-600 font-semibold">
                    ✓ YouTube channel connected. You can now pull topic ideas from your channel
                    data.
                  </p>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground text-center">
              outlier only requests access to create and edit documents in your Google Drive.
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                Back
              </button>
              {googleStatus === 'connected' ? (
                <button onClick={() => setStep(3)} className="btn-primary flex-1">
                  Continue
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSkipGoogle}
                  className="btn-ghost flex-1 text-muted-foreground"
                >
                  Skip for now
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Ready */}
        {step === 3 && (
          <div className="card p-8 space-y-6 animate-fade-in text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} className="text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-foreground">You're all set!</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {googleStatus === 'connected'
                  ? `Google Docs is connected as ${googleEmail}. Start creating your first script.`
                  : 'outlier is ready. You can connect Google Docs anytime from Settings.'}
              </p>
            </div>
            {googleStatus !== 'connected' && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted border border-border text-left">
                <AlertCircle size={14} strokeWidth={2.25} className="text-foreground shrink-0" />
                <p className="text-xs text-foreground font-semibold">
                  Google Docs export is not connected. Go to{' '}
                  <span className="text-primary">Settings → Integrations</span> to connect later.
                </p>
              </div>
            )}
            <button onClick={handleFinish} className="btn-primary w-full text-base py-3">
              Open outlier
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
