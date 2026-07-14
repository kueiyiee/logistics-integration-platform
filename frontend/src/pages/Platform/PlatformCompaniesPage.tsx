import React, { useEffect, useState } from 'react';
import { activateCompany, deleteCompany, fetchCompanies, suspendCompany } from '../../services/auth';

interface Company {
  id: number;
  uuid?: string;
  name: string;
  slug: string;
  status: string;
  created_at?: string;
}

interface PlatformCompaniesPageProps {
  title?: string;
  description?: string;
  filterStatus?: string;
}

export function PlatformCompaniesPage({ title = 'Tenant companies', description = 'Review company status, manage platform enrollment, and keep tenant operations aligned with your platform governance policies.', filterStatus }: PlatformCompaniesPageProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchCompanies();
      const normalized = (data || []).filter((company: any) => {
        if (!filterStatus) {
          return true;
        }

        return (company.status || '').toLowerCase() === filterStatus.toLowerCase();
      });
      setCompanies(normalized);
    } catch (cause: any) {
      setError(cause?.message || 'Unable to load companies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [filterStatus]);

  const handleStatusAction = async (companyId: number, action: 'activate' | 'suspend' | 'delete') => {
    setProcessing((prev) => [...prev, companyId]);
    try {
      if (action === 'activate') {
        await activateCompany(companyId);
      } else if (action === 'suspend') {
        await suspendCompany(companyId);
      } else {
        await deleteCompany(companyId);
      }
      await loadCompanies();
    } catch (cause: any) {
      setError(cause?.message || `Unable to ${action} company.`);
    } finally {
      setProcessing((prev) => prev.filter((item) => item !== companyId));
    }
  };

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <section style={{ padding: '1.4rem', borderRadius: 26, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ margin: 0, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: '0.78rem' }}>Company management</p>
        <h2 style={{ margin: '0.75rem 0 0', fontSize: 'clamp(1.8rem, 2.5vw, 2.2rem)' }}>{title}</h2>
        <p style={{ margin: '0.85rem 0 0', color: '#cbd5e1', maxWidth: 760, lineHeight: 1.7 }}>{description}</p>
      </section>

      {error && (
        <div style={{ padding: '1rem', borderRadius: 18, background: 'rgba(248,113,113,0.12)', color: '#fecaca', border: '1px solid rgba(248,113,113,0.2)' }}>{error}</div>
      )}

      <section style={{ padding: '1rem', borderRadius: 26, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.95rem', color: '#94a3b8' }}>Total tenant companies</div>
            <div style={{ marginTop: '0.5rem', fontSize: '2rem', fontWeight: 700, color: '#f8fafc' }}>{companies.length}</div>
          </div>
          <div style={{ minWidth: 240, padding: '0.9rem 1rem', borderRadius: 18, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>Most recent company</div>
            <div style={{ marginTop: '0.45rem', fontWeight: 700 }}>{companies[0]?.name ?? 'No companies yet'}</div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', color: '#cbd5e1' }}>Loading companies…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '1rem 0.75rem' }}>Company</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Slug</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Status</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Created</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '0.95rem 0.75rem' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{company.name}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.92rem' }}>{company.uuid || `ID ${company.id}`}</div>
                    </td>
                    <td style={{ padding: '0.95rem 0.75rem', color: '#cbd5e1' }}>{company.slug}</td>
                    <td style={{ padding: '0.95rem 0.75rem' }}>
                      <span style={{ padding: '0.35rem 0.75rem', borderRadius: 999, fontSize: '0.85rem', background: company.status === 'active' ? 'rgba(34,197,94,0.14)' : company.status === 'suspended' ? 'rgba(248,113,113,0.14)' : 'rgba(245,158,11,0.12)', color: company.status === 'active' ? '#a7f3d0' : company.status === 'suspended' ? '#fecaca' : '#fde68a' }}>{company.status.replace('_', ' ')}</span>
                    </td>
                    <td style={{ padding: '0.95rem 0.75rem', color: '#cbd5e1' }}>{company.created_at ? new Date(company.created_at).toLocaleDateString() : '-'}</td>
                    <td style={{ padding: '0.95rem 0.75rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {company.status === 'suspended' ? (
                          <button type="button" disabled={processing.includes(company.id)} onClick={() => handleStatusAction(company.id, 'activate')} style={{ padding: '0.55rem 0.85rem', borderRadius: 14, background: 'rgba(34,197,94,0.16)', border: '1px solid rgba(34,197,94,0.24)', color: '#bbf7d0', cursor: 'pointer' }}>
                            {processing.includes(company.id) ? 'Working…' : 'Activate'}
                          </button>
                        ) : (
                          <button type="button" disabled={processing.includes(company.id)} onClick={() => handleStatusAction(company.id, 'suspend')} style={{ padding: '0.55rem 0.85rem', borderRadius: 14, background: 'rgba(245,158,11,0.16)', border: '1px solid rgba(245,158,11,0.24)', color: '#fef08a', cursor: 'pointer' }}>
                            {processing.includes(company.id) ? 'Working…' : 'Suspend'}
                          </button>
                        )}
                        <button type="button" disabled={processing.includes(company.id)} onClick={() => handleStatusAction(company.id, 'delete')} style={{ padding: '0.55rem 0.85rem', borderRadius: 14, background: 'rgba(248,113,113,0.16)', border: '1px solid rgba(248,113,113,0.24)', color: '#fecaca', cursor: 'pointer' }}>
                          {processing.includes(company.id) ? 'Working…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
