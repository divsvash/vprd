import { useEffect, useRef } from 'react'

export default function Waveform({ audioBuffer, color = '#00d4ff' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio
    const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.clearRect(0, 0, W, H)

    const data = audioBuffer
    const step = Math.ceil(data.length / (W / 2))
    const amp = H / 2

    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.shadowColor = color
    ctx.shadowBlur = 6

    ctx.beginPath()
    for (let i = 0; i < W; i++) {
      const idx = Math.floor((i / W) * data.length)
      const v = data[idx] * amp
      if (i === 0) ctx.moveTo(i, amp - v)
      else ctx.lineTo(i, amp - v)
    }
    ctx.stroke()

    // Mirror
    ctx.globalAlpha = 0.3
    ctx.beginPath()
    for (let i = 0; i < W; i++) {
      const idx = Math.floor((i / W) * data.length)
      const v = data[idx] * amp * 0.6
      if (i === 0) ctx.moveTo(i, amp + v)
      else ctx.lineTo(i, amp + v)
    }
    ctx.stroke()
    ctx.globalAlpha = 1
  }, [audioBuffer, color])

  return <canvas ref={canvasRef} className="waveform-canvas" />
}
