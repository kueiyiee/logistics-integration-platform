import React from 'react';
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div style={{ minHeight: '100dvh', width: '100%', display: 'grid', placeItems: 'center', padding: '1.25rem', background: 'linear-gradient(135deg, var(--surface-1) 0%, var(--surface-2) 100%)', color: 'var(--text-primary)' }}>
      <div style={{ width: '100%', maxWidth: 1100, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
        <section style={{ borderRadius: 32, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', padding: '2rem', display: 'grid', gap: '1.5rem', boxShadow: '0 24px 80px rgba(2, 8, 23, 0.18)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.95rem', borderRadius: 999, background: 'rgba(37,99,235,0.12)', color: 'var(--accent)', border: '1px solid rgba(37,99,235,0.2)', width: 'fit-content' }}>
            <span style={{ fontWeight: 700 }}>Secure access</span>
          </div>

          <div>
            <h1 style={{ margin: '0 0 0.85rem', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', lineHeight: 1.08 }}>Welcome to your delivery portal</h1>
            <p style={{ margin: 0, maxWidth: 620, lineHeight: 1.75, color: 'var(--text-muted)', fontSize: '1rem' }}>
              Sign in to continue managing your workspace or create an account to get started with a modern, secure experience.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.95rem' }}>
            <Link to="/login" style={{ padding: '1rem 1.15rem', borderRadius: 999, background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', color: 'white', fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>
              Sign in
            </Link>
            <Link to="/register" style={{ padding: '1rem 1.15rem', borderRadius: 999, background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>
              Create account
            </Link>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ padding: '0.95rem 1rem', borderRadius: 20, background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '0.35rem' }}>Fast access</div>
              <div style={{ color: 'var(--text-primary)' }}>Secure sign-in, team onboarding, and audit-ready workflows in one place.</div>
            </div>
            <div style={{ padding: '0.95rem 1rem', borderRadius: 20, background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '0.35rem' }}>Built for teams</div>
              <div style={{ color: 'var(--text-primary)' }}>Stay organized with secure authentication and a polished workspace experience.</div>
            </div>
          </div>
        </section>

        <aside style={{ borderRadius: 32, background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '2rem', display: 'grid', gap: '1rem', boxShadow: '0 20px 60px rgba(2, 8, 23, 0.14)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Access portal</div>
              <h2 style={{ margin: '0.35rem 0 0', fontSize: '1.3rem', color: 'var(--text-primary)' }}>Continue securely</h2>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 0.7rem', borderRadius: 999, background: 'rgba(16,185,129,0.14)', color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Live
            </span>
          </div>

          <div style={{ padding: '1rem', borderRadius: 24, background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.6rem' }}>Quick actions</div>
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              {[
                { label: 'Review delivery exceptions', to: '/admin/deliveries?filter=exceptions' },
                { label: 'Manage API key access', to: '/admin/api-keys' },
                { label: 'Inspect webhook retries', to: '/admin/webhooks?tab=retries' },
                { label: 'Sync customer updates', to: '/admin/customers?sync=true' },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  title={`Go to ${action.label}`}
                  style={{
                    padding: '0.95rem 1rem',
                    borderRadius: 16,
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    fontWeight: 700,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease, transform 0.15s ease',
                  }}
                  onMouseEnter={(event) => {
                    const target = event.currentTarget as HTMLElement;
                    target.style.background = 'rgba(255,255,255,0.14)';
                    target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(event) => {
                    const target = event.currentTarget as HTMLElement;
                    target.style.background = 'var(--surface-2)';
                    target.style.transform = 'none';
                  }}
                >
                  <span>{action.label}</span>
                  <span style={{ color: 'var(--accent)', fontSize: '0.92rem' }}>Go →</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
