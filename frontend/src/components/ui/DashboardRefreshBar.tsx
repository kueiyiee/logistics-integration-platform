import React from 'react';

interface DashboardRefreshBarProps {
  loading?: boolean;
  error?: string | null;
  lastUpdated?: string | null;
  statusLabel?: string;
  onRefresh: () => void;
  autoRefreshEnabled?: boolean;
  onToggleAutoRefresh?: (enabled: boolean) => void;
}

export function DashboardRefreshBar({
  loading = false,
  error = null,
  lastUpdated = null,
  statusLabel = 'Live data',
  onRefresh,
  autoRefreshEnabled,
  onToggleAutoRefresh,
}: DashboardRefreshBarProps) {
  const formattedTime = lastUpdated ? new Date(lastUpdated).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : 'Not refreshed yet';
  const status = error ? 'Offline snapshot' : loading ? 'Refreshing' : statusLabel;

  return (
    <section style={{ padding: '1rem 1.15rem', borderRadius: 22, background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(96,165,250,0.2)', boxShadow: '0 18px 40px rgba(15,23,42,0.16)', display: 'grid', gap: '0.85rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.82rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7dd3fc', marginBottom: '0.35rem' }}>Global system refresh</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.8rem', color: '#cbd5e1', fontSize: '0.95rem' }}>
            <span>{status}</span>
            <span style={{ opacity: 0.72 }}>Last updated: {formattedTime}</span>
            {error && <span style={{ color: '#fecaca' }}>{error}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.65rem' }}>
          {typeof onToggleAutoRefresh === 'function' && (
            <button
              type="button"
              onClick={() => onToggleAutoRefresh(!Boolean(autoRefreshEnabled))}
              style={{
                borderRadius: 999,
                border: '1px solid rgba(125,211,252,0.28)',
                background: autoRefreshEnabled ? 'rgba(56,189,248,0.18)' : 'transparent',
                color: autoRefreshEnabled ? '#7dd3fc' : '#cbd5e1',
                padding: '0.55rem 0.9rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {autoRefreshEnabled ? 'Auto refresh on' : 'Enable auto refresh'}
            </button>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            style={{
              borderRadius: 999,
              border: '1px solid rgba(96,165,250,0.28)',
              background: loading ? 'rgba(96,165,250,0.2)' : 'linear-gradient(135deg, #60a5fa, #818cf8)',
              color: '#fff',
              padding: '0.65rem 1rem',
              cursor: loading ? 'wait' : 'pointer',
              fontWeight: 700,
              minWidth: 140,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            {loading ? (
              <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.75)', borderTopColor: 'rgba(255,255,255,1)', borderRadius: '50%', animation: 'spin 0.85s linear infinite' }} />
            ) : null}
            Refresh now
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}
