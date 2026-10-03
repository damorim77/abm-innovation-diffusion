import type { ConsumerGroupParams, EnvironmentParams, SimulationParams } from "./types"

export const BRAND_IDS = ["A", "B", "C", "D"] as const

export const BRAND_COLORS: Record<string, string> = {
  A: "#60a5fa",
  B: "#34d399",
  C: "#fbbf24",
  D: "#f87171",
  total: "#94a3b8",
}

export const SEGMENT_COLORS = ["#22d3ee", "#c084fc", "#f472b6"] as const

/** Normalização das interações prévias no Promotion Index */
export const INTERACTION_NORM = 10

/** Passo do random walk (fração do lado do mundo por tick) */
export const WALK_STEP = 0.02

export const defaultEnvironment: EnvironmentParams = {
  maxTicks: 605,
  ticksPerYear: 75,
  totalPopulation: 1000,
  adoptionThreshold: 0.73,
  encounterRadius: 0.05,
  seed: 42,
}

export const defaultConsumers: ConsumerGroupParams[] = [
  {
    id: "innovators",
    name: "Inovadores",
    sizePercent: 3,
    featureSensitivity: 0.61,
    priceSensitivity: 0.71,
    promoSensitivity: 0.7,
    socialInfluenceSensitivity: 0.7,
  },
  {
    id: "early",
    name: "Adotantes Iniciais",
    sizePercent: 45,
    featureSensitivity: 0.7,
    priceSensitivity: 0.7,
    promoSensitivity: 0.7,
    socialInfluenceSensitivity: 0.7,
  },
  {
    id: "late",
    name: "Adotantes Tardios",
    sizePercent: 52,
    featureSensitivity: 0.71,
    priceSensitivity: 0.74,
    promoSensitivity: 0.7,
    socialInfluenceSensitivity: 0.67,
  },
]

export const defaultBrands = BRAND_IDS.map((id) => ({
  id,
  features: 0.6,
  price: 0.6,
  promotion: 0.6,
  brandDensity: 0.6,
  marketEntry: { A: 0, B: 45, C: 125, D: 150 }[id],
}))

export const defaultCatWeights = {
  feature: 1,
  price: 1,
  promotion: 1,
  social: 1,
}

export const defaultParams: SimulationParams = {
  environment: defaultEnvironment,
  consumers: defaultConsumers,
  brands: defaultBrands,
  catWeights: defaultCatWeights,
}
