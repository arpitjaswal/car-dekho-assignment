import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'

const API_URL = import.meta.env.VITE_API_URL

const LABELS = {
  budget:     { under5L: 'Under ₹5L', '5to10L': '₹5–10L', '10to20L': '₹10–20L', above20L: '₹20L+' },
  familySize: { solo: 'Solo', couple: 'Couple', small: 'Small family', large: 'Large family' },
  usage:      { cityCommute: 'City commute', highway: 'Highway', family: 'Family trips', mixed: 'Mixed' },
  priority:   { mileage: 'Mileage', safety: 'Safety', comfort: 'Comfort', features: 'Features' },
}

function timeAgo(isoString) {
  const diff = (Date.now() - new Date(isoString)) / 1000
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(`${API_URL}/api/history`)
      .then(r => setHistory(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function handleReview(entry) {
    navigate('/results', {
      state: {
        recommendations: entry.recommendations,
        answers: entry.answers,
        explanation: null,
      }
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 56 }}>
      <Navbar />
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '52px 24px 60px' }}>

        {/* Header */}
        <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
              {history.length} {history.length === 1 ? 'search' : 'searches'} saved
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontStyle: 'italic', fontWeight: 400, color: 'var(--text)', lineHeight: 1.1 }}>
              Search History
            </h1>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '10px 20px', background: 'var(--amber)', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#0C0C0F', cursor: 'pointer', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}
          >
            + New Search
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: '60px 0' }}>
            Loading...
          </p>
        )}

        {/* Empty */}
        {!loading && history.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', border: '1px solid var(--border)', borderRadius: 14 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontStyle: 'italic', color: 'var(--text-3)', marginBottom: 12 }}>No searches yet</p>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 24 }}>Take the quiz to find your perfect car.</p>
            <button
              onClick={() => navigate('/')}
              style={{ padding: '10px 28px', background: 'var(--amber)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#0C0C0F', cursor: 'pointer' }}
            >
              Start Matching →
            </button>
          </div>
        )}

        {/* Entries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {history.map((entry, idx) => {
            const top = entry.recommendations[0]
            const isOpen = expanded === entry.id

            return (
              <div
                key={entry.id}
                className={`fade-up`}
                style={{ animationDelay: `${idx * 0.04}s`, opacity: 0, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 6 }}
              >
                {/* Summary row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : entry.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                    padding: '18px 20px', background: isOpen ? 'var(--surface-2)' : 'var(--surface)',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    borderLeft: `3px solid ${isOpen ? 'var(--amber)' : 'transparent'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                      {Object.entries(entry.answers).map(([key, val]) => (
                        <span key={key} style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 20,
                          background: 'var(--surface-3)', color: 'var(--text-2)',
                          fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
                        }}>
                          {LABELS[key]?.[val] ?? val}
                        </span>
                      ))}
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {top.car.brand} {top.car.name}
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', marginLeft: 8 }}>{top.score}/100</span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{timeAgo(entry.timestamp)}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>

                {/* Expanded */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {entry.recommendations.map((r, i) => (
                      <div key={r.car.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: i === 0 ? 'var(--amber)' : 'var(--text-3)', minWidth: 28 }}>
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0 }}>{r.car.brand} {r.car.name}</p>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                              ₹{(r.car.price / 100000).toFixed(1)}L · {r.car.mileage} · {r.car.safetyRating}/5★
                            </p>
                          </div>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: i === 0 ? 'var(--amber)' : 'var(--text-2)', flexShrink: 0 }}>
                          {r.score}/100
                        </span>
                      </div>
                    ))}
                    <button
                      onClick={() => handleReview(entry)}
                      style={{ marginTop: 4, width: '100%', padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer', transition: 'all 0.15s' }}
                    >
                      View Full Results →
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
