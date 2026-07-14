import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const links = [
  { to: '/client', label: 'Overview' },
  { to: '/client', label: 'Deliveries' },
  { to: '/client', label: 'Settings' },
];

export function ClientLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #07111f 0%, #0f172a 45%, #111827 100%)', color: '#f8fafc' }}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{ width: 260, padding: '2rem 1.25rem', borderRight: '1px solid rgba(255,255,255,0.08)', background: 'rgba(2,6,23,0.72)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'inline-flex', width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #34d399, #22c55e)', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem' }}>⬢</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>Client Portal</div>
            <div style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>Command center</div>
          </div>

          <nav style={{ display: 'grid', gap: '0.45rem' }}>
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to + link.label}
                  to={link.to}
                  style={{
                    padding: '0.8rem 0.95rem',
                    borderRadius: 14,
                    textDecoration: 'none',
                    color: isActive ? '#f8fafc' : '#cbd5e1',
                    background: isActive ? 'rgba(34,197,94,0.2)' : 'transparent',
                    border: isActive ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div style={{ marginTop: '1.75rem' }}>
            <div style={{ marginBottom: '0.75rem', fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#94a3b8' }}>Resource links</div>
            {[
              { to: '/client', label: 'Product' },
              { to: '/client', label: 'Developers' },
              { to: '/client', label: 'Pricing' },
              { to: '/client/docs', label: 'Docs' },
            ].map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    display: 'block',
                    padding: '0.8rem 0.95rem',
                    borderRadius: 14,
                    textDecoration: 'none',
                    color: isActive ? '#f8fafc' : '#cbd5e1',
                    background: isActive ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    marginBottom: '0.6rem',
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </aside>

        <main style={{ flex: 1, padding: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => navigate('/client')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', padding: '0.6rem 0.9rem', borderRadius: 999, border: '1px solid rgba(52, 211, 153, 0.24)', background: 'rgba(52, 211, 153, 0.12)', color: '#dcfce7', cursor: 'pointer' }}
              aria-label="Back to workspace"
            >
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>←</span>
              <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>Back to workspace</span>
            </button>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
