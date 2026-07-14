import React, { useEffect, useState } from 'react';
import { assignPlatformRoleToUser, fetchPlatformRoles, fetchPlatformUsers, removePlatformRoleFromUser } from '../../services/auth';

export function PlatformUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Record<number, string>>({});

  const load = async () => {
    setLoading(true);
    const [userData, roleData] = await Promise.all([fetchPlatformUsers(), fetchPlatformRoles()]);
    setUsers(userData || []);
    setRoles(roleData || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAssign = async (userId: number) => {
    const role = selectedRole[userId];
    if (!role) return;
    await assignPlatformRoleToUser(userId, role);
    await load();
  };

  const handleRemove = async (userId: number, roleId: number) => {
    await removePlatformRoleFromUser(userId, roleId);
    await load();
  };

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <section style={{ padding: '1.4rem', borderRadius: 28, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ margin: 0, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: '0.8rem' }}>Platform users</p>
        <h2 style={{ margin: '0.75rem 0 0', fontSize: 'clamp(1.8rem, 2.4vw, 2.2rem)' }}>Manage everyone on the platform</h2>
        <p style={{ margin: '0.85rem 0 0', color: '#cbd5e1', maxWidth: 760, lineHeight: 1.7 }}>Assign roles across the platform and review user access for every company and team.</p>
      </section>

      <section style={{ padding: '1rem', borderRadius: 26, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {loading ? (
          <div style={{ padding: '2rem', color: '#cbd5e1' }}>Loading users…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '1rem 0.8rem' }}>Name</th>
                  <th style={{ padding: '1rem 0.8rem' }}>Email</th>
                  <th style={{ padding: '1rem 0.8rem' }}>Company</th>
                  <th style={{ padding: '1rem 0.8rem' }}>Roles</th>
                  <th style={{ padding: '1rem 0.8rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '0.95rem 0.8rem', color: '#f8fafc' }}>{user.name}</td>
                    <td style={{ padding: '0.95rem 0.8rem', color: '#cbd5e1' }}>{user.email}</td>
                    <td style={{ padding: '0.95rem 0.8rem', color: '#cbd5e1' }}>{user.company?.name ?? 'Platform'}</td>
                    <td style={{ padding: '0.95rem 0.8rem' }}>
                      {(user.roles || []).map((role: any) => (
                        <span key={role.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.4rem', marginBottom: '0.35rem', padding: '0.3rem 0.55rem', borderRadius: 999, background: 'rgba(59,130,246,0.16)', color: '#93c5fd', fontSize: '0.85rem' }}>{role.name}</span>
                      ))}
                    </td>
                    <td style={{ padding: '0.95rem 0.8rem' }}>
                      <div style={{ display: 'grid', gap: '0.6rem' }}>
                        <select
                          value={selectedRole[user.id] ?? ''}
                          onChange={(event) => setSelectedRole((prev) => ({ ...prev, [user.id]: event.target.value }))}
                          style={{ padding: '0.72rem 0.85rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#f8fafc' }}
                        >
                          <option value="">Assign role…</option>
                          {roles.map((role) => (
                            <option key={role.id} value={role.name}>{role.name}</option>
                          ))}
                        </select>
                        <button type="button" onClick={() => handleAssign(user.id)} style={{ padding: '0.65rem 0.9rem', borderRadius: 14, background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.26)', color: '#bfdbfe', cursor: 'pointer' }}>Assign</button>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {(user.roles || []).map((role: any) => (
                            <button key={role.id} type="button" onClick={() => handleRemove(user.id, role.id)} style={{ padding: '0.5rem 0.75rem', borderRadius: 12, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.2)', color: '#fecaca', cursor: 'pointer' }}>
                              Remove {role.name}
                            </button>
                          ))}
                        </div>
                      </div>
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
