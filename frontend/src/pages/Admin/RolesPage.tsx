import React, { useEffect, useState } from 'react';
import { fetchRoles, fetchPermissions, fetchUsers, assignRoleToUser, removeRoleFromUser } from '../../services/auth';
import { ConsolePageHeader } from '../../components/ConsolePageHeader';

export function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    fetchRoles().then(setRoles);
    fetchPermissions().then(setPermissions);
    fetchUsers().then(setUsers);
  }, []);

  const addRole = async () => {
    if (!selectedUserId || !selectedRole) {
      return;
    }

    const updatedUser = await assignRoleToUser(selectedUserId, selectedRole);
    setUsers((prev) => prev.map((user) => (user.id === selectedUserId ? updatedUser : user)));
    setSelectedRole('');
  };

  const removeRole = async (userId: number, roleId: number) => {
    await removeRoleFromUser(userId, roleId);
    setUsers((prev) => prev.map((user) => ({
      ...user,
      roles: user.roles.filter((role: any) => role.id !== roleId),
    })));
  };

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <ConsolePageHeader
        title="Roles & Permissions"
        subtitle="Define access control, role boundaries, and administrative privileges for the platform."
        breadcrumbs={[{ label: 'System Administration Console', to: '/admin' }, { label: 'Users & Access' }]}
      />

      <section style={{ padding: '1.1rem', borderRadius: 24, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 style={{ margin: '0 0 0.8rem', color: '#f8fafc' }}>Roles</h3>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {roles.map((role) => (
            <div key={role.id} style={{ padding: '1rem', borderRadius: 18, background: 'rgba(2,6,23,0.72)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontWeight: 700, color: '#f8fafc' }}>{role.name}</div>
              <div style={{ marginTop: '0.35rem', color: '#94a3b8' }}>{role.description}</div>
              <div style={{ marginTop: '0.6rem', color: '#cbd5e1' }}>Permissions: {role.permissions.map((permission: any) => permission.name).join(', ')}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '1.1rem', borderRadius: 24, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 style={{ margin: '0 0 0.8rem', color: '#f8fafc' }}>User role assignments</h3>
        <div style={{ maxWidth: 560, display: 'grid', gap: '1rem' }}>
          <select value={selectedUserId ?? ''} onChange={(event) => setSelectedUserId(Number(event.target.value))} style={{ padding: '0.75rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }}>
            <option value="">Select user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
          <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} style={{ padding: '0.75rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }}>
            <option value="">Select role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>{role.name}</option>
            ))}
          </select>
          <button type="button" onClick={addRole} style={{ padding: '0.75rem', background: 'linear-gradient(135deg, #60a5fa, #818cf8)', color: 'white', border: 'none', cursor: 'pointer', width: 170, borderRadius: 14 }}>
            Assign role
          </button>
        </div>
      </section>

      <section style={{ padding: '1.1rem', borderRadius: 24, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 style={{ margin: '0 0 0.8rem', color: '#f8fafc' }}>All permissions</h3>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {permissions.map((permission) => (
            <div key={permission.id} style={{ padding: '1rem', borderRadius: 18, background: 'rgba(2,6,23,0.72)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontWeight: 700, color: '#f8fafc' }}>{permission.name}</div>
              <div style={{ marginTop: '0.35rem', color: '#94a3b8' }}>{permission.description}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
