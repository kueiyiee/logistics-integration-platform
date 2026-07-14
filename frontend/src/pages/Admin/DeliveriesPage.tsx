import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

export function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [formState, setFormState] = useState({ tracking_number: '', external_reference: '' });

  useEffect(() => {
    api.get('/admin/deliveries').then((response) => setDeliveries(response.data.data));
  }, []);

  const submit = async () => {
    const response = await api.post('/admin/deliveries', formState);
    setDeliveries((prev) => [response.data, ...prev]);
    setFormState({ tracking_number: '', external_reference: '' });
  };

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <section style={{ padding: 'clamp(1.1rem, 2vw, 1.4rem)', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ margin: 0, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '0.8rem' }}>Shipment operations</p>
        <h1 style={{ margin: '0.35rem 0 0', fontSize: 'clamp(1.35rem, 2.2vw, 1.75rem)' }}>Deliveries</h1>
        <p style={{ margin: '0.45rem 0 0', color: '#cbd5e1', lineHeight: 1.7 }}>Track and manage delivery records with a compact, readable workflow.</p>
      </section>

      <section style={{ padding: 'clamp(1.1rem, 2vw, 1.4rem)', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'grid', gap: '0.85rem', maxWidth: 640 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
            <label style={{ display: 'grid', gap: '0.45rem' }}>
              <span style={{ color: '#cbd5e1' }}>Tracking number</span>
              <input value={formState.tracking_number} onChange={(event) => setFormState((prev) => ({ ...prev, tracking_number: event.target.value }))} placeholder="Tracking number" style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
            </label>
            <label style={{ display: 'grid', gap: '0.45rem' }}>
              <span style={{ color: '#cbd5e1' }}>External reference</span>
              <input value={formState.external_reference} onChange={(event) => setFormState((prev) => ({ ...prev, external_reference: event.target.value }))} placeholder="External reference" style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
            </label>
          </div>
          <button type="button" onClick={submit} style={{ justifySelf: 'start', padding: '0.8rem 1rem', borderRadius: 14, background: 'linear-gradient(135deg, #60a5fa, #818cf8)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Add delivery</button>
        </div>
      </section>

      <section style={{ display: 'grid', gap: '1rem' }}>
        {deliveries.map((delivery) => (
          <article key={delivery.id} style={{ padding: '1rem', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(2,6,23,0.72)' }}>
            <div style={{ fontWeight: 700 }}>{delivery.tracking_number}</div>
            <div style={{ marginTop: '0.45rem', color: '#cbd5e1' }}><strong>Status:</strong> {delivery.status}</div>
            <div style={{ marginTop: '0.35rem', color: '#cbd5e1' }}><strong>Reference:</strong> {delivery.external_reference ?? '—'}</div>
          </article>
        ))}
      </section>
    </div>
  );
}
