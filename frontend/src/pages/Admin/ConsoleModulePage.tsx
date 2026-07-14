import React, { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface ConsoleModulePageProps {
  title: string;
  description: string;
  summary: string;
  highlights: string[];
  actions?: string[];
}

export function ConsoleModulePage({ title, description, summary, highlights, actions = ['Review status', 'Open controls', 'Manage policies'] }: ConsoleModulePageProps) {
  const auth = useAuth();

  const isAuthorized = useMemo(() => {
    if (auth.loading || !auth.isAuthenticated) {
      return false;
    }

    const roleNames = (auth.user?.roles || []).map((role: any) => role.name).filter(Boolean);
    const permissionNames = (auth.user?.roles || []).flatMap((role: any) => (Array.isArray(role.permissions) ? role.permissions.map((permission: any) => permission.name) : []));

    return Boolean(
      auth.user?.is_system_owner
      || roleNames.includes('System Owner')
      || roleNames.includes('System Administrator')
      || permissionNames.includes('manage.system')
      || permissionNames.includes('admin.access')
      || permissionNames.includes('manage.settings')
    );
  }, [auth.isAuthenticated, auth.loading, auth.user]);

  const validationChecks = useMemo(() => [
    {
      label: 'Authentication',
      value: auth.loading ? 'Checking…' : auth.isAuthenticated ? 'Verified' : 'Signed out',
      okay: Boolean(auth.isAuthenticated && !auth.loading),
    },
    {
      label: 'Authorization',
      value: isAuthorized ? 'Granted' : 'Restricted',
      okay: isAuthorized,
    },
    {
      label: 'Module content',
      value: title.trim() && description.trim() && summary.trim() && highlights.length > 0 ? 'Ready' : 'Incomplete',
      okay: Boolean(title.trim() && description.trim() && summary.trim() && highlights.length > 0),
    },
    {
      label: 'Action list',
      value: actions.length > 0 ? 'Ready' : 'Empty',
      okay: actions.length > 0,
    },
  ], [actions.length, auth.isAuthenticated, auth.loading, description, highlights.length, isAuthorized, summary, title]);

  const metrics = useMemo(() => [
    {
      label: 'Access state',
      value: auth.loading ? 'Checking' : auth.isAuthenticated ? 'Active' : 'Signed out',
      trend: isAuthorized ? 'Authorized' : 'Review required',
    },
    {
      label: 'Validation',
      value: `${validationChecks.filter((check) => check.okay).length}/${validationChecks.length}`,
      trend: validationChecks.every((check) => check.okay) ? 'All checks passed' : 'Needs attention',
    },
    {
      label: 'Available actions',
      value: `${actions.length}`,
      trend: 'Ready to use',
    },
  ], [actions.length, auth.isAuthenticated, auth.loading, isAuthorized, validationChecks]);

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <section style={{ padding: '1.4rem', borderRadius: 28, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ margin: 0, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: '0.78rem' }}>System administration</p>
        <h2 style={{ margin: '0.75rem 0 0', fontSize: 'clamp(1.8rem, 2.4vw, 2.2rem)' }}>{title}</h2>
        <p style={{ margin: '0.8rem 0 0', color: '#cbd5e1', maxWidth: 760, lineHeight: 1.7 }}>{description}</p>
      </section>

      <section style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {metrics.map((metric) => (
          <div key={metric.label} style={{ padding: '1.05rem', borderRadius: 22, background: 'rgba(15,23,42,0.86)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.35rem' }}>{metric.label}</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#f8fafc' }}>{metric.value}</div>
            <div style={{ marginTop: '0.35rem', color: '#7dd3fc', fontSize: '0.84rem' }}>{metric.trend}</div>
          </div>
        ))}
      </section>

      <section style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1.15fr 0.85fr' }}>
        <div style={{ padding: '1.1rem', borderRadius: 24, background: 'rgba(15,23,42,0.82)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ margin: '0 0 0.6rem', color: '#f8fafc' }}>Operational summary</h3>
          <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7 }}>{summary}</p>

          <div style={{ marginTop: '1rem', display: 'grid', gap: '0.8rem' }}>
            {highlights.map((item, index) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: index % 2 === 0 ? '#38bdf8' : '#34d399' }} />
                <div style={{ color: '#e2e8f0' }}>{item}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '1.1rem', borderRadius: 24, background: 'rgba(15,23,42,0.82)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ margin: '0 0 0.7rem', color: '#f8fafc' }}>Validation checks</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {validationChecks.map((check) => (
              <div key={check.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem', padding: '0.7rem 0.8rem', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: `1px solid ${check.okay ? 'rgba(52,211,153,0.24)' : 'rgba(248,113,113,0.24)'}` }}>
                <div>
                  <div style={{ color: '#f8fafc', fontWeight: 600 }}>{check.label}</div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.2rem' }}>{check.value}</div>
                </div>
                <span style={{ color: check.okay ? '#34d399' : '#f87171', fontWeight: 700 }}>{check.okay ? 'PASS' : 'WARN'}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '1.1rem', borderRadius: 24, background: 'rgba(31,41,55,0.92)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {actions.map((action) => (
            <span key={action} style={{ padding: '0.6rem 0.9rem', borderRadius: 999, background: 'rgba(56,189,248,0.12)', color: '#7dd3fc', border: '1px solid rgba(56,189,248,0.2)', fontSize: '0.92rem' }}>{action}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
