import React from 'react';
import { colors, typography } from '../../styles/designTokens';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  subtitle?: string;
  interactive?: boolean;
};

export const Card: React.FC<CardProps> = ({ title, subtitle, children, style, interactive = false, className, ...rest }) => {
  return (
    <div
      className={`card${interactive ? ' interactive' : ''}${className ? ` ${className}` : ''}`}
      style={{
        background: colors.neutral.white,
        border: `1px solid ${colors.neutral.gray200}`,
        borderRadius: 18,
        padding: 20,
        boxShadow: '0 14px 36px rgba(16,24,40,0.06)',
        fontFamily: typography.fontFamily,
        ...style,
      }}
      {...rest}
    >
      {title && <div className="card-title" style={{ marginBottom: subtitle ? 8 : 14 }}>{title}</div>}
      {subtitle && <div className="card-subtitle" style={{ marginBottom: 16 }}>{subtitle}</div>}
      <div>{children}</div>
    </div>
  );
};

export default Card;
