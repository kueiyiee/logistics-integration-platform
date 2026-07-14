import React from 'react';
import { colors, typography } from '../../styles/designTokens';

export const Topbar: React.FC = () => {
  return (
    <header style={{ height: 64, background: colors.neutral.white, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: `1px solid ${colors.neutral.gray200}` }}>
      <div style={{ color: colors.neutral.gray800 }}>Search…</div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>🔔</button>
        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>👤</button>
      </div>
    </header>
  );
};

export default Topbar;
