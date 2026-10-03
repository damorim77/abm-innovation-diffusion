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
    </div>
  )
}
