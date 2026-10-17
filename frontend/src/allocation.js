export const ALLOCATION_BUCKETS = [
  { id: 'altin', label: 'Altın', color: '#D69A29' },
  { id: 'doviz', label: 'Döviz', color: '#159478' },
  { id: 'nakit', label: 'Nakit', color: '#D6575D' },
  { id: 'diger', label: 'Diğer', color: '#7C5CC4' },
]

const GOLD_CATEGORIES = new Set(['MADEN', 'GRAM ALTIN', 'SARRAFIYE'])
const FX_CATEGORIES = new Set(['DOVIZ', 'PARITE'])

export function bucketFor(code, category) {
  const symbol = String(code || '').trim().toUpperCase()
  if (symbol === 'TRY') return 'nakit'
  if (FX_CATEGORIES.has(category)) return 'doviz'
  if (GOLD_CATEGORIES.has(category)) return 'altin'
  return 'diger'
}

export function formatShare(ratio) {
  return new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format((ratio || 0) * 100)
}

function symbolCategory(asset, symbolsByCode, quotes) {
  const code = String(asset.code || '').trim().toUpperCase()
  return quotes.get(code)?.category || symbolsByCode.get(code)?.category || ''
}

export function buildAllocation(assets, symbols = [], quotes = new Map()) {
  const symbolsByCode = new Map(
    symbols.map((symbol) => [String(symbol.code || '').trim().toUpperCase(), symbol]),
  )
  const bucketMap = new Map(ALLOCATION_BUCKETS.map((bucket) => [bucket.id, { ...bucket, value: 0 }]))
  const holdings = []
  let total = 0

  for (const asset of assets) {
    const value = (Number(asset.amount) || 0) * (Number(asset.price) || 0)
    if (value <= 0) continue
    const category = symbolCategory(asset, symbolsByCode, quotes)
    const bucketId = bucketFor(asset.code, category)
    const bucket = bucketMap.get(bucketId)
    bucket.value += value
    total += value
    holdings.push({
      id: asset.id,
      name: asset.name,
      code: asset.code,
      color: asset.color,
      value,
      bucketId,
    })
  }

  const buckets = ALLOCATION_BUCKETS
    .map((meta) => {
      const row = bucketMap.get(meta.id)
      return {
        ...meta,
        value: row.value,
        share: total > 0 ? row.value / total : 0,
      }
    })
    .filter((bucket) => bucket.value > 0)

  holdings.sort((a, b) => b.value - a.value)
  const assetsOut = holdings.map((row) => ({
    ...row,
    share: total > 0 ? row.value / total : 0,
  }))

  const topBucket = buckets.length
    ? buckets.slice().sort((a, b) => b.share - a.share)[0]
    : null
  const topAsset = assetsOut[0] || null
  const concentrated = Boolean(
    (topBucket && topBucket.share >= 0.7) || (topAsset && topAsset.share >= 0.6),
  )

  const locative = {
    altin: 'altında',
    doviz: 'dövizde',
    nakit: 'nakitte',
    diger: 'diğerde',
  }
  let insight = ''
  if (topBucket && topBucket.share >= 0.5) {
    insight = `Portföyünün %${formatShare(topBucket.share)}’si ${locative[topBucket.id]}.`
  } else if (topAsset) {
    insight = `En büyük kalem ${topAsset.name} (%${formatShare(topAsset.share)}).`
  }

  return {
    total,
    buckets,
    assets: assetsOut,
    topBucket,
    topAsset,
    concentrated,
    insight,
  }
}
