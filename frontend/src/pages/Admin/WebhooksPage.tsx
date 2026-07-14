import React, { useEffect, useState } from 'react';
import { createWebhook, fetchWebhooks, type CreateWebhookPayload } from '../../services/auth';

export function WebhooksPage() {
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [formState, setFormState] = useState({ name: '', description: '', target_url: '', http_method: 'POST', retry_count: '3', timeout_seconds: '10', events: 'delivery.created' });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchWebhooks().then((data) => setEndpoints(data));
  }, []);

  const submit = async () => {
    setErrorMessage(null);
    setStatusMessage(null);

    const payload: CreateWebhookPayload = {
      name: formState.name.trim(),
      target_url: formState.target_url.trim(),
      http_method: formState.http_method,
      retry_count: Number(formState.retry_count),
      timeout_seconds: Number(formState.timeout_seconds),
      events: [formState.events.trim()],
    };

    if (formState.description.trim() !== '') {
      payload.description = formState.description.trim();
    } else {
      payload.purpose = 'Created from admin panel';
    }

    try {
      const response = await createWebhook(payload);
      setEndpoints((prev) => [response, ...prev]);
      setCreatedSecret(response.secret ?? null);
      setFormState({ name: '', description: '', target_url: '', http_method: 'POST', retry_count: '3', timeout_seconds: '10', events: 'delivery.created' });
      setStatusMessage('Webhook endpoint created successfully. Copy the secret now — it is shown once.');
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || error?.message || 'Unable to create webhook endpoint.');
    }
  };

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <section style={{ padding: 'clamp(1.1rem, 2vw, 1.4rem)', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ margin: 0, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '0.8rem' }}>Event delivery</p>
        <h1 style={{ margin: '0.35rem 0 0', fontSize: 'clamp(1.35rem, 2.2vw, 1.75rem)' }}>Webhook Endpoints</h1>
        <p style={{ margin: '0.45rem 0 0', color: '#cbd5e1', lineHeight: 1.7 }}>Connect delivery activity to downstream systems with reliable, auditable event subscriptions and retry controls.</p>
      </section>

      <section style={{ padding: 'clamp(1.1rem, 2vw, 1.4rem)', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'grid', gap: '0.85rem', maxWidth: 680 }}>
          <label style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={{ color: '#cbd5e1' }}>Name</span>
            <input value={formState.name} onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))} placeholder="Name" style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
          </label>
          <label style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={{ color: '#cbd5e1' }}>Description</span>
            <textarea value={formState.description} onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))} placeholder="Send delivery updates" rows={3} style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
          </label>
          <label style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={{ color: '#cbd5e1' }}>Target URL</span>
            <input value={formState.target_url} onChange={(event) => setFormState((prev) => ({ ...prev, target_url: event.target.value }))} placeholder="https://example.com/webhook" style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
            <label style={{ display: 'grid', gap: '0.45rem' }}>
              <span style={{ color: '#cbd5e1' }}>HTTP method</span>
              <select value={formState.http_method} onChange={(event) => setFormState((prev) => ({ ...prev, http_method: event.target.value }))} style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }}>
                <option value="POST">POST</option>
                <option value="GET">GET</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </label>
            <label style={{ display: 'grid', gap: '0.45rem' }}>
              <span style={{ color: '#cbd5e1' }}>Retry count</span>
              <input type="number" min="0" max="10" value={formState.retry_count} onChange={(event) => setFormState((prev) => ({ ...prev, retry_count: event.target.value }))} style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
            </label>
            <label style={{ display: 'grid', gap: '0.45rem' }}>
              <span style={{ color: '#cbd5e1' }}>Timeout (s)</span>
              <input type="number" min="1" max="60" value={formState.timeout_seconds} onChange={(event) => setFormState((prev) => ({ ...prev, timeout_seconds: event.target.value }))} style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
            </label>
          </div>
          <label style={{ display: 'grid', gap: '0.45rem' }}>
            <span style={{ color: '#cbd5e1' }}>Event</span>
            <input value={formState.events} onChange={(event) => setFormState((prev) => ({ ...prev, events: event.target.value }))} placeholder="delivery.created" style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc' }} />
          </label>
          <button type="button" onClick={submit} style={{ justifySelf: 'start', padding: '0.8rem 1rem', borderRadius: 14, background: 'linear-gradient(135deg, #60a5fa, #818cf8)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Create webhook</button>
          {statusMessage ? (
            <div style={{ padding: '0.9rem', borderRadius: 18, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', color: '#0f766e', marginTop: 12 }}>{statusMessage}</div>
          ) : null}
          {errorMessage ? (
            <div style={{ padding: '0.9rem', borderRadius: 18, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#b91c1c', marginTop: 12 }}>{errorMessage}</div>
          ) : null}
          {createdSecret ? (
            <div style={{ padding: '1rem', borderRadius: 18, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', color: '#0f766e', display: 'grid', gap: '0.5rem', marginTop: 12 }}>
              <div style={{ fontWeight: 700 }}>Webhook endpoint created</div>
              <div style={{ wordBreak: 'break-word' }}><strong>Secret:</strong> {createdSecret}</div>
              <button type="button" onClick={() => { navigator.clipboard.writeText(createdSecret).catch(() => undefined); }} style={{ width: 'fit-content', padding: '0.65rem 0.9rem', borderRadius: 12, border: 'none', background: '#0f766e', color: 'white', cursor: 'pointer' }}>Copy secret</button>
            </div>
          ) : null}
        </div>
      </section>

      <section style={{ display: 'grid', gap: '1rem' }}>
        {endpoints.map((endpoint) => (
          <article key={endpoint.id} style={{ padding: '1rem', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(2,6,23,0.72)', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
            <div style={{ fontWeight: 700 }}>{endpoint.name}</div>
            <div style={{ marginTop: '0.45rem', color: '#cbd5e1' }}><strong>URL:</strong> {endpoint.target_url}</div>
            <div style={{ marginTop: '0.45rem', color: '#cbd5e1' }}><strong>Events:</strong> {(endpoint.events || []).join(', ')}</div>
            <div style={{ marginTop: '0.35rem', color: '#cbd5e1' }}><strong>Retry:</strong> {endpoint.retry_count ?? 3} · {endpoint.timeout_seconds ?? 10}s</div>
          </article>
        ))}
      </section>
    </div>
  );
}
