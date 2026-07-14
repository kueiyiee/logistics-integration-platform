import React from 'react';
import { colors, typography } from '../../styles/designTokens';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', loading = false, children, style, disabled, ...rest }) => {
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: colors.accent.electricBlue, color: '#001', border: 'none', boxShadow: '0 12px 34px rgba(37,99,235,0.16)' },
    secondary: { background: colors.accent.intelligentPurple, color: '#fff', border: 'none' },
    ghost: { background: 'transparent', color: colors.primary.deepBlue, border: `1px solid ${colors.neutral.gray200}` },
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '8px 12px', fontSize: typography.scale.small.size },
    md: { padding: '12px 16px', fontSize: typography.scale.body.size },
    lg: { padding: '16px 20px', fontSize: typography.scale.h3.size },
  };

  const base: React.CSSProperties = {
    fontFamily: typography.fontFamily,
    borderRadius: 12,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease, opacity 180ms ease',
    boxShadow: '0 12px 32px rgba(15,23,42,0.08)',
    position: 'relative',
    border: '1px solid transparent',
  };

  return (
    <button
      style={{ ...base, ...variants[variant], ...sizes[size], ...style }}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading && (
        <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.7)', borderTopColor: 'rgba(255,255,255,1)', borderRadius: '50%', marginRight: 10, animation: 'spin 0.9s linear infinite' }} />
      )}
      {children}
    </button>
  );
};

export default Button;
