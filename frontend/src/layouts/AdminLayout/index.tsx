import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';

const navigationSections = [
  {
    title: 'Workspace',
    icon: '◉',
    groups: [
      {
        label: 'Overview',
        items: [
          { to: '/admin', label: 'Overview', icon: '◉' },
        ],
      },
    ],
  },
  {
    title: 'Organizations',
    icon: '🏢',
    groups: [
      {
        label: 'Governance',
        items: [
          { to: '/admin/organizations', label: 'Organizations', icon: '🏢' },
          { to: '/admin/organizations/pending-approvals', label: 'Pending Approvals', icon: '⏳' },
          { to: '/admin/organizations/approved', label: 'Approved', icon: '✓' },
          { to: '/admin/organizations/suspended', label: 'Suspended', icon: '⛔' },
        ],
      },
    ],
  },
  {
    title: 'Access & Security',
    icon: '🔐',
    groups: [
      {
        label: 'Control',
        items: [
          { to: '/admin/users', label: 'Users', icon: '👤' },
          { to: '/admin/roles', label: 'Roles', icon: '🛡' },
          { to: '/admin/security', label: 'Security Center', icon: '🔐' },
          { to: '/admin/audit-logs', label: 'Audit Logs', icon: '📋' },
        ],
      },
    ],
  },
  {
    title: 'Integration Center',
    icon: '🔗',
    groups: [
      {
        label: 'Developer platform',
        items: [
          { to: '/admin/api-keys', label: 'API Keys', icon: '⎈' },
          { to: '/admin/webhooks', label: 'Webhooks', icon: '📡' },
          { to: '/admin/reports', label: 'Reports', icon: '📊' },
        ],
      },
    ],
  },
  {
    title: 'Experience',
    icon: '✨',
    groups: [
      {
        label: 'Communication',
        items: [
          { to: '/admin/notifications', label: 'Notifications', icon: '🔔' },
          { to: '/admin/support', label: 'Support', icon: '💬' },
          { to: '/admin/customization', label: 'Customization', icon: '🎨' },
        ],
      },
    ],
  },
  {
    title: 'System',
    icon: '⚙',
    groups: [
      {
        label: 'Configuration',
        items: [
          { to: '/admin/settings', label: 'Settings', icon: '⚙' },
        ],
      },
    ],
  },
];


