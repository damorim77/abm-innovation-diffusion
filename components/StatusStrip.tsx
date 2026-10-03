"use client"

import { BRAND_COLORS } from "@/lib/simulation/defaults"
import type { WorldSnapshot } from "@/lib/simulation/types"
import { cn } from "cn"

export function StatusStrip({
  tick,
  year,
  maxTicks,
  adopters,
  totalPopulation,
}: {
  tick: number
  year: number
  maxTicks: number
  adopters: WorldSnapshot["adopters"] | null
  totalPopulation: number
}) {
  const progress = maxTicks > 0 ? Math.min(100, (tick / maxTicks) * 100) : 0

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-border/70 px-4 py-2 text-xs">
      <div className="flex items-center gap-3 font-mono tabular-nums">
        <span>
          Tick <span className="font-semibold text-foreground">{tick}</span>
          <span className="text-muted-foreground">/{maxTicks}</span>
        </span>
        <span className="text-muted-foreground">·</span>
        <span>
          Ano{" "}
          <span className="font-semibold text-foreground">{year.toFixed(2)}</span>
        </span>
      </div>

      <div
        className="h-1 min-w-24 flex-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Progresso da simulação"
        aria-valuemin={0}
        aria-valuemax={maxTicks}
        aria-valuenow={tick}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {adopters && (
        <div className="flex items-center gap-3">
          {(["A", "B", "C", "D"] as const).map((id) => (
            <div key={id} className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: BRAND_COLORS[id] }}
                aria-hidden="true"
              />
              <span className="font-mono font-semibold tabular-nums">
                {adopters[id]}
              </span>
              <span className="hidden text-[10px] text-muted-foreground lg:inline">
                {id}
              </span>
            </div>
          ))}
          <div className="flex items-baseline gap-1.5 border-l border-border/70 pl-3">
            <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
              Categoria
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums">
              {adopters.total}
            </span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums",
                adopters.total > 0
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {((adopters.total / totalPopulation) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
