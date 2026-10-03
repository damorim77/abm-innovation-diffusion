"use client"

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { BRAND_COLORS } from "@/lib/simulation/defaults"
import type { BrandId, ChartPoint } from "@/lib/simulation/types"

const GRID_COLOR = "#25304a"
const AXIS_COLOR = "#3a4767"
const TICK_COLOR = "#8a94ac"

/** Padrões de traço distintos por série (além da cor) */
const LINE_STYLES: Record<string, { dash?: string }> = {
  A: { dash: undefined },
  B: { dash: "6 3" },
  C: { dash: "2 4" },
  D: { dash: "10 5 2 5" },
}

const SERIES: { key: BrandId | "total"; name: string; width: number }[] = [
  { key: "A", name: "Marca A", width: 2 },
  { key: "B", name: "Marca B", width: 2 },
  { key: "C", name: "Marca C", width: 2 },
  { key: "D", name: "Marca D", width: 2 },
  { key: "total", name: "Categoria (total)", width: 2.5 },
]

export function DiffusionChart({ data }: { data: ChartPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-8 text-center text-sm text-muted-foreground">
        As curvas de difusão (marcas A–D e categoria) aparecem aqui após
        Initialize + Run.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 20, bottom: 2, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} strokeOpacity={0.6} />
        <XAxis
          dataKey="year"
          type="number"
          domain={[0, "dataMax"]}
          tickFormatter={(v: number) => v.toFixed(1)}
          tick={{ fontSize: 11, fill: TICK_COLOR }}
          stroke={AXIS_COLOR}
          tickLine={false}
          label={{
            value: "anos",
            position: "insideBottomRight",
            offset: -4,
            fontSize: 10,
            fill: TICK_COLOR,
          }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: TICK_COLOR }}
          stroke={AXIS_COLOR}
          tickLine={false}
          width={44}
        />
        <Tooltip
          labelFormatter={(label) => `Ano ${Number(label).toFixed(2)}`}
          contentStyle={{
            background: "#101728",
            border: "1px solid #26314f",
            borderRadius: 10,
            fontSize: 12,
            color: "#e6eaf4",
          }}
          labelStyle={{ color: TICK_COLOR }}
          cursor={{ stroke: AXIS_COLOR, strokeDasharray: "4 4" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
          iconType="plainline"
        />
        {SERIES.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={BRAND_COLORS[s.key]}
            strokeWidth={s.width}
            strokeDasharray={LINE_STYLES[s.key]?.dash}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
