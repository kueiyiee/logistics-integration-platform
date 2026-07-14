import React, { useEffect, useState } from 'react';
import { fetchAuditLogs, fetchSecurityMetrics } from '../../services/auth';
import { ConsolePageHeader } from '../../components/ConsolePageHeader';

export function SecurityCenterPage() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchAuditLogs().then(setAuditLogs);
    fetchSecurityMetrics().then((data) => setMetrics(data.metrics));
  }, []);

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <ConsolePageHeader
        title="Security Center"
        subtitle="Monitor access, audit events, and platform risk with a unified security control surface."
        breadcrumbs={[{ label: 'System Administration Console', to: '/admin' }, { label: 'Identity & Security' }]}
        actions={<div style={{ padding: '0.75rem 1rem', borderRadius: 16, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.2)', color: '#fecaca' }}>Critical actions and audit events</div>}
      />

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ padding: '1.2rem', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ margin: '0 0 0.8rem' }}>Security metrics</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span style={{ color: '#cbd5e1' }}>Total audit events</span>
              <strong>{auditLogs.length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span style={{ color: '#cbd5e1' }}>API keys</span>
              <strong>{metrics.api_keys ?? 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span style={{ color: '#cbd5e1' }}>Webhook endpoints</span>
              <strong>{metrics.webhooks ?? 0}</strong>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.2rem', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ margin: '0 0 0.8rem' }}>Risk indicators</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ padding: '0.9rem', borderRadius: 18, background: 'rgba(248,113,113,0.08)' }}>
              <strong>Unreviewed audit events</strong>
              <p style={{ margin: '0.5rem 0 0', color: '#cbd5e1' }}>Review the latest system activity for unusual behavior.</p>
            </div>
            <div style={{ padding: '0.9rem', borderRadius: 18, background: 'rgba(59,130,246,0.08)' }}>
              <strong>Privileged access</strong>
              <p style={{ margin: '0.5rem 0 0', color: '#cbd5e1' }}>Roles and permission changes should be audited regularly.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '1.2rem', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ margin: '0 0 1rem' }}>Recent audit activity</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {auditLogs.length === 0 ? (
            <div style={{ color: '#cbd5e1' }}>No audit entries available yet.</div>
          ) : (
            auditLogs.slice(0, 8).map((log) => (
              <div key={log.id} style={{ padding: '1rem', borderRadius: 20, background: 'rgba(2,6,23,0.72)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div style={{ fontWeight: 700 }}>{log.action}</div>
                  <div style={{ color: '#94a3b8' }}>{new Date(log.created_at).toLocaleString()}</div>
                </div>
                <div style={{ marginTop: '0.75rem', color: '#cbd5e1' }}>User: {log.user?.name ?? 'System'}</div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
