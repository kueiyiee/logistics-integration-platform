import React, { useEffect, useState } from 'react';
import { fetchPlatformDrivers } from '../../services/auth';

export function PlatformDriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchPlatformDrivers();
        setDrivers(response || []);
      } catch (cause: any) {
        setError(cause?.message || 'Unable to load drivers.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <section style={{ padding: '1.4rem', borderRadius: 28, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ margin: 0, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: '0.8rem' }}>Driver management</p>
        <h2 style={{ margin: '0.75rem 0 0', fontSize: 'clamp(1.8rem, 2.4vw, 2.2rem)' }}>Platform-wide driver pool</h2>
        <p style={{ margin: '0.85rem 0 0', color: '#cbd5e1', maxWidth: 760, lineHeight: 1.7 }}>Track drivers across all tenant companies and review their current status from the System Administration Console.</p>
      </section>

      <section style={{ padding: '1rem', borderRadius: 26, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {loading ? (
          <div style={{ padding: '2rem', color: '#cbd5e1' }}>Loading drivers…</div>
        ) : error ? (
          <div style={{ padding: '2rem', color: '#fecaca' }}>{error}</div>
        ) : drivers.length === 0 ? (
          <div style={{ padding: '2rem', color: '#cbd5e1' }}>No drivers available yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '1rem 0.75rem' }}>Driver</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Company</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Vehicle</th>
                  <th style={{ padding: '1rem 0.75rem' }}>License</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '0.95rem 0.75rem', color: '#f8fafc', fontWeight: 700 }}>{driver.name}</td>
                    <td style={{ padding: '0.95rem 0.75rem', color: '#cbd5e1' }}>{driver.company?.name ?? 'Platform'}</td>
                    <td style={{ padding: '0.95rem 0.75rem', color: '#cbd5e1' }}>{driver.vehicle_type}</td>
                    <td style={{ padding: '0.95rem 0.75rem', color: '#cbd5e1' }}>{driver.license_number}</td>
                    <td style={{ padding: '0.95rem 0.75rem' }}>
                      <span style={{ padding: '0.35rem 0.75rem', borderRadius: 999, fontSize: '0.85rem', background: 'rgba(34,197,94,0.14)', color: '#bbf7d0' }}>{driver.status}</span>
                    </td>
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
