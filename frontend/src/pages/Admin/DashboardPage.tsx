import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { changePassword, fetchDashboard } from '../../services/auth';
import { useAuth } from '../../hooks/useAuth';
import { ConsolePageHeader } from '../../components/ConsolePageHeader';
import { DashboardRefreshBar } from '../../components/ui/DashboardRefreshBar';
import { BackNavigation } from '../../components/ui/BackNavigation';

const EyeIcon = ({ visible }: { visible: boolean }) => (
  visible ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6A3 3 0 0 0 13.4 13.4" />
      <path d="M9.9 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a18.7 18.7 0 0 1-4 4.7" />
      <path d="M6.5 6.5A18.7 18.7 0 0 0 2 12s3.5 7 10 7a10.7 10.7 0 0 0 3.4-.5" />
    </svg>
  )
);

const metricLabels: Record<string, string> = {
  users: 'Users',
  deliveries: 'Deliveries',
  customers: 'Customers',
  drivers: 'Drivers',
  api_keys: 'API keys',
  webhooks: 'Webhooks',
};

export function DashboardPage() {
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const refreshTimerRef = useRef<number | null>(null);
  const auth = useAuth();
  const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, password: false, confirmation: false });

  const loadMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    setMetricsError(null);

    try {
      const data = await fetchDashboard();
      setMetrics(data.metrics || {});
      setLastUpdated(new Date().toISOString());
    } catch (err: any) {
      setMetricsError(err?.response?.data?.message || err?.message || 'Unable to load metrics at this time.');
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    if (!mounted) return;
    loadMetrics();

    return () => { mounted = false; };
  }, [loadMetrics]);

  useEffect(() => {
    if (!autoRefreshEnabled) {
      if (refreshTimerRef.current) {
        window.clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      return;
    }

    refreshTimerRef.current = window.setInterval(() => {
      loadMetrics();
    }, 45000);

    return () => {
      if (refreshTimerRef.current) {
        window.clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [autoRefreshEnabled, loadMetrics]);

  const reloadMetrics = () => {
    loadMetrics();
  };

  const chartData = Object.entries(metrics).map(([key, value]) => ({
    name: metricLabels[key] ?? key,
    value,
  }));

  const cards = Object.entries(metrics).slice(0, 4).map(([key, value]) => ({
    label: metricLabels[key] ?? key,
    value,
  }));

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);

    if (!passwordForm.current_password || !passwordForm.password || !passwordForm.password_confirmation) {
      setPasswordError('Please complete all password fields.');
      return;
    }

    if (passwordForm.password.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (passwordForm.password !== passwordForm.password_confirmation) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    const hasUpper = /[A-Z]/.test(passwordForm.password);
    const hasLower = /[a-z]/.test(passwordForm.password);
    const hasNumber = /\d/.test(passwordForm.password);
    const hasSymbol = /[^A-Za-z0-9]/.test(passwordForm.password);

    if (!hasUpper || !hasLower || !hasNumber || !hasSymbol) {
      setPasswordError('Password must include upper, lower, number, and symbol characters.');
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await changePassword(passwordForm);
      setPasswordMessage(response.message || 'Password updated successfully.');
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (error: any) {
      const serverMessage = error?.response?.data?.message || error?.message || 'Unable to update password.';
      setPasswordError(serverMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gap: '0.85rem' }}>
        <BackNavigation label="Back to admin overview" to="/admin" />
        <ConsolePageHeader
          title="Enterprise Platform Management"
          subtitle="Manage platform users, global resources, and enterprise operations across the entire delivery ecosystem."
          breadcrumbs={[{ label: 'System Administration Console', to: '/admin' }]}
          actions={
            <div style={{ padding: '0.8rem 1rem', borderRadius: 18, background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(96,165,250,0.24)', color: '#f8fafc' }}>
              {auth.user?.name ? `Signed in as ${auth.user.name} · System Administrator` : 'Secure workspace'}
            </div>
          }
        />
      </div>

      <DashboardRefreshBar
        loading={loadingMetrics}
        error={metricsError}
        lastUpdated={lastUpdated}
        statusLabel="Live platform metrics"
        onRefresh={reloadMetrics}
        autoRefreshEnabled={autoRefreshEnabled}
        onToggleAutoRefresh={setAutoRefreshEnabled}
      />

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {loadingMetrics ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ padding: '1rem 1.1rem', borderRadius: 22, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.03)', color: '#94a3b8' }}>
              <div style={{ height: 18, width: '40%', background: 'rgba(255,255,255,0.06)', borderRadius: 6, marginBottom: 10 }} />
              <div style={{ height: 28, width: '60%', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }} />
            </div>
          ))
        ) : metricsError ? (
          <div style={{ padding: '1rem 1.1rem', borderRadius: 22, background: '#fff7ed', border: '1px solid #fed7aa', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Metrics temporarily unavailable</div>
              <div style={{ fontSize: '0.95rem' }}>{metricsError}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={reloadMetrics} className="btn btn-secondary">Retry</button>
              <a href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL ?? 'support@yourdomain.com'}`} style={{ color: 'var(--accent)', alignSelf: 'center', textDecoration: 'underline' }}>Contact support</a>
            </div>
          </div>
        ) : cards.length > 0 ? (
          cards.map((card) => (
            <div key={card.label} style={{ padding: '1rem 1.1rem', borderRadius: 22, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 26px rgba(15,23,42,0.16)' }}>
              <div style={{ color: '#cbd5e1', marginBottom: '0.35rem' }}>{card.label}</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700 }}>{card.value}</div>
            </div>
          ))
        ) : (
          <div style={{ padding: '1rem 1.1rem', borderRadius: 22, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>No metrics available</div>
            <div style={{ fontSize: '0.95rem' }}>Metrics are currently unavailable for this workspace. Try refreshing or check back shortly.</div>
          </div>
        )}
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
        <div style={{ padding: '1.2rem', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 18px 40px rgba(15,23,42,0.16)' }}>
          <h3 style={{ margin: '0 0 0.8rem' }}>Platform performance</h3>
          <div style={{ width: '100%', height: 300 }}>
            {loadingMetrics ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>Loading chart…</div>
            ) : metricsError ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#92400e' }}>Unable to load chart — <button onClick={reloadMetrics} className="btn btn-secondary" style={{ marginLeft: 10 }}>Retry</button></div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#cbd5e1' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#cbd5e1' }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#60a5fa" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={{ padding: '1.2rem', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 18px 40px rgba(15,23,42,0.16)' }}>
          <h3 style={{ margin: '0 0 0.8rem' }}>Quick actions</h3>
          <div style={{ display: 'grid', gap: '0.65rem' }}>
            {[
              { label: 'Review delivery exceptions', to: '/admin/deliveries?filter=exceptions' },
              { label: 'Manage API key access', to: '/admin/api-keys' },
              { label: 'Inspect webhook retries', to: '/admin/webhooks?tab=retries' },
              { label: 'Sync customer updates', to: '/admin/customers?sync=true' },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.to}
                title={`Go to ${action.label}`}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 18,
                  background: 'rgba(2,6,23,0.85)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255,255,255,0.08)',
                  textDecoration: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, background 0.15s ease',
                }}
                onMouseEnter={(event) => {
                  const target = event.currentTarget as HTMLElement;
                  target.style.background = 'rgba(255,255,255,0.1)';
                  target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(event) => {
                  const target = event.currentTarget as HTMLElement;
                  target.style.background = 'rgba(2,6,23,0.85)';
                  target.style.transform = 'none';
                }}
              >
                <span>{action.label}</span>
                <span style={{ color: '#60a5fa', fontWeight: 700, marginLeft: '1rem' }}>Go →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '1.2rem', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 18px 40px rgba(15,23,42,0.16)' }}>
        <h3 style={{ margin: '0 0 0.8rem' }}>Security & account controls</h3>
        <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div style={{ padding: '0.95rem 1rem', borderRadius: 16, background: 'rgba(2,6,23,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>Password policy</div>
            <div style={{ marginTop: '0.3rem', color: '#f8fafc', fontWeight: 600 }}>Minimum 8 characters with upper, lower, number and symbol</div>
          </div>
          <div style={{ padding: '0.95rem 1rem', borderRadius: 16, background: 'rgba(2,6,23,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>System Administrator role</div>
              <div style={{ marginTop: '0.3rem', color: '#f8fafc', fontWeight: 600 }}>System Administrator can manage platform-wide resources, governance, and enterprise delivery operations.</div>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} style={{ marginTop: '1rem', display: 'grid', gap: '0.8rem', maxWidth: 520 }}>
          <div style={{ display: 'grid', gap: '0.45rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>Current password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPasswords.current ? 'text' : 'password'} placeholder="Current password" value={passwordForm.current_password} onChange={(event) => setPasswordForm((prev) => ({ ...prev, current_password: event.target.value }))} style={{ width: '100%', padding: '0.8rem 3.2rem 0.8rem 0.95rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
              <button type="button" aria-label={showPasswords.current ? 'Hide current password' : 'Show current password'} onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))} style={{ position: 'absolute', top: '50%', right: '0.7rem', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#7dd3fc', cursor: 'pointer' }}><EyeIcon visible={showPasswords.current} /></button>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '0.45rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>New password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPasswords.password ? 'text' : 'password'} placeholder="New password" value={passwordForm.password} onChange={(event) => setPasswordForm((prev) => ({ ...prev, password: event.target.value }))} style={{ width: '100%', padding: '0.8rem 3.2rem 0.8rem 0.95rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
              <button type="button" aria-label={showPasswords.password ? 'Hide new password' : 'Show new password'} onClick={() => setShowPasswords((prev) => ({ ...prev, password: !prev.password }))} style={{ position: 'absolute', top: '50%', right: '0.7rem', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#7dd3fc', cursor: 'pointer' }}><EyeIcon visible={showPasswords.password} /></button>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Use at least 8 characters with upper, lower, number, and symbol.</div>
          </div>
          <div style={{ display: 'grid', gap: '0.45rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>Confirm new password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPasswords.confirmation ? 'text' : 'password'} placeholder="Confirm new password" value={passwordForm.password_confirmation} onChange={(event) => setPasswordForm((prev) => ({ ...prev, password_confirmation: event.target.value }))} style={{ width: '100%', padding: '0.8rem 3.2rem 0.8rem 0.95rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
              <button type="button" aria-label={showPasswords.confirmation ? 'Hide confirmation password' : 'Show confirmation password'} onClick={() => setShowPasswords((prev) => ({ ...prev, confirmation: !prev.confirmation }))} style={{ position: 'absolute', top: '50%', right: '0.7rem', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#7dd3fc', cursor: 'pointer' }}><EyeIcon visible={showPasswords.confirmation} /></button>
            </div>
          </div>
          <button type="submit" disabled={isChangingPassword} style={{ width: 180, padding: '0.8rem 0.95rem', borderRadius: 14, border: 'none', background: isChangingPassword ? 'rgba(96,165,250,0.6)' : 'linear-gradient(135deg, #60a5fa, #818cf8)', color: 'white', cursor: isChangingPassword ? 'wait' : 'pointer', fontWeight: 700 }}>
            {isChangingPassword ? 'Updating…' : 'Change password'}
          </button>
          {passwordMessage && <div style={{ color: '#bbf7d0' }}>{passwordMessage}</div>}
          {passwordError && <div style={{ color: '#fecaca' }}>{passwordError}</div>}
        </form>
      </section>
    </div>
  );
}
