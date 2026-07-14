import React, { useEffect, useState } from 'react';
import { createApiKey, deleteApiKey, fetchApiKeys } from '../../services/auth';

export function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [formState, setFormState] = useState({ name: '', description: '', permissions: '' });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys().then((data) => setApiKeys(data));
  }, []);

  const addKey = async () => {
    setErrorMessage(null);
    setStatusMessage(null);

    const payload: { name: string; description?: string; purpose?: string; permissions?: string[] } = {
      name: formState.name.trim(),
      permissions: formState.permissions.split(',').map((entry) => entry.trim()).filter(Boolean),
    };

    if (formState.description.trim() !== '') {
      payload.description = formState.description.trim();
    } else {
      payload.purpose = 'Created from admin panel';
    }

    try {
      const response = await createApiKey(payload);
      setApiKeys((prev) => [response, ...prev]);
      setCreatedSecret(response.secret ?? null);
      setFormState({ name: '', description: '', permissions: '' });
      setStatusMessage('API key created successfully. Copy the secret now — it is shown once.');
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || error?.message || 'Unable to create API key.');
    }
  };

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <section style={{ padding: 'clamp(1.1rem, 2vw, 1.4rem)', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ margin: 0, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '0.8rem' }}>Developer access</p>
        <h1 style={{ margin: '0.35rem 0 0', fontSize: 'clamp(1.35rem, 2.2vw, 1.75rem)' }}>API Keys</h1>
        <p style={{ margin: '0.45rem 0 0', color: '#cbd5e1', lineHeight: 1.7 }}>Create scoped credentials for integrations with explicit permissions and expiry handling.</p>
      </section>

      <section style={{ padding: 'clamp(1.1rem, 2vw, 1.4rem)', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'grid', gap: '0.85rem', maxWidth: 760 }}>
          <label style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={{ color: '#cbd5e1' }}>Key name</span>
            <input value={formState.name} onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))} placeholder="New key name" style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
          </label>
          <label style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={{ color: '#cbd5e1' }}>Description</span>
            <textarea value={formState.description} onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))} placeholder="Used by the tracking service" rows={3} style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
          </label>
          <label style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={{ color: '#cbd5e1' }}>Permissions (comma separated)</span>
            <input value={formState.permissions} onChange={(event) => setFormState((prev) => ({ ...prev, permissions: event.target.value }))} placeholder="deliveries.read, deliveries.write" style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
          </label>
          <button type="button" onClick={addKey} style={{ justifySelf: 'start', padding: '0.8rem 1rem', borderRadius: 14, background: 'linear-gradient(135deg, #60a5fa, #818cf8)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Create key</button>
          {statusMessage ? (
            <div style={{ padding: '0.9rem', borderRadius: 18, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', color: '#0f766e', marginTop: 12 }}>{statusMessage}</div>
          ) : null}
          {errorMessage ? (
            <div style={{ padding: '0.9rem', borderRadius: 18, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#b91c1c', marginTop: 12 }}>{errorMessage}</div>
          ) : null}
          {createdSecret ? (
            <div style={{ padding: '1rem', borderRadius: 18, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', color: '#0f766e', display: 'grid', gap: '0.5rem', marginTop: 12 }}>
              <div style={{ fontWeight: 700 }}>New API key created</div>
              <div style={{ wordBreak: 'break-word' }}><strong>Secret:</strong> {createdSecret}</div>
              <button type="button" onClick={() => { navigator.clipboard.writeText(createdSecret).catch(() => undefined); }} style={{ width: 'fit-content', padding: '0.65rem 0.9rem', borderRadius: 12, border: 'none', background: '#0f766e', color: 'white', cursor: 'pointer' }}>Copy secret</button>
            </div>
          ) : null}
        </div>
      </section>

      <section style={{ display: 'grid', gap: '1rem' }}>
        {apiKeys.map((key) => (
          <article key={key.id} style={{ padding: '1rem', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(2,6,23,0.72)', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{key.name}</div>
                  <div style={{ marginTop: '0.4rem', color: '#cbd5e1' }}><strong>Description:</strong> {key.description || 'No description'}</div>
                  <div style={{ marginTop: '0.35rem', color: '#cbd5e1' }}><strong>Key:</strong> <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: 4, fontSize: '0.85em' }}>{key.public_key?.substring(0, 16)}...{key.public_key?.slice(-8)}</code></div>
                  <div style={{ marginTop: '0.35rem', color: '#cbd5e1' }}><strong>Permissions:</strong> {(key.permissions || []).join(', ') || 'None'}</div>
                  {key.expires_at ? (
                    <div style={{ marginTop: '0.35rem', color: '#cbd5e1' }}><strong>Expires:</strong> {new Date(key.expires_at).toLocaleDateString()}</div>
                  ) : null}
                  <div style={{ marginTop: '0.35rem', color: '#cbd5e1' }}><strong>Status:</strong> {key.status}</div>
                </div>
                <button type="button" onClick={async () => { await deleteApiKey(key.id); setApiKeys((prev) => prev.filter((item) => item.id !== key.id)); }} style={{ padding: '0.65rem 0.9rem', borderRadius: 12, background: 'rgba(248,113,113,0.14)', color: '#fecaca', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}>Delete</button>
              </div>
              {key.secret ? (
                <div style={{ padding: '0.8rem 0.9rem', borderRadius: 16, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(56,189,248,0.18)', color: '#0e7490', wordBreak: 'break-word' }}>
                  <strong>Secret</strong>: {key.secret}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
