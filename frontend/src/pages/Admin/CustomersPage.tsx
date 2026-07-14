import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

export function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [formState, setFormState] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    api.get('/admin/customers').then((response) => setCustomers(response.data.data));
  }, []);

  const submit = async () => {
    const response = await api.post('/admin/customers', formState);
    setCustomers((prev) => [response.data, ...prev]);
    setFormState({ name: '', email: '', phone: '' });
  };

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <section style={{ padding: 'clamp(1.1rem, 2vw, 1.4rem)', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ margin: 0, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '0.8rem' }}>Customer relationships</p>
        <h1 style={{ margin: '0.35rem 0 0', fontSize: 'clamp(1.35rem, 2.2vw, 1.75rem)' }}>Customers</h1>
        <p style={{ margin: '0.45rem 0 0', color: '#cbd5e1', lineHeight: 1.7 }}>Keep customer details organized with a lightweight, mobile-friendly record view.</p>
      </section>

      <section style={{ padding: 'clamp(1.1rem, 2vw, 1.4rem)', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'grid', gap: '0.85rem', maxWidth: 640 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
            <label style={{ display: 'grid', gap: '0.45rem' }}>
              <span style={{ color: '#cbd5e1' }}>Customer name</span>
              <input value={formState.name} onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))} placeholder="Customer name" style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
            </label>
            <label style={{ display: 'grid', gap: '0.45rem' }}>
              <span style={{ color: '#cbd5e1' }}>Email</span>
              <input value={formState.email} onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))} placeholder="Email" style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
            </label>
          </div>
          <label style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={{ color: '#cbd5e1' }}>Phone</span>
            <input value={formState.phone} onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))} placeholder="Phone" style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
          </label>
          <button type="button" onClick={submit} style={{ justifySelf: 'start', padding: '0.8rem 1rem', borderRadius: 14, background: 'linear-gradient(135deg, #60a5fa, #818cf8)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Add customer</button>
        </div>
      </section>

      <section style={{ display: 'grid', gap: '1rem' }}>
        {customers.map((customer) => (
          <article key={customer.id} style={{ padding: '1rem', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(2,6,23,0.72)', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
            <div style={{ fontWeight: 700 }}>{customer.name}</div>
            <div style={{ marginTop: '0.4rem', color: '#cbd5e1' }}><strong>Email:</strong> {customer.email}</div>
            <div style={{ marginTop: '0.35rem', color: '#cbd5e1' }}><strong>Phone:</strong> {customer.phone}</div>
          </article>
        ))}
      </section>
    </div>
  );
}
