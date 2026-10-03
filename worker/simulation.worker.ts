/// <reference lib="webworker" />
import { SimulationEngine } from "@/lib/simulation/engine"
import type { SimCommand, SimEvent } from "@/lib/simulation/types"

let engine: SimulationEngine | null = null
let running = false
let tps = 75
let lastTime = 0
let acc = 0
let scheduled = false

function post(event: SimEvent, transfer: Transferable[] = []): void {
  self.postMessage(event, transfer)
}

function postSnapshot(): void {
  if (!engine) return
  const snapshot = engine.getSnapshot()
  post(
    { type: "snapshot", snapshot },
    [snapshot.positions.buffer, snapshot.agentStatus.buffer] as Transferable[]
  )
}

function schedule(): void {
  if (scheduled) return
  scheduled = true
  setTimeout(loop, 0)
}

function loop(): void {
  scheduled = false
  if (!running || !engine) return

  const now = performance.now()
  const dt = Math.min((now - lastTime) / 1000, 0.25)
  lastTime = now
  acc += tps < 0 ? Infinity : dt * tps

  const steps = tps < 0 ? 100 : Math.min(Math.floor(acc), 100)
  acc -= steps

  for (let i = 0; i < steps; i++) {
    engine.step()
    if (engine.finished) {
      running = false
      break
    }
  }

  if (steps > 0 || !running) postSnapshot()

  if (running) schedule()
}

self.onmessage = (e: MessageEvent<SimCommand>) => {
  const msg = e.data
  switch (msg.type) {
    case "init":
      engine = new SimulationEngine(msg.params)
      running = false
      acc = 0
      postSnapshot()
      break
    case "run":
      tps = msg.tps
      if (!running) {
        running = true
        acc = 0
        lastTime = performance.now()
      }
      schedule()
      break
    case "pause":
      running = false
      break
    case "reset":
      running = false
      engine = null
      post({ type: "reset" })
      break
  }
}
