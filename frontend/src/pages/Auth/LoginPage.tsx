import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '../../services/auth';
import { useAuth } from '../../hooks/useAuth';

const EyeIcon = ({ visible }: { visible: boolean }) => (
  visible ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6A3 3 0 0 0 13.4 13.4" />
      <path d="M9.9 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a18.7 18.7 0 0 1-4 4.7" />
      <path d="M6.5 6.5A18.7 18.7 0 0 0 2 12s3.5 7 10 7a10.7 10.7 0 0 0 3.4-.5" />
    </svg>
  )
);

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { register: formRegister, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(() => Boolean(localStorage.getItem('3pdms_remember')));
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const onSubmit = async (data: LoginForm) => {
    setError(null);

    try {
      const response = await login(data);

      if ('mfa_required' in response && response.mfa_required) {
        navigate('/mfa-challenge', { state: { message: 'Multi-factor authentication is required. Please complete the challenge to continue.', challengeToken: response.challenge_token } });
        return;
      }

      // persist remember preference locally but rollback if auth fails
      const prevRemember = localStorage.getItem('3pdms_remember');
      try {
        localStorage.setItem('3pdms_remember', rememberMe ? 'true' : 'false');
        await auth.login(response.token, rememberMe);

        // If this is the seeded system owner or has platform-level management permissions, route to the platform console
        const isPlatformOwner = auth.user?.is_system_owner || auth.user?.email === 'systemadmin@d.com' || auth.hasPermission('manage.system');
        const destination = isPlatformOwner
          ? '/platform'
          : auth.hasPermission('admin.access')
          ? '/admin'
          : auth.hasPermission('client.access')
          ? '/client'
          : '/admin';

        navigate(destination);
      } catch (innerErr) {
        // rollback stored preference
        if (prevRemember !== null) localStorage.setItem('3pdms_remember', prevRemember);
        else localStorage.removeItem('3pdms_remember');
        throw innerErr;
      }
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status;
      const message = err?.response?.data?.message || err?.message || 'Unable to sign in with those credentials.';
      const normalized = message.toLowerCase();

      if (status === 403 && (normalized.includes('pending') || normalized.includes('approval') || normalized.includes('verify') || normalized.includes('email'))) {
        navigate('/pending-approval', { state: { message } });
        return;
      }

      setError(message);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-bg">
        <span className="auth-particle auth-particle--small" />
        <span className="auth-particle auth-particle--medium" />
        <span className="auth-particle auth-particle--small" />
        <span className="auth-particle auth-particle--large" />
        <span className="auth-particle auth-particle--small" />
        <span className="auth-particle auth-particle--medium" />
      </div>
      <div className="auth-card">
        <div className="auth-panel">
          <div>
            <h1 style={{ margin: 0, fontSize: 'clamp(2.2rem, 3vw, 2.8rem)', lineHeight: 1.05, color: 'var(--text-primary)' }}>
              {location.pathname.startsWith('/platform') ? 'System Administration Console — Sign in' : 'Secure sign in'}
            </h1>
            <p style={{ margin: '1rem 0 0', color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.96rem' }}>
              {location.pathname.startsWith('/platform')
                ? 'Sign in to the System Administration Console to manage platform-wide settings, tenants, and governance.'
                : 'Instant access to your operations dashboard with fast, modern authentication.'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '1rem', minHeight: 0, maxWidth: 520 }}>
            <div style={{ display: 'grid', gap: '0.45rem' }}>
              <label htmlFor="email-input" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>Email</label>
              <input
                id="email-input"
                type="email"
                autoComplete="email"
                {...formRegister('email')}
                aria-describedby={errors.email ? 'email-error' : undefined}
                aria-invalid={errors.email ? 'true' : 'false'}
                style={{ width: '100%', maxWidth: 380, padding: '0.85rem 0.95rem', borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
              />
              {errors.email && (
                <span id="email-error" role="alert" aria-live="assertive" style={{ color: '#f97316', fontSize: '0.9rem' }}>{errors.email.message}</span>
              )}
            </div>

            <div style={{ display: 'grid', gap: '0.45rem' }}>
              <label htmlFor="password-input" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...formRegister('password')}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  style={{ width: '100%', maxWidth: 380, padding: '0.85rem 3.2rem 0.85rem 0.95rem', borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface-input)', color: 'var(--text-primary)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{ position: 'absolute', top: '50%', right: '0.6rem', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
              {errors.password && (
                <span id="password-error" role="alert" aria-live="assertive" style={{ color: '#f97316', fontSize: '0.9rem' }}>{errors.password.message}</span>
              )}
            </div>

            {error && (
              <div id="login-error" role="status" aria-live="polite" aria-atomic="true" style={{ padding: '0.9rem 1rem', borderRadius: 14, background: 'rgba(248,113,113,0.14)', color: '#fecaca' }}>{error}</div>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                style={{ accentColor: 'var(--accent)' }}
              />
              <span>Keep me signed in</span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              aria-label={isSubmitting ? 'Signing in…' : 'Sign in quickly'}
              aria-busy={isSubmitting}
              style={{
                padding: '0.95rem 1rem',
                borderRadius: 16,
                border: 'none',
                background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
                color: 'white',
                fontWeight: 700,
                cursor: isSubmitting ? 'wait' : 'pointer',
                transition: 'transform 180ms ease, background-color 180ms ease',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.55rem',
              }}
            >
              {isSubmitting ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.55)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.9s linear infinite' }} />
                  Signing in…
                </>
              ) : (
                'Sign in quickly'
              )}
            </button>
          </form>
          {isSubmitting && (
            <div style={{ marginTop: '0.8rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Signing you in now, hang tight — your dashboard will be ready in a moment.
            </div>
          )}
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Create account</Link>
            <Link to="/forgot-password" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Forgot password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
