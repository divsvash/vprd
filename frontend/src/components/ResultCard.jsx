import RiskMeter from './RiskMeter'

const ICONS = ['⚡', '🔊', '〰️', '📊']

export default function ResultCard({ result }) {
  const { risk_score, label, reasons, features } = result

  const chips = [
    { name: 'Jitter',   val: features.jitter.toFixed(5) },
    { name: 'Shimmer',  val: features.shimmer.toFixed(5) },
    { name: 'HNR',      val: features.hnr.toFixed(1) + ' dB' },
    { name: 'F0',       val: features.f0.toFixed(1) + ' Hz' },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div className="card">
        <div className="card-label">Analysis Result</div>
        <div className="results-grid">
          {/* Meter */}
          <RiskMeter score={risk_score} label={label} />

          {/* Reasons */}
          <div>
            <div className="card-label" style={{ marginBottom: 12 }}>Key Findings</div>
            <ul className="reasons-list">
              {reasons.map((r, i) => (
                <li key={i}>
                  <span className="icon">{ICONS[i % ICONS.length]}</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Feature chips */}
      <div className="card">
        <div className="card-label">Extracted Biomarkers</div>
        <div className="feature-grid">
          {chips.map(c => (
            <div key={c.name} className="feature-chip">
              <div className="f-name">{c.name}</div>
              <div className="f-val">{c.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
