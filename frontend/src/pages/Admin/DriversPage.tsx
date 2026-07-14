import React, { useEffect, useState } from 'react';
import { createDriver, fetchDrivers } from '../../services/auth';

export function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', vehicle_type: '', vehicle_number: '', license_number: '', notes: '', status: 'active' });

  useEffect(() => {
    fetchDrivers().then((data) => setDrivers(data));
  }, []);

  const submit = async () => {
    const response = await createDriver(formState);
    setDrivers((prev) => [response, ...prev]);
    setFormState({ name: '', email: '', phone: '', vehicle_type: '', vehicle_number: '', license_number: '', notes: '', status: 'active' });
  };

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <section style={{ padding: 'clamp(1.1rem, 2vw, 1.4rem)', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ margin: 0, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '0.8rem' }}>Fleet operations</p>
        <h1 style={{ margin: '0.35rem 0 0', fontSize: 'clamp(1.35rem, 2.2vw, 1.75rem)' }}>Drivers</h1>
        <p style={{ margin: '0.45rem 0 0', color: '#cbd5e1', lineHeight: 1.7 }}>Maintain the delivery team roster with clear profile details, contact information, and license tracking.</p>
      </section>

      <section style={{ padding: 'clamp(1.1rem, 2vw, 1.4rem)', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'grid', gap: '0.85rem', maxWidth: 780 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
            <label style={{ display: 'grid', gap: '0.45rem' }}>
              <span style={{ color: '#cbd5e1' }}>Driver name</span>
              <input value={formState.name} onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))} placeholder="Driver name" style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
            </label>
            <label style={{ display: 'grid', gap: '0.45rem' }}>
              <span style={{ color: '#cbd5e1' }}>Email</span>
              <input value={formState.email} onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))} placeholder="driver@example.com" style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
            </label>
            <label style={{ display: 'grid', gap: '0.45rem' }}>
              <span style={{ color: '#cbd5e1' }}>Phone</span>
              <input value={formState.phone} onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))} placeholder="555-0100" style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
            <label style={{ display: 'grid', gap: '0.45rem' }}>
              <span style={{ color: '#cbd5e1' }}>Vehicle type</span>
              <input value={formState.vehicle_type} onChange={(event) => setFormState((prev) => ({ ...prev, vehicle_type: event.target.value }))} placeholder="Vehicle type" style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
            </label>
            <label style={{ display: 'grid', gap: '0.45rem' }}>
              <span style={{ color: '#cbd5e1' }}>Vehicle number</span>
              <input value={formState.vehicle_number} onChange={(event) => setFormState((prev) => ({ ...prev, vehicle_number: event.target.value }))} placeholder="ABC-123" style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
            </label>
          </div>
          <label style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={{ color: '#cbd5e1' }}>License number</span>
            <input value={formState.license_number} onChange={(event) => setFormState((prev) => ({ ...prev, license_number: event.target.value }))} placeholder="License number" style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
          </label>
          <label style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={{ color: '#cbd5e1' }}>Notes</span>
            <textarea value={formState.notes} onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Notes" rows={3} style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
          </label>
          <button type="button" onClick={submit} style={{ justifySelf: 'start', padding: '0.8rem 1rem', borderRadius: 14, background: 'linear-gradient(135deg, #60a5fa, #818cf8)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Add driver</button>
        </div>
      </section>

      <section style={{ display: 'grid', gap: '1rem' }}>
        {drivers.map((driver) => (
          <article key={driver.id} style={{ padding: '1rem', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(2,6,23,0.72)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{driver.name}</div>
                <div style={{ marginTop: '0.45rem', color: '#cbd5e1' }}><strong>Vehicle:</strong> {driver.vehicle_type} · {driver.vehicle_number || 'No vehicle number'}</div>
                <div style={{ marginTop: '0.35rem', color: '#cbd5e1' }}><strong>License:</strong> {driver.license_number}</div>
                {driver.email ? <div style={{ marginTop: '0.35rem', color: '#cbd5e1' }}><strong>Email:</strong> {driver.email}</div> : null}
                {driver.notes ? <div style={{ marginTop: '0.35rem', color: '#cbd5e1' }}><strong>Notes:</strong> {driver.notes}</div> : null}
              </div>
              <span style={{ padding: '0.35rem 0.6rem', borderRadius: 999, background: 'rgba(96,165,250,0.16)', color: '#bae6fd', fontSize: '0.82rem' }}>{driver.status}</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
