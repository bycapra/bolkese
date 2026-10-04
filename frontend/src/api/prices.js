const API_BASE = '/api/altin'

export class PriceRequestError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'PriceRequestError'
    this.status = status
  }
}

function messageForStatus(status, fallback) {
  switch (status) {
    case 401:
      return 'API anahtarı eksik veya geçersiz.'
    case 403:
      return 'Abonelik aktif değil veya erişim kısıtlı.'
    case 429:
      return 'İstek limiti aşıldı. Biraz sonra yeniden deneyin.'
    case 503:
      return 'Kaynak bağlantısı kesildi. Veri gecikmeli olabilir.'
    default:
      return fallback || 'Fiyatlar alınamadı.'
  }
}

async function parseError(response) {
  let fallback = `Fiyatlar alınamadı (${response.status}).`
  try {
    const body = await response.json()
    if (body?.error) fallback = body.error
  } catch {
    // keep fallback
  }
  throw new PriceRequestError(response.status, messageForStatus(response.status, fallback))
}

function toQuote(item, stale = false) {
  return {
    symbol: item.symbol,
    category: item.category || '',
    description: item.description || '',
    bid: Number(item.bid) || 0,
    ask: Number(item.ask) || 0,
    timestamp: item.timestamp,
    stale: Boolean(stale),
  }
}

export async function fetchPrices() {
  const response = await fetch(`${API_BASE}/prices`)
  if (!response.ok) await parseError(response)

  const body = await response.json()
  const quotes = new Map()
  for (const item of body.data || []) {
    quotes.set(item.symbol, toQuote(item, body.stale))
  }
  return { quotes, stale: Boolean(body.stale), updatedAt: body.updatedAt }
}

export async function fetchPrice(symbol) {
  const code = symbol.trim()
  if (!code) return null

  const response = await fetch(`${API_BASE}/prices/${encodeURIComponent(code)}`)
  if (response.status === 404) return null
  if (!response.ok) await parseError(response)

  const body = await response.json()
  return toQuote(body)
}
