"use client"

import { ParamSlider } from "@/components/ParamSlider"
import type { CatWeights } from "@/lib/simulation/types"

const FIELDS: { key: keyof CatWeights; label: string }[] = [
  { key: "feature", label: "Feature Index" },
  { key: "price", label: "Price Index" },
  { key: "promotion", label: "Promotion Index" },
  { key: "social", label: "Social Influence" },
]

export function CatWeightsConfig({
  value,
  onChange,
}: {
  value: CatWeights
  onChange: (value: CatWeights) => void
}) {
  return (
    <div className="space-y-2.5">
      {FIELDS.map((f) => (
        <ParamSlider
          key={f.key}
          label={f.label}
          value={value[f.key]}
          onChange={(v) => onChange({ ...value, [f.key]: v })}
          min={0}
          max={2}
          step={0.05}
        />
      ))}
    </div>
  )
}
