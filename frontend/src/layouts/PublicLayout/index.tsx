import React, { ReactNode } from 'react';
import { Header } from '../../components/layout/Header';

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--surface-1)', overflow: 'hidden' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%', overflow: 'hidden' }}>{children}</main>
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.95rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span>© 2026 3rd Party Delivery Management System (3PDMS)</span>
          <span>Enterprise-ready delivery orchestration</span>
        </div>
      </footer>
    </div>
  );
}
