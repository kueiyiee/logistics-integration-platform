import React from 'react';

interface PlatformPageProps {
  title: string;
  description: string;
}

export function PlatformPage({ title, description }: PlatformPageProps) {
  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <section style={{ padding: '1.5rem', borderRadius: 28, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ margin: 0, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: '0.8rem' }}>System administration</p>
        <h2 style={{ margin: '0.75rem 0 0', fontSize: 'clamp(1.8rem, 2.4vw, 2.2rem)' }}>{title}</h2>
        <p style={{ margin: '0.9rem 0 0', color: '#cbd5e1', maxWidth: 760, lineHeight: 1.75 }}>{description}</p>
      </section>

      <section style={{ padding: '1.3rem', borderRadius: 24, background: 'rgba(31,41,55,0.92)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.8 }}>This area is configured for {title.toLowerCase()}. The system admin can manage every section of the entire platform from here.</p>
      </section>
    </div>
  );
}
