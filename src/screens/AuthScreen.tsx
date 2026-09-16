import { useState, type ReactNode } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/auth/AuthContext';
import { parseError } from '@/lib/errors';

type Mode = 'login' | 'signup' | 'forgot';

interface AuthScreenProps {
  initialMode?: Mode;
}

export function AuthScreen({ initialMode = 'login' }: AuthScreenProps) {
  const { signIn, signUp, resetPassword, signInWithGoogle, error, clearError } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const displayError = localError ?? error;

  const handleSubmit = async () => {
    setLocalError(null);
    clearError();
    setSuccessMessage(null);

    if (!email.trim()) {
      setLocalError('Please enter your email.');
      return;
    }

    if (mode === 'forgot') {
      setSubmitting(true);
      try {
        await resetPassword(email);
        setSuccessMessage('Password reset link sent. Check your inbox.');
      } catch {
        setLocalError('Could not send reset email. Try again.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!password.trim()) {
      setLocalError('Please enter your password.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setLocalError('Please enter your name.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
        setSuccessMessage('Account created! Check your email for a confirmation link to verify your account, then sign in.');
        setMode('login');
      }
    } catch (err) {
      if ((err as Error).message === 'CONFIRMATION_REQUIRED') {
        setSuccessMessage('Account created! Check your email for a confirmation link to verify your account, then sign in.');
        setMode('login');
      } else {
        const parsed = parseError(err);
        if (parsed.isNetworkError) {
          setLocalError('Cannot connect to the server. Check your internet connection and try again.');
        } else {
          setLocalError((err as Error).message);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setLocalError(null);
    clearError();
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setLocalError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-ox-black">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0) 70%)',
        }}
      />

      <div className="relative flex flex-1 flex-col justify-center px-6 pb-10">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center anim-fade-up">
          <Logo size={56} />
          <h1 className="mt-4 text-2xl font-bold tracking-[0.2em] text-white">OXLix</h1>
          <p className="mt-1.5 text-[12px] font-light tracking-[0.18em] text-ox-gold-soft/70">
            Trusted Intelligence
          </p>
        </div>

        {/* Form card */}
        <div className="anim-scale-in rounded-3xl border border-white/[0.08] glass p-6 shadow-premium">
          <h2 className="text-lg font-semibold text-white">
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset password'}
          </h2>
          <p className="mt-1 text-[13px] text-white/45">
            {mode === 'login'
              ? 'Sign in to access your intelligence feed.'
              : mode === 'signup'
              ? 'Join Oxlix and start publishing trusted signals.'
              : 'Enter your email and we will send you a reset link.'}
          </p>

          {/* Fields */}
          <div className="mt-5 space-y-3">
            {mode === 'signup' && (
              <Field icon={<User size={17} />}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full bg-transparent text-[15px] text-white placeholder:text-white/30 outline-none"
                />
              </Field>
            )}

            <Field icon={<Mail size={17} />}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                autoCapitalize="none"
                className="w-full bg-transparent text-[15px] text-white placeholder:text-white/30 outline-none"
              />
            </Field>

            {mode !== 'forgot' && (
              <Field icon={<Lock size={17} />}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-transparent text-[15px] text-white placeholder:text-white/30 outline-none"
                />
                <button
                  onClick={() => setShowPassword((s) => !s)}
                  className="pressable text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </Field>
            )}
          </div>

          {/* Error / success */}
          {displayError && (
            <p className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-[12px] text-rose-300">
              {displayError}
            </p>
          )}
          {successMessage && (
            <p className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[12px] text-emerald-300">
              {successMessage}
            </p>
          )}

          {/* Submit */}
          <div className="mt-5">
            <Button fullWidth size="lg" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                  {mode === 'login' ? 'Signing in…' : mode === 'signup' ? 'Creating…' : 'Sending…'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                  <ArrowRight size={17} />
                </span>
              )}
            </Button>
          </div>

          {/* Google */}
          {mode !== 'forgot' && (
            <>
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/[0.06]" />
                <span className="text-[11px] text-white/30">or</span>
                <div className="h-px flex-1 bg-white/[0.06]" />
              </div>
              <button
                onClick={handleGoogle}
                disabled={submitting}
                className="pressable flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] py-3 text-[14px] font-medium text-white transition-all hover:bg-white/[0.06] disabled:opacity-40"
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </>
          )}

          {/* Mode switch */}
          <div className="mt-5 text-center text-[13px] text-white/45">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => { setMode('forgot'); setLocalError(null); clearError(); setSuccessMessage(null); }}
                  className="pressable text-ox-gold-soft hover:underline"
                >
                  Forgot password?
                </button>
                <p className="mt-2">
                  No account?{' '}
                  <button
                    onClick={() => { setMode('signup'); setLocalError(null); clearError(); setSuccessMessage(null); }}
                    className="pressable font-medium text-ox-gold-soft hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}
            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('login'); setLocalError(null); clearError(); setSuccessMessage(null); }}
                  className="pressable font-medium text-ox-gold-soft hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <button
                onClick={() => { setMode('login'); setLocalError(null); clearError(); setSuccessMessage(null); }}
                className="pressable inline-flex items-center gap-1 text-ox-gold-soft hover:underline"
              >
                <ArrowLeft size={14} /> Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors focus-within:border-ox-gold/40">
      <span className="text-white/40">{icon}</span>
      {children}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
