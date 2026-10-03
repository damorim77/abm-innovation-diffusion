"use client"

import { useCallback, useMemo, useState } from "react"
import { Globe2, TrendingUp } from "lucide-react"
import { AppHeader } from "@/components/AppHeader"
import { StatusStrip } from "@/components/StatusStrip"
import { ConfigPanel } from "@/components/simulation/ConfigPanel"
import { DiffusionChart } from "@/components/simulation/DiffusionChart"
import { WorldCanvas } from "@/components/simulation/WorldCanvas"
import { useSimulation } from "@/hooks/useSimulation"
import { BRAND_COLORS, SEGMENT_COLORS, defaultParams } from "@/lib/simulation/defaults"
import type { SimulationParams } from "@/lib/simulation/types"

const SEGMENT_LABELS = ["Inovadores", "Iniciais", "Tardios"]
const BRAND_IDS = ["A", "B", "C", "D"] as const

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}

export default function Home() {
  const [params, setParams] = useState<SimulationParams>(defaultParams)
  const [speedTps, setSpeedTps] = useState(75)
  const sim = useSimulation()

  const stale = useMemo(
    () =>
      sim.initializedParamsJson !== null &&
      sim.initializedParamsJson !== JSON.stringify(params),
    [sim.initializedParamsJson, params]
  )

  const handleParamsChange = useCallback(
    (next: SimulationParams) => {
      if (sim.status === "running" && speedTps > 0) sim.pause()
      setParams(next)
    },
    [sim, speedTps]
  )

  const handleInit = useCallback(() => {
    sim.init(params)
  }, [sim, params])

  const handleRun = useCallback(() => {
    if (sim.status === "ready" || sim.status === "paused") sim.run(speedTps)
  }, [sim, speedTps])

  const handleFastForward = useCallback(() => {
    if (["ready", "paused", "running"].includes(sim.status)) sim.run(-1)
  }, [sim])

  const handleSpeedChange = useCallback(
    (tps: number) => {
      setSpeedTps(tps)
      if (sim.status === "running") sim.run(tps)
    },
    [sim]
  )

  const population = sim.initializedParamsJson
    ? (JSON.parse(sim.initializedParamsJson) as SimulationParams).environment
        .totalPopulation
    : params.environment.totalPopulation

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <AppHeader
        status={sim.status}
        stale={stale}
        speedTps={speedTps}
        onSpeedChange={handleSpeedChange}
        onInit={handleInit}
        onRun={handleRun}
        onPause={sim.pause}
        onFastForward={handleFastForward}
        onReset={sim.reset}
      />

      <StatusStrip
        tick={sim.tick}
        year={sim.year}
        maxTicks={params.environment.maxTicks}
        adopters={sim.adopters}
        totalPopulation={population}
      />

      <div className="flex min-h-0 flex-1">
        <aside
          className="w-[360px] shrink-0 overflow-y-auto border-r border-border/70 bg-card/30 p-3 xl:w-[400px]"
          aria-label="Parâmetros da simulação"
        >
          <ConfigPanel params={params} onChange={handleParamsChange} />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-3 p-3">
          <section
            className="flex h-[44%] min-h-56 flex-col overflow-hidden rounded-xl border border-border/60 bg-card/40"
            aria-label="Mundo da simulação"
          >
            <header className="flex items-center gap-2 border-b border-border/60 px-3.5 py-2">
              <Globe2
                className="size-3.5 text-primary"
                aria-hidden="true"
              />
              <h2 className="text-xs font-semibold tracking-tight">
                Mundo da Simulação
              </h2>
              <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1">
                {SEGMENT_LABELS.map((label, i) => (
                  <LegendDot key={label} color={SEGMENT_COLORS[i]} label={label} />
                ))}
                <span className="text-border">|</span>
                {BRAND_IDS.map((id) => (
                  <LegendDot
                    key={id}
                    color={BRAND_COLORS[id]}
                    label={`Marca ${id}`}
                  />
                ))}
              </div>
            </header>
            <div className="min-h-0 flex-1 p-2">
              <WorldCanvas worldRef={sim.worldRef} />
            </div>
          </section>

          <section
            className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-card/40"
            aria-label="Curvas de difusão"
          >
            <header className="flex items-center gap-2 border-b border-border/60 px-3.5 py-2">
              <TrendingUp className="size-3.5 text-primary" aria-hidden="true" />
              <h2 className="text-xs font-semibold tracking-tight">
                Curvas de Difusão
              </h2>
              <p className="ml-auto hidden text-[10px] text-muted-foreground md:block">
                micro (marcas) + macro (categoria) · adotantes acumulados
              </p>
            </header>
            <div className="min-h-0 flex-1 p-2">
              <DiffusionChart data={sim.chartData} />
            </div>
          </section>
        </main>
      </div>

      <footer className="flex items-center gap-2 border-t border-border/70 bg-card/40 px-4 py-1.5 text-[11px] text-muted-foreground">
        <GitHubMark className="size-3.5 shrink-0" />
        <a
          href="https://github.com/damorim77/abm-innovation-diffusion"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary hover:underline"
        >
          damorim77/abm-innovation-diffusion
        </a>
        <span aria-hidden="true">·</span>
        <a
          href="https://www.sciencedirect.com/science/article/abs/pii/S0167923610001247"
          target="_blank"
          rel="noreferrer"
          className="truncate hover:text-primary hover:underline"
          title="Schramm, Trainor, Shanker & Hu (2010). An agent-based diffusion model with consumer and brand agents. Decision Support Systems, 50(1), 234–242."
        >
          Schramm et al. (2010), Decision Support Systems, 50(1), 234–242
        </a>
      </footer>
    </div>
  )
}
