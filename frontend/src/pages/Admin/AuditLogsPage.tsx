import React, { useEffect, useState } from 'react';
import { fetchAuditLogs } from '../../services/auth';
import { ConsolePageHeader } from '../../components/ConsolePageHeader';

export function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchAuditLogs().then((data) => setLogs(data));
  }, []);

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <ConsolePageHeader
        title="Audit Logs"
        subtitle="Inspect recent audit events, user activity, and security events for your organization."
        breadcrumbs={[{ label: 'System Administration Console', to: '/admin' }, { label: 'Identity & Security' }]}
        actions={<button type="button" style={{ padding: '0.75rem 1rem', borderRadius: 14, border: '1px solid rgba(96,165,250,0.24)', background: 'rgba(59,130,246,0.16)', color: '#bfdbfe', cursor: 'pointer' }}>Export audit trail</button>}
      />

      <section style={{ display: 'grid', gap: '1rem' }}>
        {logs.length === 0 ? (
          <div style={{ padding: '1rem', borderRadius: 20, background: 'rgba(2,6,23,0.72)', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1' }}>
            No audit events recorded yet.
          </div>
        ) : (
          logs.map((log) => (
            <article key={log.id} style={{ padding: '1.25rem', borderRadius: 20, background: 'rgba(2,6,23,0.72)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1rem' }}>{log.action}</h2>
                  <p style={{ margin: '0.35rem 0 0', color: '#94a3b8' }}>{log.metadata?.description ?? 'Security or admin event recorded'}</p>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{new Date(log.created_at).toLocaleString()}</div>
              </div>
              <div style={{ marginTop: '0.85rem', color: '#cbd5e1' }}>
                User: {log.user?.name ?? 'System'} · Scope: {log.metadata?.scope ?? 'global'}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
