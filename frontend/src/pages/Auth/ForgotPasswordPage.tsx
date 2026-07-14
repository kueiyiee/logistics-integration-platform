import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });
  const [submitted, setSubmitted] = useState(false);
  const emailValue = watch('email') ?? '';

  const onSubmit = async (data: ForgotForm) => {
    try {
      await api.post('/auth/forgot-password', data);
      setSubmitted(true);
    } catch (error) {
      setSubmitted(true);
    }
  };

  const emailDomain = useMemo(() => {
    const email = emailValue.trim();
    if (!email.includes('@')) return null;
    return email.split('@')[1]?.toLowerCase();
  }, [emailValue]);

  return (
    <div style={{ minHeight: '100dvh', width: '100%', display: 'grid', placeItems: 'center', padding: 'clamp(1rem, 2.2vw, 1.5rem)', overflow: 'hidden', background: 'var(--surface-1)' }}>
      <div style={{ width: '100%', maxWidth: 1120, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(1rem, 2vw, 1.5rem)', minHeight: 'calc(100dvh - 4rem)', alignItems: 'stretch' }}>
        <div style={{ display: 'grid', gap: '1.5rem', padding: 'clamp(1.5rem, 2vw, 2rem)', borderRadius: 32, background: 'var(--surface-2)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ display: 'inline-flex', width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg, #60a5fa, #818cf8)', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✉</div>
          <div>
            <h1 style={{ margin: '0 0 0.9rem', fontSize: 'clamp(2rem, 3vw, 2.8rem)', lineHeight: 1.05 }}>Recover your account</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.75, fontSize: '1rem' }}>
              Enter your email and we’ll send a secure recovery link to restore access to your workspace.
            </p>
          </div>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <div style={{ padding: '1rem', borderRadius: 24, background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.55rem' }}>Quick recovery</div>
              <div style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}>Email link delivery</div>
            </div>
            <div style={{ padding: '1rem', borderRadius: 24, background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.55rem' }}>Privacy first</div>
              <div style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}>No leaked details</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem', padding: 'clamp(1.5rem, 2vw, 2rem)', borderRadius: 32, background: 'var(--surface-3)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div>
            <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.6rem', color: 'var(--text-primary)' }}>Forgot password?</h2>
            <p style={{ margin: '0 0 1.25rem', color: 'var(--text-muted)' }}>We’ll send a recovery link to the email on file if an account exists.</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '1rem' }}>
              <label style={{ display: 'grid', gap: '0.45rem', color: '#e2e8f0' }}>
                <span>Email</span>
                <input type="email" {...register('email')} style={{ width: '100%', padding: '0.95rem 1rem', borderRadius: 16, border: '1px solid var(--border)', background: 'var(--surface-input)', color: 'var(--text-primary)' }} />
                {errors.email && <span style={{ color: '#fda4af', fontSize: '0.9rem' }}>{errors.email.message}</span>}
              </label>
              <div style={{ padding: '0.95rem 1rem', borderRadius: 16, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {emailDomain ? `We’ll check ${emailDomain} for an account and send recovery instructions if it exists.` : 'We’ll send recovery instructions if an account is tied to this email.'}
              </div>
              <button type="submit" disabled={isSubmitting} style={{ padding: '0.95rem 1rem', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                {isSubmitting ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'grid', gap: '0.8rem', padding: '1rem', borderRadius: 20, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', color: '#dcfce7' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Recovery instructions sent</h2>
              <p style={{ margin: 0, lineHeight: 1.7 }}>If the address belongs to an active account, a secure recovery link will arrive shortly.</p>
              <Link to="/login" style={{ color: '#bfdbfe', fontWeight: 600 }}>Return to sign in</Link>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Back to sign in</Link>
            <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
