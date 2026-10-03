import { INTERACTION_NORM, WALK_STEP } from "./defaults"
import { createRng } from "./rng"
import type {
  AgentStatusCode,
  BrandParams,
  CatWeights,
  ConsumerGroupParams,
  EnvironmentParams,
  WorldSnapshot,
} from "./types"

interface ConsumerAgent {
  x: number
  y: number
  groupIndex: number
  featureSensitivity: number
  priceSensitivity: number
  promoSensitivity: number
  socialInfluenceSensitivity: number
  /** Interações prévias com cada marca (índice = ordem de brands) */
  interactions: number[]
  /** -1 = ainda não adotou; caso contrário índice da marca adotada */
  adoptedBrand: number
}

interface BrandAgent {
  params: BrandParams
  x: number
  y: number
  active: boolean
  adopters: number
}

const ADOPTED_STATUS_BASE = 4

const BRAND_SLOTS: { x: number; y: number }[] = [
  { x: 0.3, y: 0.3 },
  { x: 0.7, y: 0.3 },
  { x: 0.3, y: 0.7 },
  { x: 0.7, y: 0.7 },
]

function wrap(v: number): number {
  const r = v % 1
  return r < 0 ? r + 1 : r
}

function sampleSensitivity(rng: () => number, mean: number): number {
  return Math.min(1, Math.max(0, mean + (rng() * 2 - 1) * 0.1))
}

/**
 * Motor ABM da difusão de inovação (Schramm et al., 2010).
 * Framework-agnostic: roda inteiramente dentro de um Web Worker.
 */
export class SimulationEngine {
  readonly environment: EnvironmentParams
  readonly consumers: ConsumerGroupParams[]
  readonly brands: BrandAgent[]
  readonly catWeights: CatWeights
  private readonly rng: () => number
  private readonly agents: ConsumerAgent[]
  private readonly radiusSq: number
  private tickCount = 0
  private totalAdopters = 0
  finished = false

  constructor(params: {
    environment: EnvironmentParams
    consumers: ConsumerGroupParams[]
    brands: BrandParams[]
    catWeights: CatWeights
  }) {
    this.environment = params.environment
    this.consumers = params.consumers
    this.catWeights = params.catWeights
    this.rng = createRng(params.environment.seed)
    this.radiusSq = params.environment.encounterRadius ** 2

    this.brands = params.brands.map((brandParams, i) => ({
      params: brandParams,
      ...BRAND_SLOTS[i % BRAND_SLOTS.length],
      active: false,
      adopters: 0,
    }))

    const pop = Math.max(1, Math.round(params.environment.totalPopulation))
    const groupSizes = this.distributePopulation(params.consumers, pop)
    const agentCount = groupSizes.reduce((s, n) => s + n, 0)

    this.agents = []
    for (let g = 0; g < groupSizes.length; g++) {
      const group = params.consumers[g]
      for (let i = 0; i < groupSizes[g]; i++) {
        this.agents.push({
          x: this.rng(),
          y: this.rng(),
          groupIndex: g,
          featureSensitivity: sampleSensitivity(this.rng, group.featureSensitivity),
          priceSensitivity: sampleSensitivity(this.rng, group.priceSensitivity),
          promoSensitivity: sampleSensitivity(this.rng, group.promoSensitivity),
          socialInfluenceSensitivity: sampleSensitivity(
            this.rng,
            group.socialInfluenceSensitivity
          ),
          interactions: new Array(params.brands.length).fill(0),
          adoptedBrand: -1,
        })
      }
    }
    // Ajusta população efetiva quando arredondamentos alteram o total
    this.environment = { ...params.environment, totalPopulation: agentCount }
  }

  /** Distribui a população entre segmentos proporcionalmente (maior resto) */
  private distributePopulation(
    groups: ConsumerGroupParams[],
    pop: number
  ): number[] {
    const totalPercent = groups.reduce((s, g) => s + g.sizePercent, 0)
    if (totalPercent <= 0) return groups.map(() => 0)
    const raw = groups.map((g) => (g.sizePercent / totalPercent) * pop)
    const sizes = raw.map(Math.floor)
    let remainder = pop - sizes.reduce((s, n) => s + n, 0)
    const order = raw
      .map((v, i) => ({ i, frac: v - Math.floor(v) }))
      .sort((a, b) => b.frac - a.frac)
    while (remainder > 0) {
      sizes[order[remainder % order.length].i]++
      remainder--
    }
    return sizes
  }

