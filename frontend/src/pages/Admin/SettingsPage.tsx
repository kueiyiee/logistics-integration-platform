import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export function SettingsPage() {
  const location = useLocation();
  const initialState = (location.state as { prefetchedSettings?: { name: string; status: string } } | null)?.prefetchedSettings || null;
  const [company, setCompany] = useState<{ name: string; status: string } | null>(initialState);
  const [name, setName] = useState(initialState?.name ?? '');
  const [status, setStatus] = useState(initialState?.status ?? 'active');
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialState);
  const [error, setError] = useState<string | null>(null);

  const auth = useAuth();

  useEffect(() => {
    if (company) {
      setLoading(false);
      return;
    }

    if (!auth.user?.company_id) {
      setError('This account is not associated with a company. Company settings are available only to company administrators.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    api.get('/v1/admin/settings')
      .then((response) => {
        setCompany(response.data.data);
        setName(response.data.data.name);
        setStatus(response.data.data.status || 'active');
      })
      .catch((err) => {
        const message = err?.response?.data?.message ?? 'Unable to load company settings. Please refresh or contact support.';
        setError(message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [company, auth.user]);

  const submit = async () => {
    try {
      const response = await api.put('/v1/admin/settings', { name, status });
      setCompany(response.data.data);
      // show a friendly inline success banner
      setSavedMessage('Settings saved successfully. Changes are now live.');
      setTimeout(() => setSavedMessage(null), 4000);
    } catch (e) {
      setSavedMessage('Failed to save settings. Please try again or contact support.');
      setTimeout(() => setSavedMessage(null), 6000);
    }
  };

  return (
    <div>
      <h1>Company settings</h1>
      {savedMessage && (
        <div style={{ marginTop: '1rem', padding: '0.8rem', borderRadius: 12, background: '#ecfccb', color: '#365314', border: '1px solid #d9f99d' }} role="status">
          {savedMessage}
        </div>
      )}
      {error && (
        <div style={{ marginTop: '1rem', padding: '0.8rem', borderRadius: 12, background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }} role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <p>Loading company data…</p>
      ) : company ? (
        <div style={{ maxWidth: 520, display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db' }} />
          </label>
          <label>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db' }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <button type="button" onClick={submit} style={{ padding: '0.75rem', background: '#111827', color: 'white', border: 'none', cursor: 'pointer' }}>
            Save settings
          </button>
        </div>
      ) : (
        <div style={{ marginTop: '1rem' }}>
          <p>Failed to load company settings.</p>
          <button type="button" onClick={() => setCompany(null)} style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: 12, background: '#1f2937', color: 'white', border: 'none', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
