import React, { useEffect, useState } from 'react';
import { fetchPlatformPermissions, fetchPlatformRoles } from '../../services/auth';

export function PlatformRolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [roleData, permissionData] = await Promise.all([fetchPlatformRoles(), fetchPlatformPermissions()]);
      setRoles(roleData || []);
      setPermissions(permissionData || []);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <section style={{ padding: '1.4rem', borderRadius: 28, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ margin: 0, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: '0.8rem' }}>Global roles</p>
        <h2 style={{ margin: '0.75rem 0 0', fontSize: 'clamp(1.8rem, 2.4vw, 2.2rem)' }}>Platform roles & permissions</h2>
        <p style={{ margin: '0.85rem 0 0', color: '#cbd5e1', maxWidth: 760, lineHeight: 1.7 }}>Review roles and permission groups that can be applied across the entire platform.</p>
      </section>

      <section style={{ padding: '1rem', borderRadius: 26, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {loading ? (
          <div style={{ padding: '2rem', color: '#cbd5e1' }}>Loading roles and permissions…</div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ margin: '0 0 0.8rem' }}>Roles</h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {roles.map((role) => (
                    <div key={role.id} style={{ padding: '0.85rem', borderRadius: 16, background: 'rgba(31,41,55,0.92)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{role.name}</div>
                      <div style={{ marginTop: '0.45rem', color: '#94a3b8', fontSize: '0.92rem' }}>{role.description ?? 'No description available'}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '1rem', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ margin: '0 0 0.8rem' }}>Permissions</h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {permissions.map((permission) => (
                    <div key={permission.id} style={{ padding: '0.85rem', borderRadius: 16, background: 'rgba(31,41,55,0.92)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{permission.name}</div>
                      <div style={{ marginTop: '0.45rem', color: '#94a3b8', fontSize: '0.92rem' }}>{permission.description ?? 'No description available'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
