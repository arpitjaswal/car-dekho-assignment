import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const RANK_LABELS = ['Best Match', 'Runner Up', 'Also Great']

function BreakdownBar({ label, value, max, isTop }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{label}</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{value}/{max}</span>
      </div>
      <div style={{ height: 2, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${(value / max) * 100}%`,
          background: isTop ? 'var(--amber)' : 'rgba(255,255,255,0.18)',
          borderRadius: 2, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  )
}

function CarCard({ entry, rank, animClass }) {
  const { car, score, breakdown } = entry
  const isTop = rank === 0

  return (
    <div
      className={animClass}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isTop ? 'var(--amber-border)' : 'var(--border)'}`,
        borderRadius: 14, padding: '24px 28px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 52, lineHeight: 1, fontWeight: 300,
            color: isTop ? 'var(--amber)' : 'var(--text-3)', flexShrink: 0,
          }}>
            {String(rank + 1).padStart(2, '0')}
          </span>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: isTop ? 'var(--amber)' : 'var(--text-3)', marginBottom: 6 }}>
              {RANK_LABELS[rank]}
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', margin: '0 0 4px' }}>
              {car.brand} {car.name}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
              {car.bodyType} · ₹{(car.price / 100000).toFixed(1)} Lakh
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 44, fontWeight: 400, lineHeight: 1, color: isTop ? 'var(--amber)' : 'var(--text)' }}>
            {score}
          </span>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginTop: 4 }}>/ 100</p>
        </div>
      </div>

      {/* Stats pills */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { label: 'Mileage', value: car.mileage },
          { label: 'Safety', value: `${car.safetyRating} / 5 ★` },
          { label: 'Upkeep', value: car.maintenanceCost },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 8, padding: '10px 0', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 4 }}>Score Breakdown</p>
        <BreakdownBar label="Budget fit"       value={breakdown.budget}         max={30} isTop={isTop} />
        <BreakdownBar label="Safety"           value={breakdown.safety}         max={30} isTop={isTop} />
        <BreakdownBar label="Mileage"          value={breakdown.mileage}        max={25} isTop={isTop} />
        <BreakdownBar label="Family friendly"  value={breakdown.familyFriendly} max={15} isTop={isTop} />
      </div>
    </div>
  )
}

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const { recommendations, explanation } = location.state ?? {}

  if (!recommendations) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>No results found.</p>
        <button
          onClick={() => navigate('/')}
          style={{ padding: '10px 24px', background: 'var(--amber)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#0C0C0F', cursor: 'pointer' }}
        >
          Take the Quiz
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 56 }}>
      <Navbar />
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '52px 24px 60px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Header */}
        <div className="fade-up">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
            Ranked from 50 Indian cars
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontStyle: 'italic', fontWeight: 400, color: 'var(--text)', lineHeight: 1.1 }}>
            Your Top Matches
          </h1>
        </div>

        {/* AI Insight */}
        {explanation && (
          <div
            className="fade-up-1"
            style={{
              background: 'var(--surface)', borderRadius: 12,
              borderLeft: '3px solid var(--amber)',
              padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 8,
            }}
          >
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--amber)' }}>
              ✦ AI Insight
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-2)', fontStyle: 'italic' }}>{explanation}</p>
          </div>
        )}

        {/* Car cards */}
        {recommendations.map((entry, i) => (
          <CarCard
            key={entry.car.id}
            entry={entry}
            rank={i}
            animClass={`fade-up-${i + (explanation ? 2 : 1)}`}
          />
        ))}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <button
            onClick={() => navigate('/')}
            style={{ flex: 1, padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-2)', cursor: 'pointer', transition: 'all 0.15s' }}
          >
            ← Start Over
          </button>
          <button
            onClick={() => navigate('/history')}
            style={{ flex: 1, padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-2)', cursor: 'pointer', transition: 'all 0.15s' }}
          >
            View History
          </button>
        </div>

      </div>
    </div>
  )
}
