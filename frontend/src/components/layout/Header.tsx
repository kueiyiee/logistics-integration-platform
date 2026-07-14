import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../ui/ThemeToggle';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 'var(--header-height)', zIndex: 1000, backdropFilter: 'blur(10px)', background: 'var(--glass)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
      <div className="header-inner">
        <div className="header-brand">
          <Link to="/" aria-label="3rd Party Delivery Management System home" className="header-brand">
            <div style={{ width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <defs>
                  <linearGradient id="g1" x1="0" x2="1">
                    <stop offset="0" stopColor="#2563eb" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <rect x="2" y="6" width="14" height="8" rx="2" fill="url(#g1)" />
                <path d="M18 12h2v2h-2z" fill="currentColor" opacity="0.06" />
                <circle cx="7.5" cy="16.5" r="1.5" fill="#0f1724" />
                <circle cx="16.5" cy="16.5" r="1.5" fill="#0f1724" />
              </svg>
            </div>
            <span>3rd Party Delivery Management System (3PDMS)</span>
          </Link>
        </div>

        <div className="header-actions">
          <ThemeToggle />
          <Link to="/register" className="btn btn-ghost" style={{ whiteSpace: 'nowrap' }}>
            Create account
          </Link>
          <Link to="/login" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            Sign in
          </Link>
          <button aria-label="Open menu" onClick={() => setMobileOpen((v) => !v)} className="header-mobile-toggle">
            ☰
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="header-mobile-menu">
          <div style={{ display: 'grid', gap: 8 }}>
            {navItems.map((item) => (
              <Link key={item.label} to={item.to} onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-primary)', padding: '0.5rem 0.75rem' }}>
                {item.label}
              </Link>
            ))}
            <Link to="/register" className="btn btn-ghost" onClick={() => setMobileOpen(false)} style={{ width: '100%', justifyContent: 'center' }}>
              Create account
            </Link>
            <Link to="/login" className="btn btn-primary" onClick={() => setMobileOpen(false)} style={{ width: '100%', justifyContent: 'center' }}>
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
