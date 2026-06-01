import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'

const API_URL = import.meta.env.VITE_API_URL

const STEPS = [
  {
    id: 'budget',
    question: 'What is your budget?',
    subtitle: 'We\'ll find the best match within your range.',
    options: [
      { value: 'under5L',   label: 'Under ₹5 Lakh',      icon: '🪙', desc: 'Entry-level picks' },
      { value: '5to10L',    label: '₹5 – ₹10 Lakh',      icon: '💰', desc: 'Popular sweet spot' },
      { value: '10to20L',   label: '₹10 – ₹20 Lakh',     icon: '💎', desc: 'Feature-rich options' },
      { value: 'above20L',  label: 'Above ₹20 Lakh',      icon: '🏆', desc: 'Premium & luxury' },
    ],
  },
  {
    id: 'familySize',
    question: 'How many people ride with you?',
    subtitle: 'So we can match you with the right seating capacity.',
    options: [
      { value: 'solo',    label: 'Just Me',          icon: '🧍', desc: 'Solo rider' },
      { value: 'couple',  label: 'Me + Partner',     icon: '👫', desc: '2 people' },
      { value: 'small',   label: 'Small Family',     icon: '👨‍👩‍👧', desc: '3–4 people' },
      { value: 'large',   label: 'Large Family',     icon: '👨‍👩‍👧‍👦', desc: '5+ people' },
    ],
  },
  {
    id: 'usage',
    question: 'How will you use the car most?',
    subtitle: 'Your driving lifestyle shapes the perfect match.',
    options: [
      { value: 'cityCommute', label: 'City Commute',    icon: '🏙️', desc: 'Daily stop-and-go traffic' },
      { value: 'highway',     label: 'Highway Cruising', icon: '🛣️', desc: 'Long intercity drives' },
      { value: 'family',      label: 'Family Trips',     icon: '🧳', desc: 'Vacations & outings' },
      { value: 'mixed',       label: 'Mixed Use',        icon: '🔄', desc: 'A bit of everything' },
    ],
  },
  {
    id: 'priority',
    question: 'What matters most to you?',
    subtitle: 'Pick your top priority — we\'ll score every car on it.',
    options: [
      { value: 'mileage',   label: 'Fuel Mileage',     icon: '⛽', desc: 'Lowest running cost' },
      { value: 'safety',    label: 'Safety',            icon: '🛡️', desc: 'Highest crash ratings' },
      { value: 'comfort',   label: 'Comfort & Space',   icon: '🛋️', desc: 'Smooth, spacious ride' },
      { value: 'features',  label: 'Tech & Features',   icon: '📱', desc: 'Latest infotainment & ADAS' },
    ],
  },
]

const BUDGET_MAP = {
  under5L:  5000000,
  '5to10L': 10000000,
  '10to20L': 20000000,
  above20L: Infinity,
}

