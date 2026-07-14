import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { register as registerRequest } from '../../services/auth';

const registerSchema = z
  .object({
    company_name: z.string().min(1, 'Company name is required'),
    name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords must match',
    path: ['password_confirmation'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const {
    register: formRegister,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passwordValue = watch('password') || '';
  const [strengthScore, setStrengthScore] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('');

  useEffect(() => {
    const pw = passwordValue;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    setStrengthScore(score);
    const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
    setStrengthLabel(labels[score]);
  }, [passwordValue]);

  const onSubmit = async (data: RegisterForm) => {
    setSubmitError(null);

    try {
      const response = await registerRequest(data);
      const message = response?.message || 'Registration received. Check your email for verification.';
      setSuccessMessage(message);
      // show success banner briefly before redirecting
      await new Promise((res) => setTimeout(res, 2200));
      navigate('/pending-approval', { state: { message } });
    } catch (err: any) {
      setSubmitError(err instanceof Error ? err.message : (err?.response?.data?.message || 'Unable to complete registration.'));
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
            <p style={{ margin: 0, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.8rem' }}>Welcome to 3PDMS</p>
            <h1 style={{ margin: '0.65rem 0 0.6rem', fontSize: 'clamp(2rem, 3vw, 2.5rem)', lineHeight: 1.05, color: 'var(--text-primary)' }}>Create account</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.96rem' }}>Join your team’s delivery operations portal with a fast, polished registration experience.</p>
            <p style={{ margin: '0.85rem 0 0', color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.92rem' }}>Get set up quickly with secure access and a focused dashboard for your delivery workflows.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '1rem', maxWidth: 520 }}>
            {submitError && (
              <div style={{ padding: '1rem', borderRadius: 12, background: '#fff7f7', color: '#7f1d1d', border: '1px solid #fecaca', display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }} role="alert">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>There was a problem creating your account</div>
                  <div style={{ fontSize: '0.95rem' }}>{submitError}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => { setSubmitError(null); handleSubmit(onSubmit)(); }} className="btn btn-secondary">Try again</button>
                  <a href="mailto:support@yourdomain.com" style={{ alignSelf: 'center', color: 'var(--accent)', textDecoration: 'underline' }}>Contact support</a>
                </div>
              </div>
            )}

            {successMessage && (
              <div role="status" aria-live="polite" style={{ padding: '1rem', borderRadius: 16, background: 'rgba(16,185,129,0.12)', color: '#064e3b', border: '1px solid rgba(16,185,129,0.2)' }}>
                {successMessage}
              </div>
            )}
            <label style={{ display: 'grid', gap: '0.45rem', color: '#e2e8f0' }}>
              <span>Company name</span>
              <input {...formRegister('company_name')} required aria-label="Company name" autoComplete="organization" style={{ width: '100%', maxWidth: 400, padding: '0.85rem 0.95rem', borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface-input)', color: 'var(--text-primary)' }} />
              {errors.company_name && <span style={{ color: '#fda4af', fontSize: '0.9rem' }}>{errors.company_name.message}</span>}
            </label>
            <label style={{ display: 'grid', gap: '0.45rem', color: '#e2e8f0' }}>
              <span>Full name</span>
              <input {...formRegister('name')} required aria-label="Full name" autoComplete="name" style={{ width: '100%', maxWidth: 400, padding: '0.85rem 0.95rem', borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface-input)', color: 'var(--text-primary)' }} />
              {errors.name && <span style={{ color: '#fda4af', fontSize: '0.9rem' }}>{errors.name.message}</span>}
            </label>
            <label style={{ display: 'grid', gap: '0.45rem', color: '#e2e8f0' }}>
              <span>Email</span>
              <input type="email" {...formRegister('email')} required aria-label="Email address" autoComplete="email" style={{ width: '100%', maxWidth: 400, padding: '0.85rem 0.95rem', borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface-input)', color: 'var(--text-primary)' }} />
              {errors.email && <span style={{ color: '#fda4af', fontSize: '0.9rem' }}>{errors.email.message}</span>}
            </label>
            <label style={{ display: 'grid', gap: '0.45rem', color: '#e2e8f0' }}>
              <span>Password</span>
              <input type="password" {...formRegister('password')} required aria-label="Password" autoComplete="new-password" style={{ width: '100%', maxWidth: 400, padding: '0.85rem 0.95rem', borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface-input)', color: 'var(--text-primary)' }} />
              {errors.password && <span style={{ color: '#fda4af', fontSize: '0.9rem' }}>{errors.password.message}</span>}
            </label>
            <div style={{ display: 'grid', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div aria-hidden style={{ display: 'flex', gap: 6, flex: 1 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} style={{ height: 8, flex: 1, borderRadius: 6, background: i <= strengthScore - 1 ? (strengthScore <= 1 ? '#fb7185' : strengthScore === 2 ? '#f59e0b' : strengthScore === 3 ? '#60a5fa' : '#16a34a') : 'rgba(127,127,127,0.08)' }} />
                  ))}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }} aria-live="polite">{strengthLabel}</div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Use at least 8 characters including a mix of uppercase, numbers, or symbols.</div>
            </div>

            <label style={{ display: 'grid', gap: '0.45rem', color: '#e2e8f0' }}>
              <span>Confirm password</span>
              <input type="password" {...formRegister('password_confirmation')} required aria-label="Confirm password" autoComplete="new-password" style={{ width: '100%', maxWidth: 400, padding: '0.85rem 0.95rem', borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface-input)', color: 'var(--text-primary)' }} />
              {errors.password_confirmation && <span style={{ color: '#fda4af', fontSize: '0.9rem' }}>{errors.password_confirmation.message}</span>}
            </label>
            <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="btn btn-primary" style={{ width: '100%' }}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
