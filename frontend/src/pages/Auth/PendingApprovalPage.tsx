import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export function PendingApprovalPage() {
  const location = useLocation();
  const state = location.state as { message?: string } | null;
  const message = state?.message ||
    'Your registration is complete. Please verify your email if needed, and your System Admin will review and approve your account shortly.';

  return (
    <div style={{ minHeight: '100dvh', width: '100%', position: 'relative', display: 'grid', placeItems: 'center', padding: 'clamp(1.5rem, 2.5vw, 3rem)', background: 'var(--surface-1)', color: 'var(--text-primary)' }}>
      <div style={{ position: 'absolute', right: 0, top: 0, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, rgba(37,99,235,0.16), transparent 45%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle at 70% 70%, rgba(96,165,250,0.12), transparent 50%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 1000, display: 'grid', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gap: '1.5rem', padding: '2rem 2.5rem', borderRadius: 32, background: 'var(--surface-2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: 18, background: 'rgba(37,99,235,0.16)', color: 'var(--accent)', fontSize: '1.9rem' }}>⌛</div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.95rem', borderRadius: 999, background: 'rgba(37,99,235,0.08)', color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase', width: 'fit-content' }}>Approval pending</span>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 3vw, 3rem)', lineHeight: 1.05 }}>Your professional dashboard is almost ready</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1.05rem' }}>{message}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
            {[
              { label: 'Company onboarding', value: 'In review' },
              { label: 'Email verification', value: 'Pending' },
              { label: 'Dashboard access', value: 'Next step' },
            ].map((item) => (
              <div key={item.label} style={{ padding: '1rem', borderRadius: 20, background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.45rem' }}>{item.label}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div style={{ padding: '1.5rem', borderRadius: 24, background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
            <h2 style={{ margin: '0 0 0.85rem', fontSize: '1.15rem' }}>What happens next</h2>
            <ol style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.85 }}>
              <li style={{ marginBottom: '0.75rem' }}>Verify your email using the sign-up link sent to your inbox.</li>
              <li style={{ marginBottom: '0.75rem' }}>Your System Administrator reviews your company setup and role access.</li>
              <li>Once approved, you'll be able to sign in to your dedicated 3PDMS dashboard.</li>
            </ol>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: 24, background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
            <h2 style={{ margin: '0 0 0.85rem', fontSize: '1.15rem' }}>Need help?</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.75 }}>
              If you do not receive a verification email, check your spam folder, then request another link from your System Administrator.
            </p>
            <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: 18, background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.12)' }}>
              <p style={{ margin: 0, color: 'var(--accent)', fontWeight: 700 }}>Pro tip:</p>
              <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', lineHeight: 1.6 }}>Your System Admin can also approve your account faster from the System Admin settings panel.</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'flex-start' }}>
          <Link to="/login" style={{ padding: '1rem 1.3rem', borderRadius: 16, background: 'var(--accent)', color: '#fff', fontWeight: 700, textDecoration: 'none' }}>Go back to sign in</Link>
          <Link to="/" style={{ padding: '1rem 1.3rem', borderRadius: 16, background: 'var(--surface-3)', color: 'var(--text-primary)', border: '1px solid var(--border)', textDecoration: 'none' }}>Return to homepage</Link>
        </div>
      </div>
    </div>
  );
}
