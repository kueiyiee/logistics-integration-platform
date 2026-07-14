import React from 'react';
import { colors, typography } from '../../styles/designTokens';

export const Sidebar: React.FC = ({ children }) => {
  return (
    <aside style={{ width: 240, background: colors.neutral.white, borderRight: `1px solid ${colors.neutral.gray200}`, padding: 16, minHeight: '100vh', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 20, fontWeight: 800, fontSize: 18 }}>3PDMS</div>
      {children}
    </aside>
  );
};

export default Sidebar;
