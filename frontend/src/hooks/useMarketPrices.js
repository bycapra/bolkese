import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchPrices } from '../api/prices'

const POLL_MS = 45000
const SNAPSHOT_KEY = 'bolkese-quotes-snapshot-v1'

function readSnapshot() {
  try {
    return JSON.parse(localStorage.getItem(SNAPSHOT_KEY)) || {}
  } catch {
    return {}
  }
}

export function useMarketPrices() {
  const [quotes, setQuotes] = useState(() => new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stale, setStale] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(null)
  const baselineRef = useRef(null)

  if (baselineRef.current === null) {
    baselineRef.current = readSnapshot()
  }

  const refresh = useCallback(async ({ silent } = {}) => {
    if (!silent) setLoading(true)

    try {
      const { quotes: next, stale: isStale } = await fetchPrices()
      const withChange = new Map()
      const snapshot = {}
      const baseline = baselineRef.current

      for (const [symbol, quote] of next) {
        const previous = baseline[symbol]
        const change = typeof previous === 'number' && previous !== 0
          ? ((quote.bid - previous) / previous) * 100
          : null
        withChange.set(symbol, { ...quote, change })
        snapshot[symbol] = quote.bid
      }

      if (Object.keys(baseline).length === 0) {
        baselineRef.current = snapshot
      }

      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot))
      setQuotes(withChange)
      setStale(isStale)
      setError('')
      setUpdatedAt(new Date())
      return { ok: true }
    } catch (err) {
      const message = err.message || 'Fiyatlar alınamadı.'
      setError(message)
      return { ok: false, message }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()

    let timer
    const start = () => {
      timer = window.setInterval(() => {
        refresh({ silent: true })
      }, POLL_MS)
    }
    const stop = () => window.clearInterval(timer)

    const onVisibility = () => {
      stop()
      if (document.hidden) return
      refresh({ silent: true })
      start()
    }

    start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [refresh])

  return { quotes, loading, error, stale, updatedAt, refresh }
}
