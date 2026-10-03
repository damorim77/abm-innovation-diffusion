"use client"

import type { CSSProperties } from "react"
import { Slider } from "@/components/ui/slider"
import { cn } from "cn"

interface ParamSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Cor de destaque do trilho/thumb (hex) */
  accent?: string
  className?: string
}

export function ParamSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  accent,
  className,
}: ParamSliderProps) {
  return (
    <div
      className={cn("space-y-1", accent && "slider-accent", className)}
      style={accent ? ({ "--slider-accent": accent } as CSSProperties) : undefined}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="truncate text-[11px] font-medium text-foreground/75">
          {label}
        </span>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {value.toFixed(2)}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
        aria-label={label}
      />
    </div>
  )
}
