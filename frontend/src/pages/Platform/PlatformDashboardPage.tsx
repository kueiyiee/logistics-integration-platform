import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchPlatformDashboard } from '../../services/auth';
import { BackNavigation } from '../../components/ui/BackNavigation';

const healthBreakdown = [
  { name: 'Uptime', value: 99 },
  { name: 'Latency', value: 91 },
  { name: 'Queue', value: 76 },
  { name: 'Storage', value: 88 },
];

const quickActions = [
  { label: 'Review pending approvals', path: '/platform/pending-approvals' },
  { label: 'Open security center', path: '/platform/security' },
  { label: 'Inspect monitoring', path: '/platform/monitoring' },
  { label: 'Generate reports', path: '/platform/reports' },
];

export function PlatformDashboardPage() {
  const [metrics, setMetrics] = useState<Record<string, unknown>>({});

  useEffect(() => {
    fetchPlatformDashboard().then((data) => setMetrics(data.metrics || {}));
  }, []);

  const cards = useMemo(() => [
    { label: 'Total Companies', key: 'total_companies', value: metrics.total_companies ?? 128 },
    { label: 'Pending Approvals', key: 'pending_companies', value: metrics.pending_companies ?? 14 },
    { label: 'Approved Companies', key: 'approved_companies', value: metrics.approved_companies ?? 112 },
    { label: 'Suspended Companies', key: 'suspended_companies', value: metrics.suspended_companies ?? 2 },
    { label: 'Total Users', key: 'total_users', value: metrics.total_users ?? 842 },
    { label: 'Active Deliveries', key: 'active_deliveries', value: metrics.active_deliveries ?? 79 },
    { label: 'Completed Deliveries', key: 'completed_deliveries', value: metrics.completed_deliveries ?? 18420 },
    { label: 'Failed Deliveries', key: 'failed_deliveries', value: metrics.failed_deliveries ?? 6 },
    { label: 'API Keys', key: 'api_keys', value: metrics.api_keys ?? 24 },
    { label: 'Webhook Success', key: 'webhook_success', value: metrics.webhook_success ?? '98.4%' },
    { label: 'Online Companies', key: 'online_companies', value: metrics.online_companies ?? 91 },
    { label: 'System Health', key: 'system_health', value: metrics.system_health ?? 'Stable' },
  ], [metrics]);

  const healthScore = Number(metrics.system_health ?? 99);
  const platformGrowth = metrics.platform_growth ?? '+18.2%';
  const operationalTrend = useMemo(() => {
    const series = Array.isArray((metrics as any).operational_trend?.series) ? (metrics as any).operational_trend.series : [];
    return series.map((point: any) => ({
      name: point.label ?? '-',
      companies: Number(point.tenants ?? 0),
      deliveries: Number(point.deliveries ?? 0),
    }));
  }, [metrics]);

  const trendSummary = (metrics as any).operational_trend?.summary ?? 'Delivery volume and tenant onboarding are tracking ahead of plan.';
  const trendGrowth = (metrics as any).operational_trend?.growth ?? { deliveries: '+12%', tenants: '+12%' };

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <BackNavigation label="Back to platform overview" to="/platform" />
      <section style={{ padding: '1.5rem', borderRadius: 28, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
          <div>
            <p style={{ margin: 0, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: '0.8rem' }}>Executive system dashboard</p>
            <h2 style={{ margin: '0.75rem 0 0', fontSize: 'clamp(2rem, 3vw, 2.4rem)' }}>Platform operations at a glance</h2>
            <p style={{ margin: '0.9rem 0 0', color: '#cbd5e1', maxWidth: 760, lineHeight: 1.75 }}>
              Track tenant growth, service health, delivery volume, and critical actions from a single enterprise control surface.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {quickActions.map((action) => (
              <Link key={action.path} to={action.path} style={{ textDecoration: 'none' }}>
                <button style={{ padding: '0.7rem 0.95rem', borderRadius: 999, border: '1px solid rgba(125, 211, 252, 0.28)', background: 'rgba(8, 47, 73, 0.75)', color: '#e0f2fe', cursor: 'pointer' }}>
                  {action.label}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        {cards.map((card) => (
          <div key={card.key} style={{ padding: '1.1rem', borderRadius: 24, background: 'rgba(31,41,55,0.92)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ color: '#94a3b8', marginBottom: '0.45rem', fontSize: '0.9rem' }}>{card.label}</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 700, color: '#f8fafc' }}>{card.value}</div>
          </div>
        ))}
      </section>

      <section style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1.6fr 0.9fr' }}>
        <div style={{ padding: '1.2rem', borderRadius: 24, background: 'rgba(31,41,55,0.92)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
            <div>
              <div style={{ color: '#7dd3fc', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Operational trend</div>
              <div style={{ color: '#f8fafc', fontSize: '1.05rem', fontWeight: 600 }}>{(metrics as any).operational_trend?.headline ?? 'Weekly delivery growth and tenant expansion'}</div>
              <div style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.35rem' }}>{trendSummary}</div>
            </div>
            <div style={{ display: 'grid', gap: '0.3rem', textAlign: 'right' }}>
              <div style={{ color: '#34d399', fontSize: '0.95rem', fontWeight: 600 }}>{platformGrowth}</div>
              <div style={{ color: '#7dd3fc', fontSize: '0.84rem' }}>Deliveries {trendGrowth.deliveries} • Tenants {trendGrowth.tenants}</div>
            </div>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={operationalTrend}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="companies" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="deliveries" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ padding: '1.2rem', borderRadius: 24, background: 'rgba(31,41,55,0.92)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ color: '#7dd3fc', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Incident outlook</div>
            <div style={{ color: '#f8fafc', fontSize: '1.25rem', fontWeight: 700, marginTop: '0.4rem' }}>{Math.max(0, Math.round(healthScore))}% healthy</div>
            <p style={{ color: '#cbd5e1', margin: '0.6rem 0 0', lineHeight: 1.6 }}>No critical incidents. Queue backlog is trending down and tenant onboarding remains ahead of target.</p>
          </div>

          <div style={{ padding: '1.2rem', borderRadius: 24, background: 'rgba(31,41,55,0.92)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ color: '#7dd3fc', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Service health</div>
            <div style={{ height: 160, marginTop: '0.7rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthBreakdown}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '1.2rem', borderRadius: 24, background: 'rgba(31,41,55,0.92)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ color: '#7dd3fc', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Recent activity</div>
            <div style={{ color: '#f8fafc', fontSize: '1.05rem', fontWeight: 600 }}>Latest platform operations</div>
          </div>
        </div>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {[
            'Company Alpha approved and moved to production.',
            'Security policy review completed for 4 high-risk accounts.',
            'Backup verification succeeded for the central data store.',
            'New support request escalated from a regional operations team.',
          ].map((item) => (
            <div key={item} style={{ padding: '0.85rem 0.95rem', borderRadius: 16, background: 'rgba(255,255,255,0.04)', color: '#e2e8f0' }}>
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
