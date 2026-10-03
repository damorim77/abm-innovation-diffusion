"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ParamSlider } from "@/components/ParamSlider"
import type { EnvironmentParams } from "@/lib/simulation/types"

interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

function NumberField({ label, value, onChange, min, max }: NumberFieldProps) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-medium text-foreground/75">{label}</Label>
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const v = Number(e.target.value)
          if (!Number.isNaN(v)) onChange(v)
        }}
        className="h-7 font-mono text-xs"
      />
    </div>
  )
}

export function EnvironmentConfig({
  value,
  onChange,
}: {
  value: EnvironmentParams
  onChange: (value: EnvironmentParams) => void
}) {
  const set = <K extends keyof EnvironmentParams>(key: K, v: EnvironmentParams[K]) =>
    onChange({ ...value, [key]: v })

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        <NumberField
          label="População total"
          value={value.totalPopulation}
          onChange={(v) => set("totalPopulation", Math.max(1, Math.round(v)))}
          min={1}
          max={20000}
        />
        <NumberField
          label="Máx. ticks"
          value={value.maxTicks}
          onChange={(v) => set("maxTicks", Math.max(1, Math.round(v)))}
          min={1}
          max={100000}
        />
        <NumberField
          label="Ticks por ano"
          value={value.ticksPerYear}
          onChange={(v) => set("ticksPerYear", Math.max(1, Math.round(v)))}
          min={1}
        />
        <NumberField
          label="Semente (RNG)"
          value={value.seed}
          onChange={(v) => set("seed", Math.round(v))}
        />
      </div>
      <ParamSlider
        label="Adoption Threshold (global)"
        value={value.adoptionThreshold}
        onChange={(v) => set("adoptionThreshold", v)}
      />
      <ParamSlider
        label="Raio de encontro consumidor–marca"
        value={value.encounterRadius}
        onChange={(v) => set("encounterRadius", v)}
        min={0.01}
        max={0.2}
      />
      <p className="text-[10px] text-muted-foreground">
        Simulação de {(value.maxTicks / value.ticksPerYear).toFixed(1)} anos ·{" "}
        {value.maxTicks} ticks
      </p>
    </div>
  )
}
