'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En production, logger l'erreur vers un service de monitoring
    console.error('[DJARA Error]', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FAF7F2',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 56, marginBottom: 16 }}>🌸</div>
      <h1
        style={{
          color: '#59364A',
          fontSize: 22,
          fontWeight: 900,
          margin: '0 0 10px',
        }}
      >
        Une erreur est survenue
      </h1>
      <p
        style={{
          color: '#888',
          fontSize: 14,
          lineHeight: 1.6,
          maxWidth: 300,
          margin: '0 0 28px',
        }}
      >
        Quelque chose s&apos;est mal passé. Ne vous inquiétez pas, vos données
        sont en sécurité.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
        <button
          onClick={reset}
          style={{
            background: '#59364A',
            color: '#FAF7F2',
            border: 'none',
            borderRadius: 24,
            padding: '14px 28px',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Réessayer
        </button>

        <Link
          href="/"
          style={{
            background: 'transparent',
            color: '#59364A',
            border: '1.5px solid #59364A',
            borderRadius: 24,
            padding: '13px 28px',
            fontSize: 15,
            fontWeight: 600,
            textDecoration: 'none',
            display: 'block',
          }}
        >
          Retour à l&apos;accueil
        </Link>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <details
          style={{
            marginTop: 24,
            padding: 12,
            background: '#fff3f3',
            borderRadius: 10,
            border: '1px solid #ffcccc',
            maxWidth: 340,
            textAlign: 'left',
            fontSize: 11,
            color: '#c62828',
          }}
        >
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
            Détails de l&apos;erreur (dev)
          </summary>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
            {error.message}
          </pre>
        </details>
      )}
    </div>
  );
}
