"use client"

import { Network, Pause, Play, RotateCcw, Rocket, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "cn"
import type { SimulationStatus } from "@/lib/simulation/types"

const STATUS_META: Record<
  SimulationStatus | "stale",
  { label: string; dot: string; pulse?: boolean }
> = {
  idle: { label: "Aguarde inicialização", dot: "bg-slate-400" },
  ready: { label: "Pronto para simular", dot: "bg-primary" },
  running: { label: "Simulando", dot: "bg-emerald-400", pulse: true },
  paused: { label: "Pausado", dot: "bg-amber-400" },
  finished: { label: "Concluído", dot: "bg-violet-400" },
  stale: { label: "Parâmetros alterados — reinicialize", dot: "bg-amber-400" },
}

export function AppHeader({
  status,
  stale,
  speedTps,
  onSpeedChange,
  onInit,
  onRun,
  onPause,
  onFastForward,
  onReset,
}: {
  status: SimulationStatus
  stale: boolean
  speedTps: number
  onSpeedChange: (tps: number) => void
  onInit: () => void
  onRun: () => void
  onPause: () => void
  onFastForward: () => void
  onReset: () => void
}) {
  const meta = STATUS_META[stale ? "stale" : status]
  const canRun = (status === "ready" || status === "paused") && !stale
  const canFastForward =
    (status === "ready" || status === "paused" || status === "running") && !stale
  const running = status === "running" && speedTps > 0

  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border/70 bg-card/40 px-4 py-2.5 backdrop-blur">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Network className="size-4" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-sm leading-tight font-semibold tracking-tight">
            Simulador de Difusão da Inovação usando ABM
          </h1>
          <p className="text-[11px] leading-tight text-muted-foreground">
            <a
              href="https://www.sciencedirect.com/science/article/abs/pii/S0167923610001247"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary hover:underline"
              title="Schramm, Trainor, Shanker & Hu (2010). An agent-based diffusion model with consumer and brand agents. Decision Support Systems, 50(1), 234–242."
            >
              Schramm et al., 2010
            </a>
          </p>
        </div>
      </div>

      <div
        className="flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-2.5 py-1 text-[11px] font-medium"
        role="status"
        aria-label={`Status da simulação: ${meta.label}`}
      >
        <span
          className={cn(
            "size-1.5 rounded-full",
            meta.dot,
            meta.pulse && "motion-safe:animate-pulse"
          )}
          aria-hidden="true"
        />
        {stale && <TriangleAlert className="size-3 text-amber-400" aria-hidden="true" />}
        {meta.label}
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <div className="hidden items-center gap-2 rounded-lg border border-border/70 bg-background/60 px-2.5 py-1 md:flex">
          <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Velocidade
          </span>
          <input
            type="range"
            min={5}
            max={600}
            step={5}
            value={speedTps}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="h-1 w-24 accent-primary"
            aria-label="Velocidade da simulação em ticks por segundo"
          />
          <span className="w-12 font-mono text-[11px] tabular-nums text-muted-foreground">
            {speedTps} t/s
          </span>
        </div>

        <Button onClick={onInit} variant="outline" size="sm">
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Setup
        </Button>
        {running ? (
          <Button onClick={onPause} size="sm">
            <Pause className="size-3.5" aria-hidden="true" />
            Pausar
          </Button>
        ) : (
          <Button onClick={onRun} size="sm" disabled={!canRun}>
            <Play className="size-3.5" aria-hidden="true" />
            {status === "paused" ? "Retomar" : "Run Simulation"}
          </Button>
        )}
        <Button
          onClick={onFastForward}
          size="sm"
          variant="secondary"
          disabled={!canFastForward}
        >
          <Rocket className="size-3.5" aria-hidden="true" />
          Avanço rápido
        </Button>
        <Button
          onClick={onReset}
          size="sm"
          variant="ghost"
          aria-label="Reiniciar simulação"
        >
          Reset
        </Button>
      </div>
    </header>
  )
}
