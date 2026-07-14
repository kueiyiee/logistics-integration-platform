import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export function MfaChallengePage() {
  const location = useLocation();
  const state = location.state as { message?: string; challengeToken?: string } | null;
  const message = state?.message || 'A multi-factor authentication challenge is in progress. Enter your verification code to complete sign in.';

  return (
    <div style={{ minHeight: '100dvh', width: '100%', position: 'relative', display: 'grid', placeItems: 'center', padding: 'clamp(1.5rem, 2.5vw, 3rem)', background: 'var(--surface-1)', color: 'var(--text-primary)' }}>
      <div style={{ position: 'absolute', right: 0, top: 0, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, rgba(96,165,250,0.18), transparent 45%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle at 70% 70%, rgba(37,99,235,0.14), transparent 50%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 760, display: 'grid', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gap: '1rem', padding: '2rem', borderRadius: 32, background: 'var(--surface-2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: 18, background: 'rgba(37,99,235,0.16)', color: 'var(--accent)', fontSize: '1.9rem' }}>🔐</div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 3vw, 2.8rem)', lineHeight: 1.05 }}>Verify your sign in</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.75, fontSize: '1rem' }}>{message}</p>
          </div>
        </div>

        {state?.challengeToken && (
          <div style={{ padding: '1.5rem', borderRadius: 24, background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <div style={{ marginBottom: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Challenge token</div>
            <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.92rem', background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '0.95rem 1rem' }}>{state.challengeToken}</div>
          </div>
        )}

        <div style={{ display: 'grid', gap: '1rem', padding: '1.5rem', borderRadius: 24, background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Next step</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.75 }}>
            Enter the verification code sent to your registered authenticator app or device. If you did not receive a code, return to sign in and retry.
          </p>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <Link to="/login" style={{ padding: '1rem 1.1rem', borderRadius: 16, background: 'rgba(37,99,235,0.14)', color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}>Back to sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
