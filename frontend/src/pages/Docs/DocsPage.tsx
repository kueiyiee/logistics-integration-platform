import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const docsContent: Record<string, { title: string; description: string; bullets: string[] }> = {
  '/docs/getting-started': {
    title: 'Getting started',
    description: 'Set up your environment, create an account, and learn the basic operational flow for the platform.',
    bullets: [
      'Create a workspace account and sign in securely.',
      'Review the dashboard and access the main admin modules.',
      'Use the platform starter checklist to onboard your first organization.',
    ],
  },
  '/docs/api': {
    title: 'API reference',
    description: 'Use the delivery portal APIs for authentication, company management, deliveries, and platform administration.',
    bullets: [
      'Authenticate with the session token returned from the login endpoint.',
      'Call the admin endpoints for users, roles, and platform configuration.',
      'Use the delivery and driver endpoints for operational workflows.',
    ],
  },
  '/docs/auth': {
    title: 'Auth flows',
    description: 'Understand the authentication and approval lifecycle for users, organizations, and system administrators.',
    bullets: [
      'Register a new account and await approval when required.',
      'Log in through the standard auth flow and redirect to the correct console.',
      'Reset passwords and manage account security from the protected dashboard.',
    ],
  },
};

export function DocsPage() {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentDoc = docsContent[currentPath] ?? null;

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 'clamp(1.5rem, 2.5vw, 3rem)', background: 'var(--surface-1)', color: 'var(--text-primary)' }}>
      <div style={{ width: '100%', maxWidth: 960, display: 'grid', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <span style={{ color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Documentation</span>
          <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.02 }}>Developer docs for 3PDMS</h1>
          <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
            Get started with auth, deployment, API integration, and System Admin workflows.
            This section is your source for onboarding guides, API references, and release notes.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <section style={{ padding: '1.5rem', borderRadius: 28, background: 'var(--surface-2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)' }}>Quick links</h2>
            <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
              <Link to="/docs/getting-started" style={{ padding: '1rem 1.2rem', borderRadius: 18, background: 'var(--surface-3)', color: 'var(--text-primary)', textDecoration: 'none', border: '1px solid var(--border)' }}>Getting started</Link>
              <Link to="/docs/api" style={{ padding: '1rem 1.2rem', borderRadius: 18, background: 'var(--surface-3)', color: 'var(--text-primary)', textDecoration: 'none', border: '1px solid var(--border)' }}>API reference</Link>
              <Link to="/docs/auth" style={{ padding: '1rem 1.2rem', borderRadius: 18, background: 'var(--surface-3)', color: 'var(--text-primary)', textDecoration: 'none', border: '1px solid var(--border)' }}>Auth flows</Link>
            </div>
          </section>

          <section style={{ padding: '1.5rem', borderRadius: 28, background: 'var(--surface-2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            {currentDoc ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)' }}>{currentDoc.title}</h2>
                    <p style={{ margin: '0.7rem 0 0', color: 'var(--text-muted)', lineHeight: 1.8 }}>{currentDoc.description}</p>
                  </div>
                  <Link to="/docs" style={{ padding: '0.75rem 1rem', borderRadius: 999, background: 'var(--accent)', color: 'white', textDecoration: 'none', fontWeight: 700 }}>Back to overview</Link>
                </div>

                <ul style={{ margin: '1rem 0 0', paddingLeft: '1.2rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                  {currentDoc.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)' }}>Docs overview</h2>
                <p style={{ margin: '1rem 0 0', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                  Select a quick link above to view the corresponding documentation section.
                </p>
              </>
            )}
          </section>

          <section style={{ padding: '1.5rem', borderRadius: 28, background: 'var(--surface-2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)' }}>Need more?</h2>
            <p style={{ margin: '1rem 0 0', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              The docs experience is now fully routed and available for onboarding, API guidance, and authentication walkthroughs.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
