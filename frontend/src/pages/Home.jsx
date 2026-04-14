import { useState, useRef, useCallback } from 'react'
import Waveform from '../components/Waveform'
import ResultCard from '../components/ResultCard'

const API_URL = 'http://localhost:8000'

export default function Home() {
  const [audioFile, setAudioFile]       = useState(null)
  const [audioBuffer, setAudioBuffer]   = useState(null)
  const [duration, setDuration]         = useState(null)
  const [recording, setRecording]       = useState(false)
  const [loading, setLoading]           = useState(false)
  const [result, setResult]             = useState(null)
  const [error, setError]               = useState(null)

  const fileInputRef  = useRef(null)
  const mediaRecRef   = useRef(null)
  const chunksRef     = useRef([])

  /* ── decode audio for waveform ── */
  const decodeAudio = useCallback(async (file) => {
    const ctx = new AudioContext()
    const buf = await file.arrayBuffer()
    const decoded = await ctx.decodeAudioData(buf)
    setDuration(decoded.duration)
    const raw = decoded.getChannelData(0)
    // Downsample for waveform display
    const samples = 800
    const step = Math.floor(raw.length / samples)
    const wave = new Float32Array(samples)
    for (let i = 0; i < samples; i++) wave[i] = raw[i * step]
    setAudioBuffer(wave)
    await ctx.close()
  }, [])

  /* ── file upload ── */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setResult(null); setError(null)

    if (!file.name.toLowerCase().endsWith('.wav')) {
      setError('Only .wav files are supported.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large (max 5 MB).')
      return
    }
    setAudioFile(file)
    await decodeAudio(file)
  }

  /* ── mic recording ── */
  const startRecording = async () => {
    setResult(null); setError(null); setAudioFile(null); setAudioBuffer(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        // Convert webm blob to a File so we can send it
        const wavFile = new File([blob], 'recording.wav', { type: 'audio/wav' })
        setAudioFile(wavFile)
        await decodeAudio(wavFile)
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start()
      mediaRecRef.current = mr
      setRecording(true)
    } catch (e) {
      setError('Microphone access denied or unavailable.')
    }
  }

  const stopRecording = () => {
    mediaRecRef.current?.stop()
    setRecording(false)
  }

  /* ── analyze ── */
  const analyze = async () => {
    if (!audioFile) return
    setLoading(true); setError(null); setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', audioFile)
      const res = await fetch(`${API_URL}/predict`, { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Analysis failed')
      }
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const clearAll = () => {
    setAudioFile(null); setAudioBuffer(null); setDuration(null)
    setResult(null); setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const fmtDur = s => s ? `${s.toFixed(1)}s` : ''

  return (
    <div className="app-shell">
      {/* ── Header ── */}
      <div className="header">
        <div className="header-badge"><span className="dot" />AI Voice Analysis</div>
        <h1>Voice <span>Parkinson's</span><br />Risk Detector</h1>
        <p>Record or upload a sustained "aaa" vowel (5–10 seconds). Our ML model analyzes voice biomarkers to assess neurological risk indicators.</p>
      </div>

      {/* ── Input ── */}
      <div className="card">
        <div className="card-label">Audio Input</div>
        <div className="input-row">
          <button
            className={`btn btn-record ${recording ? 'recording' : ''}`}
            onClick={recording ? stopRecording : startRecording}
          >
            {recording
              ? <><span style={{width:10,height:10,borderRadius:'50%',background:'var(--high)',animation:'pulse-dot 1s infinite',display:'inline-block'}}/>Stop Recording</>
              : <><MicIcon />Record Voice</>
            }
          </button>

          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
            <UploadIcon />Upload .wav
          </button>
          <input ref={fileInputRef} type="file" accept=".wav" onChange={handleFileChange} />
        </div>

        {/* File info */}
        {audioFile && (
          <div className="file-info">
            <FileIcon />
            <span className="file-name">{audioFile.name}</span>
            {duration && <span className="file-dur">{fmtDur(duration)}</span>}
            <button className="file-clear" onClick={clearAll}>×</button>
          </div>
        )}

        <p className="hint">Say "aaa" steadily for 5–10 seconds · Only .wav · Max 5 MB</p>
      </div>

      {/* ── Waveform ── */}
      {audioBuffer && (
        <div className="card">
          <div className="card-label">Audio Waveform</div>
          <Waveform audioBuffer={audioBuffer} />
        </div>
      )}

      {/* ── Analyze button ── */}
      <button
        className="btn btn-analyze"
        disabled={!audioFile || loading || recording}
        onClick={analyze}
      >
        {loading ? <><span className="spinner" style={{width:18,height:18,marginRight:8}}/>Analyzing…</> : '⚡ Analyze Voice'}
      </button>

      {/* ── Error ── */}
      {error && (
        <div className="error-box" style={{marginTop:16}}>
          <span>⚠</span>{error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="loading-state" style={{marginTop:8}}>
          <div className="spinner" />
          <div className="loading-text">Extracting biomarkers…</div>
        </div>
      )}

      {/* ── Results ── */}
      {result && !loading && (
        <div style={{marginTop:20}}>
          <ResultCard result={result} />
        </div>
      )}

      <p className="disclaimer">
        ⚕ This tool is for <strong>research and educational purposes only</strong>.<br />
        It is not a medical diagnostic device. Consult a qualified neurologist for clinical assessment.
      </p>
    </div>
  )
}

/* ── Inline SVG icons ── */
function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="9" y="2" width="6" height="11" rx="3"/>
      <path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/>
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  )
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7eb8f7" strokeWidth="2" strokeLinecap="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
    </svg>
  )
}