  /** Avança um tick: random walks, encontros e decisões de adoção */
  step(): void {
    if (this.finished) return
    this.tickCount++
    const tick = this.tickCount

    for (const brand of this.brands) {
      brand.active = tick >= brand.params.marketEntry
    }

    const anyActive = this.brands.some((b) => b.active)

    if (anyActive) {
      for (const agent of this.agents) {
        if (agent.adoptedBrand >= 0) continue

        // Random walk no toro [0,1)²
        const angle = this.rng() * Math.PI * 2
        agent.x = wrap(agent.x + Math.cos(angle) * WALK_STEP)
        agent.y = wrap(agent.y + Math.sin(angle) * WALK_STEP)

        for (let i = 0; i < this.brands.length; i++) {
          const brand = this.brands[i]
          if (!brand.active) continue

          const dx = agent.x - brand.x
          const dy = agent.y - brand.y
          if (dx * dx + dy * dy > this.radiusSq) continue

          // Probabilidade de interação ponderada pela brandDensity
          if (this.rng() >= brand.params.brandDensity) continue

          agent.interactions[i]++

          if (this.computeCat(agent, brand) > this.environment.adoptionThreshold) {
            agent.adoptedBrand = i
            brand.adopters++
            this.totalAdopters++
            break
          }
        }
      }
    } else {
      // Sem marcas ativas: apenas movimento
      for (const agent of this.agents) {
        if (agent.adoptedBrand >= 0) continue
        const angle = this.rng() * Math.PI * 2
        agent.x = wrap(agent.x + Math.cos(angle) * WALK_STEP)
        agent.y = wrap(agent.y + Math.sin(angle) * WALK_STEP)
      }
    }

    if (this.tickCount >= this.environment.maxTicks) {
      this.finished = true
    }
  }

  /** Consumer Adoption Threshold: média ponderada configurável dos 4 índices */
  private computeCat(agent: ConsumerAgent, brand: BrandAgent): number {
    const brandIndex = this.brands.indexOf(brand)

    const featureIndex = brand.params.features * agent.featureSensitivity
    const priceIndex = agent.priceSensitivity * (1 - brand.params.price)
    const promotionIndex =
      agent.promoSensitivity *
      brand.params.promotion *
      Math.min(agent.interactions[brandIndex] / INTERACTION_NORM, 1)
    const socialIndex =
      agent.socialInfluenceSensitivity *
      (brand.adopters / this.environment.totalPopulation)

    const { feature, price, promotion, social } = this.catWeights
    return (
      feature * featureIndex +
      price * priceIndex +
      promotion * promotionIndex +
      social * socialIndex
    )
  }

  get tick(): number {
    return this.tickCount
  }

  getSnapshot(): WorldSnapshot {
    const n = this.agents.length
    const positions = new Float32Array(n * 2)
    const agentStatus = new Uint8Array(n)
    for (let i = 0; i < n; i++) {
      const agent = this.agents[i]
      positions[i * 2] = agent.x
      positions[i * 2 + 1] = agent.y
      agentStatus[i] =
        agent.adoptedBrand >= 0
          ? (ADOPTED_STATUS_BASE + agent.adoptedBrand)
          : (agent.groupIndex as AgentStatusCode)
    }
    const adopters = { A: 0, B: 0, C: 0, D: 0, total: this.totalAdopters }
    for (let i = 0; i < this.brands.length; i++) {
      adopters[this.brands[i].params.id] = this.brands[i].adopters
    }
    return {
      tick: this.tickCount,
      year: this.tickCount / this.environment.ticksPerYear,
      finished: this.finished,
      adopters,
      activeBrands: this.brands.map((b) => b.active),
      brandPositions: this.brands.map((b) => ({ x: b.x, y: b.y })),
      positions,
      agentStatus,
    }
  }
}
