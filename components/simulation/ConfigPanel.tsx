"use client"

import type { LucideIcon } from "lucide-react"
import { Scale, SlidersHorizontal, Store, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EnvironmentConfig } from "@/components/simulation/EnvironmentConfig"
import { CatWeightsConfig } from "@/components/simulation/CatWeightsConfig"
import { ConsumerSegmentsConfig } from "@/components/simulation/ConsumerSegmentsConfig"
import { BrandsConfig } from "@/components/simulation/BrandsConfig"
import type { SimulationParams } from "@/lib/simulation/types"
import type { ReactNode } from "react"

function Section({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: LucideIcon
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <Card size="sm" className="gap-3 bg-card/50 ring-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-3.5" aria-hidden="true" />
          </span>
          {title}
        </CardTitle>
        {hint && (
          <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function ConfigPanel({
  params,
  onChange,
}: {
  params: SimulationParams
  onChange: (params: SimulationParams) => void
}) {
  return (
    <div className="space-y-3">
      <Section
        icon={SlidersHorizontal}
        title="Ambiente"
        hint="Tempo em ticks, população e limiar global de adoção."
      >
        <EnvironmentConfig
          value={params.environment}
          onChange={(environment) => onChange({ ...params, environment })}
        />
      </Section>

      <Section
        icon={Users}
        title="Consumidores"
        hint="Sensibilidade média por segmento; cada agente amostra U(média ± 0.1)."
      >
        <ConsumerSegmentsConfig
          value={params.consumers}
          onChange={(consumers) => onChange({ ...params, consumers })}
        />
      </Section>

      <Section
        icon={Store}
        title="Marcas"
        hint="Atributos competitivos, densidade de canais e atraso de entrada no mercado."
      >
        <BrandsConfig
          value={params.brands}
          onChange={(brands) => onChange({ ...params, brands })}
          ticksPerYear={params.environment.ticksPerYear}
        />
      </Section>

      <Section
        icon={Scale}
        title="Pesos do CAT"
        hint="CAT = Σ wᵢ × índiceᵢ · com w = 1 reproduz a soma do modelo original."
      >
        <CatWeightsConfig
          value={params.catWeights}
          onChange={(catWeights) => onChange({ ...params, catWeights })}
        />
      </Section>
    </div>
  )
}
