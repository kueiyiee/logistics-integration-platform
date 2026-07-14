import React from 'react';
import { BackNavigation } from '../../components/ui/BackNavigation';

const cards = [
  { title: 'Active deliveries', value: '128' },
  { title: 'Pending handoffs', value: '14' },
  { title: 'Webhook events', value: '2.4k' },
  { title: 'Support SLA', value: '99.9%' },
];

export function ClientDashboardPage() {
  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <BackNavigation label="Back to client overview" />
      <section style={{ padding: '1.3rem', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ margin: 0, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.8rem' }}>Client portal</p>
        <h2 style={{ margin: '0.3rem 0 0', fontSize: '1.35rem' }}>Track delivery performance and operational readiness</h2>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {cards.map((card) => (
          <div key={card.title} style={{ padding: '1rem 1.1rem', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color: '#cbd5e1', marginBottom: '0.3rem' }}>{card.title}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{card.value}</div>
          </div>
        ))}
      </section>

      <section style={{ padding: '1.2rem', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ margin: '0 0 0.8rem' }}>Today’s delivery highlights</h3>
        <div style={{ display: 'grid', gap: '0.65rem' }}>
          {['2 deliveries are arriving in under 15 minutes', '3 partners requested webhook replays', '1 high-priority exception is being resolved'].map((item) => (
            <div key={item} style={{ padding: '0.8rem 0.95rem', borderRadius: 16, background: 'rgba(2,6,23,0.7)', color: '#e2e8f0' }}>
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
