"use client"

import { Input } from "@/components/ui/input"
import { ParamSlider } from "@/components/ParamSlider"
import { SEGMENT_COLORS } from "@/lib/simulation/defaults"
import type { ConsumerGroupParams } from "@/lib/simulation/types"

const SENSITIVITY_FIELDS: {
  key: Exclude<keyof ConsumerGroupParams, "id" | "name" | "sizePercent">
  label: string
}[] = [
  { key: "featureSensitivity", label: "Features" },
  { key: "priceSensitivity", label: "Preço" },
  { key: "promoSensitivity", label: "Promoção" },
  { key: "socialInfluenceSensitivity", label: "Social" },
]

export function ConsumerSegmentsConfig({
  value,
  onChange,
}: {
  value: ConsumerGroupParams[]
  onChange: (value: ConsumerGroupParams[]) => void
}) {
  const set = (index: number, patch: Partial<ConsumerGroupParams>) =>
    onChange(value.map((g, i) => (i === index ? { ...g, ...patch } : g)))

  const totalSize = value.reduce((s, g) => s + g.sizePercent, 0)

  return (
    <div className="space-y-2.5">
      {totalSize !== 100 && (
        <p className="rounded-md bg-amber-400/10 px-2 py-1 text-[11px] text-amber-300">
          Soma dos segmentos = {totalSize}% — a população é normalizada
          proporcionalmente.
        </p>
      )}
      <div className="grid grid-cols-3 gap-3">
        {value.map((group, i) => (
          <div key={group.id} className="space-y-2">
            <div className="flex items-center gap-1.5 border-b border-border/60 pb-1.5">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: SEGMENT_COLORS[i] }}
                aria-hidden="true"
              />
              <span className="truncate text-[11px] font-semibold">
                {group.name}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={group.sizePercent}
                min={0}
                max={100}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  if (!Number.isNaN(v)) set(i, { sizePercent: v })
                }}
                className="h-6 w-14 px-1.5 font-mono text-[11px]"
                aria-label={`${group.name} — tamanho da população (%)`}
              />
              <span className="text-[10px] text-muted-foreground">% pop.</span>
            </div>
            <div className="space-y-2">
              {SENSITIVITY_FIELDS.map((f) => (
                <ParamSlider
                  key={f.key}
                  label={f.label}
                  value={group[f.key]}
                  onChange={(v) => set(i, { [f.key]: v })}
                  accent={SEGMENT_COLORS[i]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