export default function Questionnaire() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  function handleSelect(value) {
    setSelected(value)
  }

  async function handleNext() {
    if (!selected) return
    const updated = { ...answers, [current.id]: selected }
    setAnswers(updated)

    if (isLast) {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.post(`${API_URL}/api/match`, updated)
        navigate('/results', { state: data })
      } catch (err) {
        setError('Something went wrong. Please try again.')
        setLoading(false)
      }
      return
    }

    setStep(step + 1)
    setSelected(null)
  }

  function handleBack() {
    if (step === 0) return
    setStep(step - 1)
    setSelected(answers[STEPS[step - 1].id] ?? null)
  }

  const S = {
    page: { minHeight: '100vh', background: 'var(--bg)', paddingTop: 56 },
    progressTrack: { position: 'fixed', top: 56, left: 0, right: 0, height: 2, background: 'var(--surface-2)', zIndex: 40 },
    progressFill: {
      height: '100%', background: 'var(--amber)',
      width: `${((step + 1) / STEPS.length) * 100}%`,
      transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
    },
    wrap: {
      maxWidth: 560, margin: '0 auto', padding: '60px 24px 48px',
      display: 'flex', flexDirection: 'column',
    },
    stepRow: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 },
    stepNum: { fontFamily: 'var(--font-display)', fontSize: 56, lineHeight: 1, fontWeight: 300, color: 'var(--text-3)' },
    stepRule: { flex: 1, height: 1, background: 'var(--border)' },
    stepLabel: { fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)' },
    question: { fontFamily: 'var(--font-display)', fontSize: 32, fontStyle: 'italic', fontWeight: 400, lineHeight: 1.25, color: 'var(--text)', marginBottom: 6 },
    subtitle: { fontSize: 13, color: 'var(--text-2)', marginBottom: 32 },
    optionList: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 36 },
    nav: { display: 'flex', gap: 10 },
  }

  return (
    <div style={S.page}>
      <div style={S.progressTrack}><div style={S.progressFill} /></div>
      <Navbar />

      <div style={S.wrap} className="fade-in">
        {/* Step indicator */}
        <div style={S.stepRow}>
          <span style={S.stepNum}>0{step + 1}</span>
          <div style={S.stepRule} />
          <span style={S.stepLabel}>{step + 1} / {STEPS.length}</span>
        </div>

        {/* Question */}
        <h1 style={S.question}>{current.question}</h1>
        <p style={S.subtitle}>{current.subtitle}</p>

        {/* Options */}
        <div style={S.optionList}>
          {current.options.map((opt, i) => {
            const isChosen = selected === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '15px 18px',
                  background: isChosen ? 'var(--amber-dim)' : 'var(--surface)',
                  border: `1px solid ${isChosen ? 'var(--amber-border)' : 'var(--border)'}`,
                  borderLeft: `3px solid ${isChosen ? 'var(--amber)' : 'transparent'}`,
                  borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s ease', outline: 'none',
                  animationDelay: `${i * 0.05}s`,
                }}
                className="fade-in"
              >
                <span style={{ fontSize: 18, lineHeight: 1, minWidth: 24, textAlign: 'center' }}>{opt.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: isChosen ? 'var(--amber)' : 'var(--text)' }}>
                    {opt.label}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-2)' }}>{opt.desc}</p>
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  color: isChosen ? 'var(--amber)' : 'var(--text-3)',
                  opacity: isChosen ? 1 : 0, transition: 'opacity 0.15s',
                }}>✓</span>
              </button>
            )
          })}
        </div>

        {/* Error */}
        {error && (
          <p style={{ fontSize: 13, color: '#d07060', textAlign: 'center', marginBottom: 16 }}>{error}</p>
        )}

        {/* Navigation */}
        <div style={S.nav}>
          <button
            onClick={handleBack}
            disabled={step === 0}
            style={{
              padding: '12px 20px', background: 'none',
              border: '1px solid var(--border)', borderRadius: 8,
              fontSize: 13, color: step === 0 ? 'var(--text-3)' : 'var(--text-2)',
              cursor: step === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
            }}
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={!selected || loading}
            style={{
              flex: 1, padding: '12px 24px', border: 'none', borderRadius: 8,
              fontSize: 13, fontWeight: 600, letterSpacing: '0.02em',
              background: selected && !loading ? 'var(--amber)' : 'var(--surface-2)',
              color: selected && !loading ? '#0C0C0F' : 'var(--text-3)',
              cursor: selected && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Finding your car...' : isLast ? 'Find My Car →' : 'Continue →'}
          </button>
        </div>

        {/* Step pips */}
        <div style={{ display: 'flex', gap: 6, marginTop: 32, justifyContent: 'center' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              height: 2, borderRadius: 2,
              width: i === step ? 24 : i < step ? 16 : 8,
              background: i === step ? 'var(--amber)' : i < step ? 'var(--amber-dark)' : 'var(--surface-3)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}
