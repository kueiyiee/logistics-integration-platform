import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackNavigationProps {
  label?: string;
  to?: string;
  onBack?: () => void;
}

export function BackNavigation({ label = 'Back to overview', to, onBack }: BackNavigationProps) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (to) {
      navigate(to);
      return;
    }
    navigate(-1);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.55rem',
        borderRadius: 999,
        border: '1px solid rgba(148, 163, 184, 0.24)',
        padding: '0.7rem 1rem',
        background: 'rgba(255,255,255,0.06)',
        color: '#cbd5e1',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'transform 180ms ease, background-color 180ms ease, color 180ms ease',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', border: '1px solid rgba(148, 163, 184, 0.32)', background: 'rgba(15,23,42,0.9)' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </span>
      {label}
    </button>
  );
}
