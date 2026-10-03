export type BrandId = "A" | "B" | "C" | "D"

export type SegmentId = "innovators" | "early" | "late"

export interface EnvironmentParams {
  /** Duração total da simulação iterativa, em ticks */
  maxTicks: number
  /** Quantidade de ticks que representam um ano cronológico */
  ticksPerYear: number
  /** Tamanho da população simulada */
  totalPopulation: number
  /** Limiar global: adota se CAT > adoptionThreshold */
  adoptionThreshold: number
  /** Raio espacial (fração do mundo) para encontro consumidor-marca */
  encounterRadius: number
  /** Semente do PRNG para reprodutibilidade */
  seed: number
}

export interface ConsumerGroupParams {
  id: SegmentId
  name: string
  /** Proporção do segmento em relação à população total (%) */
  sizePercent: number
  /** Sensibilidade média a atributos (cada agente amostra U(média ± 0.1) clamped em [0,1]) */
  featureSensitivity: number
  priceSensitivity: number
  promoSensitivity: number
  socialInfluenceSensitivity: number
}

export interface BrandParams {
  id: BrandId
  /** Atributos do produto / estratégia de marketing em [0,1] */
  features: number
  price: number
  promotion: number
  /** Presença nos canais de distribuição: pondera a probabilidade de interação */
  brandDensity: number
  /** Momento de entrada no mercado, em ticks */
  marketEntry: number
}

export interface CatWeights {
  /** CAT = wFeat*FeatureIndex + wPrice*PriceIndex + wPromo*PromotionIndex + wSocial*SocialIndex */
  feature: number
  price: number
  promotion: number
  social: number
}

export interface SimulationParams {
  environment: EnvironmentParams
  consumers: ConsumerGroupParams[]
  brands: BrandParams[]
  catWeights: CatWeights
}

/** Status de cada agente no snapshot: 0..2 = segmento, 4..7 = adotou marca A..D */
export type AgentStatusCode = number

export interface WorldSnapshot {
  tick: number
  year: number
  finished: boolean
  adopters: Record<BrandId, number> & { total: number }
  activeBrands: boolean[]
  brandPositions: { x: number; y: number }[]
  /** Posições dos agentes: [x0, y0, x1, y1, ...] no toro [0,1)² */
  positions: Float32Array
  agentStatus: Uint8Array
}

export type SimulationStatus = "idle" | "ready" | "running" | "paused" | "finished"

export interface ChartPoint {
  year: number
  A: number
  B: number
  C: number
  D: number
  total: number
}

export type SimCommand =
  | { type: "init"; params: SimulationParams }
  | { type: "run"; tps: number }
  | { type: "pause" }
  | { type: "reset" }

export type SimEvent =
  | { type: "snapshot"; snapshot: WorldSnapshot }
  | { type: "reset" }
