import { useEffect, useRef } from 'react'

const COLORS = { Low: '#00e87a', Medium: '#ffb800', High: '#ff3d5a' }
const GLOWS  = { Low: 'rgba(0,232,122,0.6)', Medium: 'rgba(255,184,0,0.6)', High: 'rgba(255,61,90,0.6)' }

function polarToXY(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx, cy, r, startDeg, endDeg) {
  const s = polarToXY(cx, cy, r, startDeg)
  const e = polarToXY(cx, cy, r, endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
}

export default function RiskMeter({ score, label }) {
  const pct = Math.round(score * 100)
  const color = COLORS[label] || '#00d4ff'
  const glow  = GLOWS[label]  || 'rgba(0,212,255,0.6)'

  const cx = 100, cy = 105, r = 76
  const startDeg = -150
  const endDeg   = 150
  const fillDeg  = startDeg + (endDeg - startDeg) * score

  const trackPath = arcPath(cx, cy, r, startDeg, endDeg)
  const fillPath  = score > 0 ? arcPath(cx, cy, r, startDeg, fillDeg) : null

  const needle = polarToXY(cx, cy, r - 10, fillDeg)

  return (
    <div className="risk-meter-wrap">
      <svg viewBox="0 0 200 120" className="risk-svg" style={{ filter: `drop-shadow(0 0 10px ${glow})` }}>
        <defs>
          <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00e87a" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#ffb800" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff3d5a" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track */}
        <path d={trackPath} fill="none" stroke="#1e3050" strokeWidth="10" strokeLinecap="round" />

        {/* Colored fill */}
        {fillPath && (
          <path d={fillPath} fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round" filter="url(#glow)"
            style={{ transition: 'all 0.8s cubic-bezier(.4,0,.2,1)' }} />
        )}

        {/* Needle dot */}
        {fillPath && (
          <circle cx={needle.x} cy={needle.y} r="5" fill={color}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
        )}

        {/* Center score */}
        <text x={cx} y={cy + 4} textAnchor="middle"
          fill={color} fontSize="28" fontWeight="700"
          fontFamily="Space Mono, monospace"
          style={{ filter: `drop-shadow(0 0 8px ${glow})` }}>
          {pct}%
        </text>
        <text x={cx} y={cy + 20} textAnchor="middle"
          fill="#5a7a9e" fontSize="9" fontFamily="Space Mono, monospace"
          letterSpacing="0.1em">
          RISK SCORE
        </text>
      </svg>

      <span className={`risk-label-badge label-${label.toLowerCase()}`}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color,
          boxShadow: `0 0 6px ${color}`, display: 'inline-block' }} />
        {label} Risk
      </span>
    </div>
  )
}
