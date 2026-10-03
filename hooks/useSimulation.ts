"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type {
  ChartPoint,
  SimCommand,
  SimEvent,
  SimulationParams,
  SimulationStatus,
  WorldSnapshot,
} from "@/lib/simulation/types"

export interface SimulationApi {
  status: SimulationStatus
  tick: number
  year: number
  adopters: WorldSnapshot["adopters"] | null
  worldRef: React.RefObject<WorldSnapshot | null>
  chartData: ChartPoint[]
  initializedParamsJson: string | null
  init: (params: SimulationParams) => void
  run: (tps: number) => void
  pause: () => void
  reset: () => void
}

const CHART_FLUSH_MS = 400

export function useSimulation(): SimulationApi {
  const [status, setStatus] = useState<SimulationStatus>("idle")
  const [tick, setTick] = useState(0)
  const [year, setYear] = useState(0)
  const [adopters, setAdopters] = useState<WorldSnapshot["adopters"] | null>(null)
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [initializedParamsJson, setInitializedParamsJson] = useState<string | null>(null)

  const workerRef = useRef<Worker | null>(null)
  const worldRef = useRef<WorldSnapshot | null>(null)
  const chartBufferRef = useRef<ChartPoint[]>([])
  const lastChartTickRef = useRef(-1)

  useEffect(() => {
    const worker = new Worker(new URL("../worker/simulation.worker.ts", import.meta.url), {
      type: "module",
    })
    workerRef.current = worker

    worker.onmessage = (e: MessageEvent<SimEvent>) => {
      const msg = e.data
      if (msg.type === "reset") {
        worldRef.current = null
        chartBufferRef.current = []
        lastChartTickRef.current = -1
        setTick(0)
        setYear(0)
        setAdopters(null)
        setChartData([])
        setStatus("idle")
        setInitializedParamsJson(null)
        return
      }
      if (msg.type === "snapshot") {
        const snapshot = msg.snapshot
        worldRef.current = snapshot
        setTick(snapshot.tick)
        setYear(snapshot.year)
        setAdopters(snapshot.adopters)

        const buffer = chartBufferRef.current
        const roundedYear = Math.round(snapshot.year * 100) / 100
        if (snapshot.tick === lastChartTickRef.current && buffer.length > 0) {
          // Mesmo tick (lote sem avanço): substitui o último ponto
          buffer[buffer.length - 1] = { year: roundedYear, ...snapshot.adopters }
        } else {
          lastChartTickRef.current = snapshot.tick
          buffer.push({ year: roundedYear, ...snapshot.adopters })
        }

        if (snapshot.finished) {
          setStatus("finished")
          setChartData([...chartBufferRef.current])
        }
      }
    }

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  // Flush periódico dos dados do gráfico (evita re-render do Recharts a cada frame)
  useEffect(() => {
    if (status !== "running") return
    const id = setInterval(() => {
      setChartData([...chartBufferRef.current])
    }, CHART_FLUSH_MS)
    return () => {
      clearInterval(id)
      setChartData([...chartBufferRef.current])
    }
  }, [status])

  const send = useCallback((cmd: SimCommand) => {
    workerRef.current?.postMessage(cmd)
  }, [])

  const init = useCallback(
    (params: SimulationParams) => {
      chartBufferRef.current = []
      lastChartTickRef.current = -1
      setChartData([])
      setInitializedParamsJson(JSON.stringify(params))
      send({ type: "init", params })
      setStatus("ready")
    },
    [send]
  )

  const run = useCallback(
    (tps: number) => {
      send({ type: "run", tps })
      setStatus("running")
    },
    [send]
  )

  const pause = useCallback(() => {
    send({ type: "pause" })
    setStatus("paused")
  }, [send])

  const reset = useCallback(() => {
    send({ type: "reset" })
  }, [send])

  return {
    status,
    tick,
    year,
    adopters,
    worldRef,
    chartData,
    initializedParamsJson,
    init,
    run,
    pause,
    reset,
  }
}