export function AdminLayout() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(() => navigationSections.map((section) => section.title));
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [prefetchedSettings, setPrefetchedSettings] = useState<{ name: string; status: string } | null>(null);

  const navigationItems = useMemo(
    () => navigationSections.flatMap((section) => section.groups.flatMap((group) => group.items)),
    [],
  );

  const isConsoleAdministrator = useMemo(() => {
    const roleNames = (auth.user?.roles || []).map((role: any) => role.name).filter(Boolean);
    const permissionNames = (auth.user?.roles || []).flatMap((role: any) => (Array.isArray(role.permissions) ? role.permissions.map((permission: any) => permission.name) : []));

    return Boolean(
      auth.user?.is_system_owner
      || roleNames.includes('System Owner')
      || roleNames.includes('System Administrator')
      || permissionNames.includes('manage.system')
      || permissionNames.includes('admin.access')
      || permissionNames.includes('manage.settings')
      || permissionNames.includes('manage.api_keys')
      || permissionNames.includes('view.audit_logs'),
    );
  }, [auth.user]);

  useEffect(() => {
    const storedFavorites = window.localStorage.getItem('console-favorites');

    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }

    const handleResize = () => {
      setMobileView(window.innerWidth < 980);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      return;
    }

    const imports = [
      import('../../pages/Admin/DashboardPage'),
      import('../../pages/Admin/ApiKeysPage'),
      import('../../pages/Admin/WebhooksPage'),
      import('../../pages/Admin/DriversPage'),
      import('../../pages/Admin/DeliveriesPage'),
      import('../../pages/Admin/CustomersPage'),
      import('../../pages/Admin/SettingsPage'),
      import('../../pages/Admin/UsersPage'),
      import('../../pages/Admin/SecurityCenterPage'),
      import('../../pages/Admin/RolesPage'),
      import('../../pages/Admin/AuditLogsPage'),
    ];

    const idleCallback = window.requestIdleCallback
      ? window.requestIdleCallback(() => Promise.all(imports).catch(() => undefined))
      : window.setTimeout(() => void Promise.all(imports).catch(() => undefined), 1200);

    return () => {
      if (typeof idleCallback === 'number') {
        window.clearTimeout(idleCallback);
      }
    };
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const activeSection = navigationSections.find((section) => section.groups.some((group) => group.items.some((item) => location.pathname === item.to || (item.to !== '/admin' && location.pathname.startsWith(item.to)))));
    if (activeSection) {
      setExpandedSections((prev) => (prev.includes(activeSection.title) ? prev : [...prev, activeSection.title]));
    }
  }, [location.pathname]);

  useEffect(() => {
    window.localStorage.setItem('console-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const prefetchSettings = useCallback(() => {
    import('../../pages/Admin/SettingsPage');

    if (!auth.user?.company_id || prefetchedSettings || !auth.hasPermission('manage.settings')) {
      return;
    }

    api
      .get('/v1/admin/settings')
      .then((response) => setPrefetchedSettings(response.data.data))
      .catch(() => {
        // ignore prefetch failures
      });
  }, [auth, prefetchedSettings]);

  const visibleSections = useMemo(() => navigationSections.map((section) => {
    const visibleGroups = section.groups.map((group) => {
      const visibleItems = group.items.filter((link) => {
        const matchesSearch = !search || link.label.toLowerCase().includes(search.toLowerCase());
        if (!matchesSearch) {
          return false;
        }

        if (link.to === '/admin/settings' && !auth.user?.company_id) {
          return false;
        }

        // Only show admin section links when the user is authenticated or has console-level privileges
        return Boolean(auth.isAuthenticated || auth.user || isConsoleAdministrator);
      });

      return { ...group, visibleItems };
    }).filter((group) => group.visibleItems.length > 0);

    return { ...section, visibleGroups };
  }).filter((section) => section.visibleGroups.length > 0), [auth.isAuthenticated, auth.user, isConsoleAdministrator, search]);

  const pinItem = (path: string) => {
    setFavorites((prev) => (prev.includes(path) ? prev.filter((item) => item !== path) : [...prev, path]));
  };

  const handleNavigate = (path: string) => {
    if (mobileView) {
      setMobileOpen(false);
    }
  };

  const breadcrumbItems = useMemo(() => {
    const current = navigationItems.find((item) => location.pathname === item.to || (item.to !== '/admin' && location.pathname.startsWith(item.to)));
    if (!current) {
      return [{ label: 'Home', to: '/admin' }];
    }

    return [{ label: 'System Administration Console', to: '/admin' }, { label: current.label }];
  }, [location.pathname]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #07111f 0%, #0f172a 45%, #111827 100%)', color: '#f8fafc' }}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{
          width: mobileView ? (mobileOpen ? 300 : 0) : (collapsed ? 88 : 300),
          padding: mobileView ? (mobileOpen ? '1.25rem 1rem' : '0') : (collapsed ? '1.25rem 0.8rem' : '1.4rem 1.1rem'),
          borderRight: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(2,6,23,0.92)',
          transition: 'width 220ms ease, padding 220ms ease, transform 220ms ease',
          flexShrink: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          position: mobileView ? 'fixed' : 'relative',
          height: '100vh',
          zIndex: 20,
          transform: mobileView && !mobileOpen ? 'translateX(-100%)' : 'translateX(0)',
          boxShadow: mobileView && mobileOpen ? '0 24px 70px rgba(0,0,0,0.28)' : 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', marginBottom: '1.25rem', position: 'sticky', top: 0, background: 'rgba(2,6,23,0.92)', zIndex: 1, paddingTop: '0.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ display: 'inline-flex', width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #60a5fa, #818cf8)', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(96,165,250,0.25)' }}>↗</div>
              {!collapsed && (
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>System Administration Console</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.2rem' }}>Enterprise Platform Management</div>
                  {auth.user && (
                    <div style={{ marginTop: '0.45rem', color: '#7dd3fc', fontSize: '0.82rem' }}>Signed in as System Administrator</div>
                  )}
                </div>
              )}
            </div>
            <button type="button" onClick={() => mobileView ? setMobileOpen((value) => !value) : setCollapsed((value) => !value)} aria-label={mobileView ? (mobileOpen ? 'Close sidebar' : 'Open sidebar') : (collapsed ? 'Expand sidebar' : 'Collapse sidebar')} style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#f8fafc', width: 36, height: 36, borderRadius: 10, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {mobileView ? (mobileOpen ? '✕' : '☰') : (collapsed ? '›' : '‹')}
            </button>
          </div>

          {!collapsed && (
            <div style={{ marginBottom: '0.9rem' }}>
              <label htmlFor="console-search" style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#64748b' }}>Find a page</label>
              <input id="console-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search navigation" style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#f8fafc', padding: '0.7rem 0.8rem' }} />
            </div>
          )}

          {favorites.length > 0 && !collapsed && (
            <div style={{ marginBottom: '0.8rem' }}>
              <div style={{ marginBottom: '0.35rem', padding: '0.2rem 0.25rem', fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#64748b' }}>Pinned pages</div>
              <div style={{ display: 'grid', gap: '0.32rem' }}>
                {favorites.map((path) => {
                  const match = navigationItems.find((item) => item.to === path);
                  if (!match) {
                    return null;
                  }

                  return (
                    <Link key={match.to} to={match.to} onClick={() => handleNavigate(match.to)} style={{ padding: '0.7rem 0.8rem', borderRadius: 12, textDecoration: 'none', color: '#f8fafc', background: 'rgba(59,130,246,0.16)', border: '1px solid rgba(96,165,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{match.label}</span>
                      <span>★</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {!collapsed && (
            <div style={{ marginBottom: '0.95rem', padding: '0.9rem', borderRadius: 16, background: 'linear-gradient(135deg, rgba(59,130,246,0.16), rgba(129,140,248,0.12))', border: '1px solid rgba(96,165,250,0.2)' }}>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7dd3fc', marginBottom: '0.4rem' }}>Console status</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Integration services are online</div>
              <div style={{ marginTop: '0.36rem', color: '#cbd5e1', fontSize: '0.9rem' }}>All integration modules remain active and monitored.</div>
            </div>
          )}

          <nav style={{ display: 'grid', gap: '0.55rem', paddingBottom: '1rem' }} aria-label="Console navigation">
            {visibleSections.map((section) => {
              const isExpanded = expandedSections.includes(section.title);
              return (
                <div key={section.title}>
                  {!collapsed && (
                    <button type="button" onClick={() => setExpandedSections((prev) => prev.includes(section.title) ? prev.filter((entry) => entry !== section.title) : [...prev, section.title])} style={{ width: '100%', marginBottom: '0.35rem', padding: '0.5rem 0.25rem', border: 'none', background: 'transparent', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left', fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase' }} aria-expanded={isExpanded}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span>{section.icon}</span>
                        <span>{section.title}</span>
                      </span>
                      <span>{isExpanded ? '▾' : '▸'}</span>
                    </button>
                  )}
                  {(!collapsed && isExpanded) && (
                    <div style={{ display: 'grid', gap: '0.35rem' }}>
                      {section.visibleGroups.map((group) => (
                        <div key={group.label}>
                          {group.label && (
                            <div style={{ margin: '0.15rem 0 0.25rem 0.1rem', fontSize: '0.64rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#64748b' }}>{group.label}</div>
                          )}
                          <div style={{ display: 'grid', gap: '0.32rem' }}>
                            {group.visibleItems.map((link) => {
                              const isActive = location.pathname === link.to || (link.to !== '/admin' && location.pathname.startsWith(link.to));
                              const isFavorite = favorites.includes(link.to);
                              return (
                                <div key={link.to + link.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <Link
                                    to={link.to}
                                    title={collapsed ? link.label : undefined}
                                    state={link.to === '/admin/settings' ? { prefetchedSettings } : undefined}
                                    onMouseEnter={link.to === '/admin/settings' ? prefetchSettings : undefined}
                                    onFocus={link.to === '/admin/settings' ? prefetchSettings : undefined}
                                    onClick={() => handleNavigate(link.to)}
                                    style={{
                                      flex: 1,
                                      padding: collapsed ? '0.75rem' : '0.7rem 0.8rem',
                                      paddingLeft: collapsed ? '0.75rem' : '1.1rem',
                                      borderRadius: 12,
                                      textDecoration: 'none',
                                      color: isActive ? '#f8fafc' : '#cbd5e1',
                                      background: isActive ? 'rgba(59,130,246,0.2)' : 'transparent',
                                      border: isActive ? '1px solid rgba(96,165,250,0.25)' : '1px solid transparent',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: collapsed ? 'center' : 'flex-start',
                                      gap: collapsed ? 0 : '0.62rem',
                                      transition: 'all 180ms ease',
                                      marginLeft: collapsed ? 0 : '0.4rem',
                                    }}
                                  >
                                    <span style={{ fontSize: collapsed ? '1rem' : '0.9rem', lineHeight: 1 }}>{link.icon}</span>
                                    {!collapsed && <span>{link.label}</span>}
                                  </Link>
                                  {!collapsed && (
                                    <button type="button" aria-label={isFavorite ? `Unpin ${link.label}` : `Pin ${link.label}`} onClick={() => pinItem(link.to)} style={{ width: 30, height: 30, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: isFavorite ? '#fbbf24' : '#94a3b8', cursor: 'pointer' }}>
                                      {isFavorite ? '★' : '☆'}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>


          <button
            type="button"
            onClick={auth.logout}
            style={{ marginTop: '1.5rem', width: '100%', padding: collapsed ? '0.8rem' : '0.8rem 1rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: collapsed ? 0 : '0.55rem' }}
          >
            <span>{collapsed ? '⇥' : '↩'}</span>
            {!collapsed && <span>Sign out</span>}
          </button>
        </aside>

        <main style={{ flex: 1, padding: 'clamp(1rem, 2vw, 2rem)', display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
          <header style={{ padding: '1.1rem 1.25rem', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', padding: '0.55rem 0.8rem', borderRadius: 999, border: '1px solid rgba(125, 211, 252, 0.22)', background: 'rgba(125, 211, 252, 0.12)', color: '#e0f2fe', cursor: 'pointer', marginBottom: '0.7rem' }}
                aria-label="Back to workspace"
              >
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>←</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Back to workspace</span>
              </button>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', color: '#7dd3fc', fontSize: '0.86rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                {breadcrumbItems.map((item, index) => (
                  <React.Fragment key={item.label}>
                    {index > 0 && <span>/</span>}
                    {item.to ? <Link to={item.to} style={{ color: 'inherit', textDecoration: 'none' }}>{item.label}</Link> : <span>{item.label}</span>}
                  </React.Fragment>
                ))}
              </div>
              <h1 style={{ margin: '0.2rem 0 0', fontSize: '1.35rem' }}>Integration Center</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              {mobileView && (
                <button type="button" onClick={() => setMobileOpen((value) => !value)} style={{ padding: '0.7rem 0.8rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#f8fafc', cursor: 'pointer' }}>Open navigation</button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.85rem', borderRadius: 999, background: 'rgba(34,197,94,0.14)', color: '#bbf7d0', border: '1px solid rgba(34,197,94,0.2)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
                Live sync enabled
              </div>
            </div>
          </header>

          <div style={{ flex: 1, marginTop: '1.5rem' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
