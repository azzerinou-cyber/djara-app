import Link from 'next/link';

export default function NotFound() {
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
      <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>

      <div
        style={{
          color: '#C77D69',
          fontSize: 64,
          fontWeight: 900,
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        404
      </div>

      <h1
        style={{
          color: '#59364A',
          fontSize: 22,
          fontWeight: 900,
          margin: '0 0 10px',
        }}
      >
        Page introuvable
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
        Cette page n&apos;existe pas ou a été déplacée. Peut-être avez-vous
        suivi un lien qui ne fonctionne plus ?
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          width: '100%',
          maxWidth: 280,
        }}
      >
        <Link
          href="/"
          style={{
            background: '#59364A',
            color: '#FAF7F2',
            borderRadius: 24,
            padding: '14px 28px',
            fontSize: 15,
            fontWeight: 700,
            textDecoration: 'none',
            display: 'block',
          }}
        >
          🏠 Retour à l&apos;accueil
        </Link>

        <Link
          href="/rechercher"
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
          🔍 Rechercher un service
        </Link>
      </div>

      <div
        style={{
          marginTop: 40,
          padding: '16px 20px',
          background: 'rgba(89,54,74,0.06)',
          borderRadius: 16,
          maxWidth: 300,
        }}
      >
        <p
          style={{
            color: '#59364A',
            fontSize: 13,
            fontStyle: 'italic',
            margin: 0,
            fontWeight: 500,
          }}
        >
          &ldquo;DJARA — Le talent des femmes, tout près de vous&rdquo;
        </p>
      </div>
    </div>
  );
}
