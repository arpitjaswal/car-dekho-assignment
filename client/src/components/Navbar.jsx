import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const link = (label, path) => (
    <button
      onClick={() => navigate(path)}
      style={{
        background: 'none', border: 'none', padding: '4px 0',
        fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase',
        color: pathname === path ? 'var(--amber)' : 'var(--text-3)',
        fontFamily: 'var(--font-mono)', cursor: 'pointer',
        transition: 'color 0.15s',
        borderBottom: `1px solid ${pathname === path ? 'var(--amber)' : 'transparent'}`,
      }}
    >
      {label}
    </button>
  )

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      height: 56,
      background: 'rgba(12,12,15,0.88)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 720, margin: '0 auto',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: 0 }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1L17 9L9 17L1 9L9 1Z" fill="var(--amber)" />
            <path d="M9 5L13 9L9 13L5 9L9 5Z" fill="var(--bg)" />
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text)', letterSpacing: '0.04em' }}>
            CarMatch
          </span>
        </button>

        {/* Links */}
        <div style={{ display: 'flex', gap: 28 }}>
          {link('Find a Car', '/')}
          {link('History', '/history')}
        </div>
      </div>
    </nav>
  )
}
