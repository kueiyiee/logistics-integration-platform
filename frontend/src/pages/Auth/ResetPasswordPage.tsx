import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../services/api';

const resetSchema = z.object({
  email: z.string().email('Enter a valid email'),
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Include at least one uppercase letter').regex(/[a-z]/, 'Include at least one lowercase letter').regex(/[0-9]/, 'Include at least one number').regex(/[^A-Za-z0-9]/, 'Include at least one symbol'),
  password_confirmation: z.string().min(8, 'Password confirmation is required'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

type ResetForm = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      token: searchParams.get('token') ?? '',
      email: searchParams.get('email') ?? '',
    },
  });

  const passwordValue = watch('password') ?? '';
  const strength = useMemo(() => {
    let score = 0;
    if (passwordValue.length >= 8) score += 1;
    if (/[A-Z]/.test(passwordValue)) score += 1;
    if (/[a-z]/.test(passwordValue)) score += 1;
    if (/[0-9]/.test(passwordValue)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1;
    if (score <= 2) return { label: 'Weak', color: '#fb7185' };
    if (score <= 4) return { label: 'Good', color: '#fbbf24' };
    return { label: 'Strong', color: '#4ade80' };
  }, [passwordValue]);

  const onSubmit = async (data: ResetForm) => {
    await api.post('/auth/reset-password', data);
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100dvh', width: '100%', display: 'grid', placeItems: 'center', padding: 'clamp(1rem, 2.2vw, 1.5rem)', overflow: 'hidden', background: 'var(--surface-1)' }}>
      <div style={{ width: '100%', maxWidth: 1120, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(1rem, 2vw, 1.5rem)', minHeight: 'calc(100dvh - 4rem)', alignItems: 'stretch' }}>
        <div style={{ display: 'grid', gap: '1.5rem', padding: 'clamp(1.5rem, 2vw, 2rem)', borderRadius: 32, background: 'var(--surface-2)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ display: 'inline-flex', width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg, #60a5fa, #818cf8)', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🔐</div>
          <div>
            <h1 style={{ margin: '0 0 0.9rem', fontSize: 'clamp(2rem, 3vw, 2.8rem)', lineHeight: 1.05 }}>Reset your password</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.75, fontSize: '1rem' }}>
              Choose a new password that keeps your workspace safe and ready for the next login.
            </p>
          </div>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <div style={{ padding: '1rem', borderRadius: 24, background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.55rem' }}>Strong password</div>
              <div style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}>Uppercase, number, symbol</div>
            </div>
            <div style={{ padding: '1rem', borderRadius: 24, background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.55rem' }}>Secure reset</div>
              <div style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}>Token + email verification</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem', padding: 'clamp(1.5rem, 2vw, 2rem)', borderRadius: 32, background: 'var(--surface-3)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div>
            <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.6rem', color: 'var(--text-primary)' }}>Reset password</h2>
            <p style={{ margin: '0 0 1.25rem', color: 'var(--text-muted)' }}>Enter your email, token, and a strong new password to continue.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '1rem' }}>
            <label style={{ display: 'grid', gap: '0.45rem', color: '#e2e8f0' }}>
              <span>Email</span>
              <input type="email" {...register('email')} style={{ width: '100%', padding: '0.95rem 1rem', borderRadius: 16, border: '1px solid var(--border)', background: 'var(--surface-input)', color: 'var(--text-primary)' }} />
              {errors.email && <span style={{ color: '#fda4af', fontSize: '0.9rem' }}>{errors.email.message}</span>}
            </label>
            <label style={{ display: 'grid', gap: '0.45rem', color: '#e2e8f0' }}>
              <span>Reset token</span>
              <input {...register('token')} style={{ width: '100%', padding: '0.95rem 1rem', borderRadius: 16, border: '1px solid var(--border)', background: 'var(--surface-input)', color: 'var(--text-primary)' }} />
              {errors.token && <span style={{ color: '#fda4af', fontSize: '0.9rem' }}>{errors.token.message}</span>}
            </label>
            <label style={{ display: 'grid', gap: '0.45rem', color: '#e2e8f0' }}>
              <span>New password</span>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} {...register('password')} style={{ width: '100%', padding: '0.95rem 3.2rem 0.95rem 1rem', borderRadius: 16, border: '1px solid var(--border)', background: 'var(--surface-input)', color: 'var(--text-primary)' }} />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)} style={{ position: 'absolute', top: '50%', right: '0.75rem', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#7dd3fc', cursor: 'pointer' }}>👁</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <span>Use 8+ characters with upper/lower case, a number, and a symbol.</span>
                <span style={{ color: strength.color, fontWeight: 700 }}>{strength.label}</span>
              </div>
              {errors.password && <span style={{ color: '#fda4af', fontSize: '0.9rem' }}>{errors.password.message}</span>}
            </label>
            <label style={{ display: 'grid', gap: '0.45rem', color: '#e2e8f0' }}>
              <span>Confirm password</span>
              <div style={{ position: 'relative' }}>
                <input type={showConfirm ? 'text' : 'password'} {...register('password_confirmation')} style={{ width: '100%', padding: '0.95rem 3.2rem 0.95rem 1rem', borderRadius: 16, border: '1px solid var(--border)', background: 'var(--surface-input)', color: 'var(--text-primary)' }} />
                <button type="button" aria-label={showConfirm ? 'Hide confirmation' : 'Show confirmation'} onClick={() => setShowConfirm((value) => !value)} style={{ position: 'absolute', top: '50%', right: '0.75rem', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#7dd3fc', cursor: 'pointer' }}>👁</button>
              </div>
              {errors.password_confirmation && <span style={{ color: '#fda4af', fontSize: '0.9rem' }}>{errors.password_confirmation.message}</span>}
            </label>
            <button type="submit" disabled={isSubmitting} style={{ padding: '0.95rem 1rem', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
              {isSubmitting ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
            <Link to="/login" style={{ color: 'var(--accent)' }}>Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
