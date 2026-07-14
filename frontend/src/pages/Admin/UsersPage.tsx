import React, { useEffect, useState } from 'react';
import { createUser, fetchUsers, fetchRoles, assignRoleToUser, removeRoleFromUser } from '../../services/auth';
import { ConsolePageHeader } from '../../components/ConsolePageHeader';

export function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'client' });

  async function load() {
    setLoading(true);
    const [u, r] = await Promise.all([fetchUsers(), fetchRoles()]);
    setUsers(u || []);
    setRoles(r || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAssign(userId: number, role: string) {
    await assignRoleToUser(userId, role);
    await load();
  }

  async function handleRemove(userId: number, roleId: number) {
    await removeRoleFromUser(userId, roleId);
    await load();
  }

  async function handleCreateUser(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setCreateError('');
    setCreateSuccess('');

    try {
      await createUser(createForm);
      setCreateSuccess('User created successfully.');
      setCreateForm({ name: '', email: '', password: '', password_confirmation: '', role: 'client' });
      setShowCreateForm(false);
      await load();
    } catch (error: any) {
      setCreateError(error?.message || 'Unable to create user right now.');
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <div style={{ display: 'grid', gap: '1rem' }}><ConsolePageHeader title="Users" subtitle="Manage administrative and standard user access across the platform." breadcrumbs={[{ label: 'System Administration Console', to: '/admin' }, { label: 'Users & Access' }]} /><div style={{ padding: '1rem', color: '#cbd5e1' }}>Loading users…</div></div>;

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <ConsolePageHeader
        title="Users"
        subtitle="Manage account access, role assignments, and system-level user administration."
        breadcrumbs={[{ label: 'System Administration Console', to: '/admin' }, { label: 'Users & Access' }]}
        actions={<button type="button" onClick={() => setShowCreateForm((value) => !value)} style={{ padding: '0.75rem 1rem', borderRadius: 14, border: '1px solid rgba(96,165,250,0.24)', background: 'rgba(59,130,246,0.16)', color: '#bfdbfe', cursor: 'pointer' }}>{showCreateForm ? 'Hide form' : 'Add user'}</button>}
      />

      {showCreateForm && (
        <section style={{ padding: '1rem', borderRadius: 24, background: 'rgba(2,6,23,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ margin: '0 0 0.8rem', color: '#f8fafc' }}>Create new user</h3>
          <form onSubmit={handleCreateUser} style={{ display: 'grid', gap: '0.85rem', maxWidth: 720 }}>
            <div style={{ display: 'grid', gap: '0.7rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <label style={{ display: 'grid', gap: '0.35rem', color: '#cbd5e1' }}>
                <span>Full name</span>
                <input required value={createForm.name} onChange={(event) => setCreateForm((value) => ({ ...value, name: event.target.value }))} style={{ padding: '0.75rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#f8fafc' }} />
              </label>
              <label style={{ display: 'grid', gap: '0.35rem', color: '#cbd5e1' }}>
                <span>Email address</span>
                <input required type="email" value={createForm.email} onChange={(event) => setCreateForm((value) => ({ ...value, email: event.target.value }))} style={{ padding: '0.75rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#f8fafc' }} />
              </label>
              <label style={{ display: 'grid', gap: '0.35rem', color: '#cbd5e1' }}>
                <span>Role</span>
                <select value={createForm.role} onChange={(event) => setCreateForm((value) => ({ ...value, role: event.target.value }))} style={{ padding: '0.75rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#f8fafc' }}>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ display: 'grid', gap: '0.7rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <label style={{ display: 'grid', gap: '0.35rem', color: '#cbd5e1' }}>
                <span>Password</span>
                <input required minLength={8} type="password" value={createForm.password} onChange={(event) => setCreateForm((value) => ({ ...value, password: event.target.value }))} style={{ padding: '0.75rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#f8fafc' }} />
              </label>
              <label style={{ display: 'grid', gap: '0.35rem', color: '#cbd5e1' }}>
                <span>Confirm password</span>
                <input required minLength={8} type="password" value={createForm.password_confirmation} onChange={(event) => setCreateForm((value) => ({ ...value, password_confirmation: event.target.value }))} style={{ padding: '0.75rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#f8fafc' }} />
              </label>
            </div>
            {createError && <div style={{ color: '#fecaca' }}>{createError}</div>}
            {createSuccess && <div style={{ color: '#bbf7d0' }}>{createSuccess}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="submit" disabled={creating} style={{ padding: '0.75rem 1rem', borderRadius: 14, border: '1px solid rgba(96,165,250,0.24)', background: 'linear-gradient(135deg, #60a5fa, #818cf8)', color: 'white', cursor: 'pointer' }}>{creating ? 'Creating…' : 'Create user'}</button>
              <button type="button" onClick={() => setShowCreateForm(false)} style={{ padding: '0.75rem 1rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </section>
      )}

      <section style={{ padding: '1rem', borderRadius: 24, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '0.95rem 0.75rem' }}>Name</th>
                <th style={{ padding: '0.95rem 0.75rem' }}>Email</th>
                <th style={{ padding: '0.95rem 0.75rem' }}>Roles</th>
                <th style={{ padding: '0.95rem 0.75rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '0.95rem 0.75rem', color: '#f8fafc' }}>{user.name}</td>
                  <td style={{ padding: '0.95rem 0.75rem', color: '#cbd5e1' }}>{user.email}</td>
                  <td style={{ padding: '0.95rem 0.75rem', color: '#cbd5e1' }}>{(user.roles || []).map((r: any) => r.name).join(', ') || 'No roles'}</td>
                  <td style={{ padding: '0.95rem 0.75rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <select onChange={(e) => handleAssign(user.id, e.target.value)} defaultValue="" style={{ padding: '0.55rem 0.75rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }}>
                        <option value="">Assign role…</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.name}>{role.name}</option>
                        ))}
                      </select>
                      {(user.roles || []).map((r: any) => (
                        <button key={r.id} onClick={() => handleRemove(user.id, r.id)} style={{ padding: '0.55rem 0.75rem', borderRadius: 12, border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.12)', color: '#fecaca', cursor: 'pointer' }}>
                          Remove {r.name}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
