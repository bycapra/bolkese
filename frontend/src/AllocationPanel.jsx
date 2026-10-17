import { formatShare } from './allocation'

function donutBackground(buckets) {
  if (!buckets.length) return 'var(--line)'
  let cursor = 0
  const stops = []
  for (const bucket of buckets) {
    const start = cursor * 100
    cursor += bucket.share
    stops.push(`${bucket.color} ${start}% ${cursor * 100}%`)
  }
  return `conic-gradient(${stops.join(', ')})`
}

export default function AllocationPanel({ allocation, hidden, formatTRY }) {
  const { total, buckets, assets, topBucket, concentrated, insight } = allocation
  const topAssets = assets.slice(0, 4)
  const restShare = assets.slice(4).reduce((sum, row) => sum + row.share, 0)
  const ariaBuckets = buckets
    .map((bucket) => `${bucket.label} %${formatShare(bucket.share)}`)
    .join(', ')

  return (
    <section className="allocation-card" aria-label="Portföy dağılımı">
      <div className="allocation-heading">
        <div>
          <h2>Portföy dağılımı</h2>
          <span>Kategori ve varlık payları</span>
        </div>
      </div>

      {total <= 0 ? (
        <p className="allocation-empty">Miktar girdiğinizde altın, döviz ve nakit dağılımı burada görünür.</p>
      ) : (
        <div className="allocation-body">
          <div
            className="allocation-donut"
            style={{ background: donutBackground(buckets) }}
            role="img"
            aria-label={`Portföy dağılımı: ${ariaBuckets}`}
          >
            <span className="allocation-donut-hole">
              {topBucket ? `%${formatShare(topBucket.share)}` : '—'}
              <small>{topBucket ? topBucket.label : 'Dağılım'}</small>
            </span>
          </div>

          <div className="allocation-copy">
            {insight && <p className="allocation-insight">{insight}</p>}
            {concentrated && (
              <p className="allocation-warn">Yoğunlaşma yüksek: portföy birkaç kalemde toplanmış.</p>
            )}

            <ul className="allocation-legend">
              {buckets.map((bucket) => (
                <li key={bucket.id}>
                  <i style={{ background: bucket.color }} />
                  <span>{bucket.label}</span>
                  <strong>%{formatShare(bucket.share)}</strong>
                  {!hidden && <em>{formatTRY(bucket.value)}</em>}
                </li>
              ))}
            </ul>

            <ul className="allocation-assets">
              {topAssets.map((asset) => (
                <li key={asset.id}>
                  <span>{asset.name}</span>
                  <strong>%{formatShare(asset.share)}</strong>
                  {!hidden && <em>{formatTRY(asset.value)}</em>}
                </li>
              ))}
              {restShare > 0 && (
                <li>
                  <span>Diğer varlıklar</span>
                  <strong>%{formatShare(restShare)}</strong>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
