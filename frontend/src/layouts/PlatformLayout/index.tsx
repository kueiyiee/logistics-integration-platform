import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const links = [
  { to: '/platform', label: 'Executive Dashboard', icon: '🏠' },
  { to: '/platform/companies', label: 'Company Management', icon: '🏢' },
  { to: '/platform/pending-approvals', label: 'Pending Company Approvals', icon: '⏳' },
  { to: '/platform/users', label: 'Platform Users', icon: '👥' },
  { to: '/platform/roles', label: 'Global Roles & Permissions', icon: '🔑' },
  { to: '/platform/deliveries', label: 'Global Deliveries', icon: '📦' },
  { to: '/platform/drivers', label: 'Driver Management', icon: '🚚' },
  { to: '/platform/map', label: 'Live Fleet Map', icon: '🌍' },
  { to: '/platform/intelligence', label: 'Business Intelligence', icon: '📊' },
  { to: '/platform/analytics', label: 'Analytics', icon: '📈' },
  { to: '/platform/reports', label: 'Reports', icon: '📄' },
  { to: '/platform/subscriptions', label: 'Subscription Management', icon: '💳' },
  { to: '/platform/revenue', label: 'Revenue Dashboard', icon: '💰' },
  { to: '/platform/api-keys', label: 'API Key Management', icon: '🔑' },
  { to: '/platform/webhooks', label: 'Webhook Management', icon: '🔗' },
  { to: '/platform/email', label: 'Email Service', icon: '📨' },
  { to: '/platform/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/platform/security', label: 'Security Center', icon: '🛡' },
  { to: '/platform/audit-logs', label: 'Audit Logs', icon: '📋' },
  { to: '/platform/configuration', label: 'System Configuration', icon: '⚙' },
  { to: '/platform/localization', label: 'Localization', icon: '🌐' },
  { to: '/platform/monitoring', label: 'Server Monitoring', icon: '🖥' },
  { to: '/platform/database', label: 'Database Health', icon: '🗄' },
  { to: '/platform/queue', label: 'Queue Monitor', icon: '📦' },
  { to: '/platform/mail', label: 'Mail Queue', icon: '📩' },
  { to: '/platform/errors', label: 'Error Monitoring', icon: '🚨' },
  { to: '/platform/activity', label: 'Activity Timeline', icon: '📜' },
  { to: '/platform/profile', label: 'Administrator Profile', icon: '👤' },
  { to: '/platform/help', label: 'Help Center', icon: '❓' },
];

export function PlatformLayout() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      return;
    }

    const imports = [
      import('../../pages/Platform/PlatformDashboardPage'),
      import('../../pages/Platform/PlatformCompaniesPage'),
      import('../../pages/Platform/PlatformPendingApprovalsPage'),
      import('../../pages/Platform/PlatformUsersPage'),
      import('../../pages/Platform/PlatformRolesPage'),
      import('../../pages/Platform/PlatformDeliveriesPage'),
      import('../../pages/Platform/PlatformDriversPage'),
      import('../../pages/Platform/PlatformPage'),
    ];

    const idleHandle = window.requestIdleCallback
      ? window.requestIdleCallback(() => void Promise.all(imports).catch(() => undefined))
      : window.setTimeout(() => void Promise.all(imports).catch(() => undefined), 1200);

    return () => {
      if (typeof idleHandle === 'number') {
        window.clearTimeout(idleHandle);
      }
    };
  }, [auth.isAuthenticated]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #020617 0%, #0d1220 50%, #111827 100%)', color: '#f8fafc' }}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{ width: collapsed ? 96 : 320, padding: collapsed ? '1.25rem 0.8rem' : '1.5rem 1.2rem', borderRight: '1px solid rgba(255,255,255,0.08)', background: 'rgba(3,7,18,0.9)', transition: 'width 220ms ease', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', boxShadow: '0 14px 26px rgba(56,189,248,0.22)' }}>🛡</div>
              {!collapsed && (
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>System Administration Console</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>Enterprise Platform Management</div>
                </div>
              )}
            </div>
            <button type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} style={{ width: 36, height: 36, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#f8fafc', cursor: 'pointer' }}>
              {collapsed ? '›' : '‹'}
            </button>
          </div>

          <nav style={{ display: 'grid', gap: '0.45rem' }}>
            {links.map((link) => {
              const isActive = location.pathname === link.to || (location.pathname.startsWith(link.to) && link.to !== '/platform');
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  title={collapsed ? link.label : undefined}
                  style={{
                    padding: collapsed ? '0.85rem' : '0.85rem 1rem',
                    borderRadius: 14,
                    textDecoration: 'none',
                    color: isActive ? '#f8fafc' : '#cbd5e1',
                    background: isActive ? 'rgba(56,189,248,0.18)' : 'transparent',
                    border: isActive ? '1px solid rgba(56,189,248,0.22)' : '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: collapsed ? 0 : '0.75rem',
                  }}
                >
                  <span style={{ fontSize: collapsed ? '1rem' : '0.95rem', lineHeight: 1 }}>{link.icon}</span>
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main style={{ flex: 1, padding: 'clamp(1rem, 2vw, 2rem)', overflowX: 'hidden' }}>
          <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
              <button
                type="button"
                onClick={() => navigate('/platform')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', padding: '0.55rem 0.8rem', borderRadius: 999, border: '1px solid rgba(125, 211, 252, 0.22)', background: 'rgba(125, 211, 252, 0.12)', color: '#e0f2fe', cursor: 'pointer', marginBottom: '0.7rem' }}
                aria-label="Back to workspace"
              >
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>←</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Back to workspace</span>
              </button>
              <p style={{ margin: 0, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.85rem' }}>System Administration Console</p>
              <h1 style={{ margin: '0.35rem 0 0', fontSize: 'clamp(1.8rem, 2.6vw, 2.6rem)' }}>Enterprise Platform Management</h1>
            </div>
            <div style={{ display: 'flex', gap: '0.8rem', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399' }} />
                <div style={{ color: '#cbd5e1', fontWeight: 700 }}>{auth.user?.name ?? 'System Owner'}</div>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>System Owner · Role: System Administrator</div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
