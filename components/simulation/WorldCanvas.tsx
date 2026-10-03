"use client"

import { useEffect, useRef } from "react"
import { BRAND_COLORS, SEGMENT_COLORS } from "@/lib/simulation/defaults"
import type { WorldSnapshot } from "@/lib/simulation/types"

const STATUS_COLORS = [
  ...SEGMENT_COLORS,
  "#475569",
  BRAND_COLORS.A,
  BRAND_COLORS.B,
  BRAND_COLORS.C,
  BRAND_COLORS.D,
]

const CANVAS_BG = "#0a0f1e"
const GRID_COLOR = "rgba(91, 141, 239, 0.07)"

export function WorldCanvas({
  worldRef,
}: {
  worldRef: React.RefObject<WorldSnapshot | null>
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      const dpr = window.devicePixelRatio || 1
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      const snapshot = worldRef.current

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = CANVAS_BG
      ctx.fillRect(0, 0, w, h)

      if (!snapshot) {
        ctx.fillStyle = "rgba(138, 148, 172, 0.75)"
        ctx.font = "12.5px var(--font-sans), system-ui, sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(
          "Clique em Setup para instanciar consumidores e marcas",
          w / 2,
          h / 2
        )
        return
      }

      const side = Math.min(w, h) * 0.92
      const ox = (w - side) / 2
      const oy = (h - side) / 2

      // Grade do mundo
      ctx.strokeStyle = GRID_COLOR
      ctx.lineWidth = 1
      for (let i = 1; i < 10; i++) {
        ctx.beginPath()
        ctx.moveTo(ox + (side * i) / 10, oy)
        ctx.lineTo(ox + (side * i) / 10, oy + side)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(ox, oy + (side * i) / 10)
        ctx.lineTo(ox + side, oy + (side * i) / 10)
        ctx.stroke()
      }

      // Área de encontro das marcas (raio)
      const brandIds = Object.keys(BRAND_COLORS).filter((k) => k !== "total")
      snapshot.brandPositions.forEach((pos, i) => {
        if (!snapshot.activeBrands[i]) return
        const color = BRAND_COLORS[brandIds[i]]
        ctx.strokeStyle = color
        ctx.globalAlpha = 0.22
        ctx.lineWidth = 1
        ctx.setLineDash([3, 5])
        ctx.beginPath()
        ctx.arc(ox + pos.x * side, oy + pos.y * side, side * 0.05, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
      })

      // Consumidores
      const positions = snapshot.positions
      const agentStatus = snapshot.agentStatus
      const r =
        agentStatus.length > 4000 ? 1.3 : agentStatus.length > 1500 ? 1.8 : 2.4
      for (let i = 0; i < agentStatus.length; i++) {
        const x = ox + positions[i * 2] * side
        const y = oy + positions[i * 2 + 1] * side
        ctx.fillStyle = STATUS_COLORS[agentStatus[i]]
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      // Marcas (por cima dos agentes)
      snapshot.brandPositions.forEach((pos, i) => {
        const bx = ox + pos.x * side
        const by = oy + pos.y * side
        const active = snapshot.activeBrands[i]
        const color = BRAND_COLORS[brandIds[i]]
        const brandId = brandIds[i]

        if (active) {
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.roundRect(bx - 8, by - 8, 16, 16, 4)
          ctx.fill()
          ctx.fillStyle = "#0a0f1e"
          ctx.font = "bold 10px var(--font-mono), monospace"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(brandId, bx, by + 0.5)
        } else {
          ctx.strokeStyle = color
          ctx.globalAlpha = 0.5
          ctx.lineWidth = 1
          ctx.setLineDash([3, 3])
          ctx.beginPath()
          ctx.roundRect(bx - 7, by - 7, 14, 14, 4)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.fillStyle = "rgba(138, 148, 172, 0.7)"
          ctx.font = "9.5px var(--font-mono), monospace"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(brandId, bx, by)
          ctx.globalAlpha = 1
        }
        ctx.textBaseline = "alphabetic"
      })
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      observer.disconnect()
    }
  }, [worldRef])

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full rounded-lg ring-1 ring-border/60"
      aria-label="Visualização espacial do mundo da simulação"
    />
  )
}
