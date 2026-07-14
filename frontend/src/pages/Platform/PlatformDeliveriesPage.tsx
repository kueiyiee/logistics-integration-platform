import React, { useEffect, useState } from 'react';
import { fetchPlatformDeliveries } from '../../services/auth';

export function PlatformDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPlatformDeliveries();
        setDeliveries(data || []);
      } catch (cause: any) {
        setError(cause?.message || 'Unable to load deliveries.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <section style={{ padding: '1.4rem', borderRadius: 28, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ margin: 0, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: '0.8rem' }}>Global deliveries</p>
        <h2 style={{ margin: '0.75rem 0 0', fontSize: 'clamp(1.8rem, 2.4vw, 2.2rem)' }}>Platform-wide delivery overview</h2>
        <p style={{ margin: '0.85rem 0 0', color: '#cbd5e1', maxWidth: 760, lineHeight: 1.7 }}>Monitor delivery performance across every tenant company in the platform.</p>
      </section>

      <section style={{ padding: '1rem', borderRadius: 26, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {loading ? (
          <div style={{ padding: '2rem', color: '#cbd5e1' }}>Loading delivery summary…</div>
        ) : error ? (
          <div style={{ padding: '2rem', color: '#fecaca' }}>{error}</div>
        ) : deliveries.length === 0 ? (
          <div style={{ padding: '2rem', color: '#cbd5e1' }}>No delivery data available.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '1rem 0.75rem' }}>Tracking</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Company</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Status</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Reference</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery) => (
                  <tr key={delivery.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '0.95rem 0.75rem', color: '#f8fafc', fontWeight: 700 }}>{delivery.tracking_number}</td>
                    <td style={{ padding: '0.95rem 0.75rem', color: '#cbd5e1' }}>{delivery.company?.name ?? 'Platform'}</td>
                    <td style={{ padding: '0.95rem 0.75rem' }}>
                      <span style={{ padding: '0.35rem 0.75rem', borderRadius: 999, fontSize: '0.85rem', background: 'rgba(56,189,248,0.12)', color: '#7dd3fc' }}>{delivery.status}</span>
                    </td>
                    <td style={{ padding: '0.95rem 0.75rem', color: '#cbd5e1' }}>{delivery.external_reference ?? '—'}</td>
                    <td style={{ padding: '0.95rem 0.75rem', color: '#cbd5e1' }}>{delivery.created_at ? new Date(delivery.created_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
