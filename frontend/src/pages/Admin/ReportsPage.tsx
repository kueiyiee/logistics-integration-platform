import React, { useEffect, useMemo, useState } from 'react';
import { ConsolePageHeader } from '../../components/ConsolePageHeader';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';

interface ReportFilter {
  startDate: string;
  endDate: string;
  companyId: string;
  userId: string;
  role: string;
  status: string;
  deliveryStatus: string;
  driverId: string;
  search: string;
}

interface ReportRow {
  id: number;
  title: string;
  category: string;
  created_at: string;
  total_records: number;
  status: string;
}

export function ReportsPage() {
  const auth = useAuth();
  const [filters, setFilters] = useState<ReportFilter>({
    startDate: '',
    endDate: '',
    companyId: '',
    userId: '',
    role: '',
    status: '',
    deliveryStatus: '',
    driverId: '',
    search: '',
  });
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportRow | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const reportOptions = useMemo(
    () => [
      { id: 'companies', label: 'Companies' },
      { id: 'company_managers', label: 'Company Managers' },
      { id: 'company_dispatchers', label: 'Company Dispatchers' },
      { id: 'users', label: 'Users' },
      { id: 'drivers', label: 'Drivers' },
      { id: 'deliveries', label: 'Deliveries' },
      { id: 'customers', label: 'Customers' },
      { id: 'api_keys', label: 'API Keys' },
      { id: 'webhooks', label: 'Webhooks' },
      { id: 'login_history', label: 'Login History' },
      { id: 'audit_logs', label: 'Audit Logs' },
      { id: 'activity_logs', label: 'Activity Logs' },
      { id: 'security_logs', label: 'Security Logs' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'email_verification', label: 'Email Verification' },
      { id: 'company_approval_history', label: 'Company Approval History' },
      { id: 'system_statistics', label: 'System Statistics' },
      { id: 'dashboard_analytics', label: 'Dashboard Analytics' },
    ],
    [],
  );

  useEffect(() => {
    setLoading(true);
    api
      .get('/v1/admin/reports', { params: { search: filters.search, company_id: filters.companyId, user_id: filters.userId, role: filters.role, status: filters.status, delivery_status: filters.deliveryStatus, driver_id: filters.driverId, start_date: filters.startDate, end_date: filters.endDate } })
      .then((response) => {
        setReports(response.data.data || []);
      })
      .catch(() => {
        setReports([]);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const handleExport = async (format: 'pdf' | 'xlsx' | 'csv' | 'docx') => {
    if (!selectedReport) return;
    setExporting(true);
    try {
      const response = await api.get(`/v1/admin/reports/${selectedReport.id}/export`, {
        params: { format, ...filters },
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedReport.category}-${selectedReport.id}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    { key: 'title', label: 'Report' },
    { key: 'category', label: 'Category' },
    { key: 'created_at', label: 'Created' },
    { key: 'total_records', label: 'Records' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', render: (row: ReportRow) => (
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button variant="secondary" size="sm" onClick={() => { setSelectedReport(row); setReportModalOpen(true); }}>View</Button>
      </div>
    ) },
  ];

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <ConsolePageHeader
        title="Integration Center Reports"
        subtitle="Generate and export enterprise-grade reports across integrations, users, security, and operational workflows."
        breadcrumbs={[{ label: 'System Administration Console', to: '/admin' }, { label: 'Integration Center' }, { label: 'Reports' }]}
        actions={<Button variant="primary" size="md" onClick={() => { setSelectedReport(reports[0] ?? null); setReportModalOpen(true); }}>Generate report</Button>}
      />

      <section style={{ display: 'grid', gap: '1.25rem', padding: '1.25rem', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <label style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={{ color: '#cbd5e1' }}>Search reports</span>
            <input value={filters.search} onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))} placeholder="Search by title, category, or reference" style={{ width: '100%', padding: '0.85rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
          </label>
          <label style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={{ color: '#cbd5e1' }}>Company</span>
            <input value={filters.companyId} onChange={(event) => setFilters((prev) => ({ ...prev, companyId: event.target.value }))} placeholder="Company ID" style={{ width: '100%', padding: '0.85rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
          </label>
          <label style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={{ color: '#cbd5e1' }}>User</span>
            <input value={filters.userId} onChange={(event) => setFilters((prev) => ({ ...prev, userId: event.target.value }))} placeholder="User ID" style={{ width: '100%', padding: '0.85rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
          </label>
          <label style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={{ color: '#cbd5e1' }}>Role</span>
            <input value={filters.role} onChange={(event) => setFilters((prev) => ({ ...prev, role: event.target.value }))} placeholder="Role" style={{ width: '100%', padding: '0.85rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
          </label>
          <label style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={{ color: '#cbd5e1' }}>Status</span>
            <input value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))} placeholder="Status" style={{ width: '100%', padding: '0.85rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
          </label>
        </div>
      </section>

      <section style={{ display: 'grid', gap: '1rem', padding: '1.25rem', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.86rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7dd3fc' }}>Reports</div>
            <h2 style={{ margin: '0.35rem 0 0', fontSize: '1.25rem' }}>Enterprise reporting library</h2>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="ghost" size="sm" onClick={() => setFilters({ ...filters, startDate: '', endDate: '', companyId: '', userId: '', role: '', status: '', deliveryStatus: '', driverId: '', search: '' })}>Clear filters</Button>
            <Button variant="primary" size="sm" onClick={() => setReports(reports)} disabled={loading}>Apply filters</Button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem', borderRadius: 20, background: 'rgba(2,6,23,0.72)', color: '#cbd5e1' }}>Loading reports…</div>
        ) : reports.length === 0 ? (
          <div style={{ padding: '1.5rem', borderRadius: 20, background: 'rgba(2,6,23,0.72)', color: '#cbd5e1' }}>No reports match your filters. Adjust the criteria to narrow or broaden results.</div>
        ) : (
          <Table columns={columns} data={reports} />
        )}
      </section>

      <Modal open={reportModalOpen} onClose={() => setReportModalOpen(false)} title={selectedReport ? selectedReport.title : 'Report details'}>
        {selectedReport ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ color: '#cbd5e1' }}><strong>Report ID:</strong> {selectedReport.id}</div>
            <div style={{ color: '#cbd5e1' }}><strong>Category:</strong> {selectedReport.category}</div>
            <div style={{ color: '#cbd5e1' }}><strong>Generated:</strong> {new Date(selectedReport.created_at).toLocaleString()}</div>
            <div style={{ color: '#cbd5e1' }}><strong>Records:</strong> {selectedReport.total_records}</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button variant="secondary" size="sm" onClick={() => handleExport('pdf')} disabled={exporting}>PDF</Button>
              <Button variant="secondary" size="sm" onClick={() => handleExport('xlsx')} disabled={exporting}>Excel</Button>
              <Button variant="secondary" size="sm" onClick={() => handleExport('csv')} disabled={exporting}>CSV</Button>
              <Button variant="secondary" size="sm" onClick={() => handleExport('docx')} disabled={exporting}>Word</Button>
            </div>
          </div>
        ) : (
          <div style={{ color: '#cbd5e1' }}>Choose a report to view details and export options.</div>
        )}
      </Modal>
    </div>
  );
}
