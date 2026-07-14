import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { approveCompany, fetchPendingCompanies, rejectCompany } from '../../services/auth';

interface Company {
  id: number;
  uuid?: string;
  name: string;
  slug: string;
  status: string;
  created_at?: string;
  registration_number?: string;
  organization_type?: string;
  industry?: string;
  country?: string;
  address?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  verification_status?: string;
  risk_level?: string;
  documents_submitted?: number;
}

export function PlatformPendingApprovalsPage() {
  const auth = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadPending = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchPendingCompanies();
      setCompanies(data || []);
    } catch (cause: any) {
      setError(cause?.message || 'Unable to load pending companies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleAction = async (companyId: number, action: 'approve' | 'reject') => {
    setProcessing((prev) => [...prev, companyId]);
    try {
      if (action === 'approve') {
        await approveCompany(companyId);
      } else {
        await rejectCompany(companyId);
      }
      await loadPending();
    } catch (cause: any) {
      setError(cause?.message || `Unable to ${action} company.`);
    } finally {
      setProcessing((prev) => prev.filter((item) => item !== companyId));
    }
  };

  const canApprove = auth.hasPermission('manage.system') || auth.hasRole('System Owner') || auth.hasRole('System Administrator') || auth.user?.is_system_owner;

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <section style={{ padding: '1.4rem', borderRadius: 26, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ margin: 0, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: '0.78rem' }}>Pending approvals</p>
        <h2 style={{ margin: '0.75rem 0 0', fontSize: 'clamp(1.8rem, 2.5vw, 2.2rem)' }}>Pending company onboarding</h2>
        <p style={{ margin: '0.85rem 0 0', color: '#cbd5e1', maxWidth: 760, lineHeight: 1.7 }}>Review incoming tenant requests and approve only the companies that meet your platform governance and compliance requirements.</p>
      </section>

      {error && (
        <div style={{ padding: '1rem', borderRadius: 18, background: 'rgba(248,113,113,0.12)', color: '#fecaca', border: '1px solid rgba(248,113,113,0.2)' }}>{error}</div>
      )}

      <section style={{ padding: '1rem', borderRadius: 26, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {loading ? (
          <div style={{ padding: '2rem', color: '#cbd5e1' }}>Loading pending approvals…</div>
        ) : companies.length === 0 ? (
          <div style={{ padding: '2rem', color: '#cbd5e1' }}>No pending company approvals at this time.</div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {companies.map((company) => (
              <div key={company.id} style={{ padding: '1rem', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center' }}>
                    <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg, #60a5fa, #818cf8)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700 }}>
                      {company.name?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{company.name}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.92rem' }}>{company.registration_number || company.slug || `ID ${company.id}`}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ padding: '0.35rem 0.7rem', borderRadius: 999, background: 'rgba(245,158,11,0.16)', color: '#fde68a', fontSize: '0.85rem' }}>{company.verification_status || 'Pending review'}</span>
                    <span style={{ padding: '0.35rem 0.7rem', borderRadius: 999, background: 'rgba(248,113,113,0.16)', color: '#fecaca', fontSize: '0.85rem' }}>{company.risk_level || 'Medium risk'}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '0.65rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', color: '#cbd5e1' }}>
                  <div><strong style={{ color: '#f8fafc' }}>Organization type:</strong> {company.organization_type || 'Enterprise'}</div>
                  <div><strong style={{ color: '#f8fafc' }}>Industry:</strong> {company.industry || 'Transportation'}</div>
                  <div><strong style={{ color: '#f8fafc' }}>Country:</strong> {company.country || 'United States'}</div>
                  <div><strong style={{ color: '#f8fafc' }}>Address:</strong> {company.address || 'Submitted on registration form'}</div>
                  <div><strong style={{ color: '#f8fafc' }}>Contact person:</strong> {company.contact_person || 'Pending assignment'}</div>
                  <div><strong style={{ color: '#f8fafc' }}>Email:</strong> {company.email || 'Pending verification'}</div>
                  <div><strong style={{ color: '#f8fafc' }}>Phone:</strong> {company.phone || 'Pending verification'}</div>
                  <div><strong style={{ color: '#f8fafc' }}>Date submitted:</strong> {company.created_at ? new Date(company.created_at).toLocaleString() : 'Pending'}</div>
                  <div><strong style={{ color: '#f8fafc' }}>Documents submitted:</strong> {company.documents_submitted || 3}</div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.9rem' }}>
                  <button type="button" style={{ padding: '0.55rem 0.85rem', borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#f8fafc', cursor: 'pointer' }}>View details</button>
                  <button type="button" style={{ padding: '0.55rem 0.85rem', borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#f8fafc', cursor: 'pointer' }}>Preview documents</button>
                  <button type="button" style={{ padding: '0.55rem 0.85rem', borderRadius: 14, background: 'rgba(59,130,246,0.16)', border: '1px solid rgba(59,130,246,0.24)', color: '#bfdbfe', cursor: 'pointer' }}>Verify documents</button>
                  {canApprove ? (
                    <>
                      <button type="button" disabled={processing.includes(company.id)} onClick={() => handleAction(company.id, 'approve')} style={{ padding: '0.55rem 0.85rem', borderRadius: 14, background: 'rgba(34,197,94,0.16)', border: '1px solid rgba(34,197,94,0.24)', color: '#bbf7d0', cursor: 'pointer' }}>
                        {processing.includes(company.id) ? 'Working…' : 'Approve organization'}
                      </button>
                      <button type="button" disabled={processing.includes(company.id)} onClick={() => handleAction(company.id, 'reject')} style={{ padding: '0.55rem 0.85rem', borderRadius: 14, background: 'rgba(248,113,113,0.16)', border: '1px solid rgba(248,113,113,0.24)', color: '#fecaca', cursor: 'pointer' }}>
                        {processing.includes(company.id) ? 'Working…' : 'Reject organization'}
                      </button>
                    </>
                  ) : (
                    <span style={{ color: '#fda4af', alignSelf: 'center' }}>Approval actions restricted to System Owner or System Administrators.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
