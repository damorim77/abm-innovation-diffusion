"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ParamSlider } from "@/components/ParamSlider"
import { BRAND_COLORS } from "@/lib/simulation/defaults"
import type { BrandParams } from "@/lib/simulation/types"

const FIELDS: {
  key: Exclude<keyof BrandParams, "id" | "marketEntry">
  label: string
}[] = [
  { key: "features", label: "Features" },
  { key: "price", label: "Preço" },
  { key: "promotion", label: "Promoção" },
  { key: "brandDensity", label: "Place (canais)" },
]

export function BrandsConfig({
  value,
  onChange,
  ticksPerYear,
}: {
  value: BrandParams[]
  onChange: (value: BrandParams[]) => void
  ticksPerYear: number
}) {
  const set = (index: number, patch: Partial<BrandParams>) =>
    onChange(value.map((b, i) => (i === index ? { ...b, ...patch } : b)))

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4 xl:grid-cols-4">
      {value.map((brand, i) => (
        <div key={brand.id} className="space-y-2">
          <div className="flex items-center gap-1.5 border-b border-border/60 pb-1.5">
            <span
              className="size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: BRAND_COLORS[brand.id] }}
              aria-hidden="true"
            />
            <span className="text-[11px] font-semibold">Marca {brand.id}</span>
          </div>
          {FIELDS.map((f) => (
            <ParamSlider
              key={f.key}
              label={f.label}
              value={brand[f.key]}
              onChange={(v) => set(i, { [f.key]: v })}
              accent={BRAND_COLORS[brand.id]}
            />
          ))}
          <div className="space-y-0.5">
            <Label className="text-[11px] font-medium text-foreground/75">
              Entrada (ticks)
            </Label>
            <Input
              type="number"
              value={brand.marketEntry}
              min={0}
              step={5}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (!Number.isNaN(v))
                  set(i, { marketEntry: Math.max(0, Math.round(v)) })
              }}
              className="h-6 px-1.5 font-mono text-[11px]"
              aria-label={`Marca ${brand.id} — entrada no mercado em ticks`}
            />
            <p className="text-[10px] text-muted-foreground">
              ≈ ano {(brand.marketEntry / ticksPerYear).toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
