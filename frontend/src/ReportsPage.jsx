import { useEffect, useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { fetchMovements } from './api/movements'
import { downloadCsv, toCsv } from './exportCsv'

function formatQuantity(value) {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 4 }).format(value)
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function startOfDay(date) {
  return new Date(`${date}T00:00:00`).toISOString()
}

function endOfDay(date) {
  return new Date(`${date}T23:59:59.999`).toISOString()
}

function orphanKey(movement) {
  return `${movement.name}\t${movement.code}`
}

function exportFileName(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `bolkese-miktar-hareketleri-${year}-${month}-${day}.csv`
}

function exportMovements(rows) {
  const csv = toCsv(
    ['Tarih', 'Kategori', 'Kod', 'Birim', 'Yön', 'Miktar', 'Bakiye'],
    rows.map((movement) => [
      formatDateTime(movement.createdAt),
      movement.name,
      movement.code,
      movement.unit,
      movement.direction === 'in' ? 'Ekleme' : 'Çıkarma',
      formatQuantity(movement.quantity),
      formatQuantity(movement.balance),
    ]),
  )
  downloadCsv(exportFileName(), csv)
}

export default function ReportsPage({ assets }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [category, setCategory] = useState('')
  const [direction, setDirection] = useState('')
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const assetIds = useMemo(() => new Set(assets.map((asset) => asset.id)), [assets])
  const selectedAsset = assets.some((asset) => asset.id === category) ? category : ''
  const selectedOrphan = selectedAsset || !category ? '' : category

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchMovements({
      from: from ? startOfDay(from) : undefined,
      to: to ? endOfDay(to) : undefined,
      assetId: selectedAsset || undefined,
      direction: direction || undefined,
    })
      .then(({ movements: rows }) => {
        if (cancelled) return
        setMovements(rows)
        setError('')
      })
      .catch((err) => {
        if (cancelled) return
        setMovements([])
        setError(err.message || 'Hareketler alınamadı.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [from, to, selectedAsset, direction])

  const orphans = useMemo(() => {
    const seen = new Map()
    for (const movement of movements) {
      if (movement.assetId && assetIds.has(movement.assetId)) continue
      const key = orphanKey(movement)
      if (!seen.has(key)) seen.set(key, movement)
    }
    return [...seen.values()]
  }, [movements, assetIds])

  const rows = useMemo(() => {
    if (!selectedOrphan) return movements
    return movements.filter((movement) => orphanKey(movement) === selectedOrphan)
  }, [movements, selectedOrphan])

  const filtered = Boolean(from || to || category || direction)
  const emptyText = error
    ? error
    : loading
      ? 'Hareketler yükleniyor…'
      : filtered
        ? 'Sonuç bulunamadı.'
        : 'Henüz miktar hareketi yok.'

  return (
    <section className="reports-page" aria-label="Raporlar">
      <div className="section-heading">
        <div>
          <h2>Miktar hareketleri</h2>
          <span>
            {loading
              ? 'Hareketler yükleniyor…'
              : error
                ? error
                : `${rows.length} kayıt`}
          </span>
        </div>
        <button
          type="button"
          className="refresh-button"
          onClick={() => exportMovements(rows)}
          disabled={loading || rows.length === 0}
          aria-label="Excel olarak indir"
        >
          <Download size={16} />
          Excel olarak indir
        </button>
      </div>

      <div className="reports-filters">
        <label>
          <span>Başlangıç</span>
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            aria-label="Başlangıç tarihi"
          />
        </label>
        <label>
          <span>Bitiş</span>
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            aria-label="Bitiş tarihi"
          />
        </label>
        <label>
          <span>Kategori</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Kategori"
          >
            <option value="">Tümü</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name} · {asset.code}
              </option>
            ))}
            {orphans.map((movement) => (
              <option key={orphanKey(movement)} value={orphanKey(movement)}>
                {movement.name} · {movement.code}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Yön</span>
          <select
            value={direction}
            onChange={(event) => setDirection(event.target.value)}
            aria-label="Yön"
          >
            <option value="">Tümü</option>
            <option value="in">Ekleme</option>
            <option value="out">Çıkarma</option>
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <p className="markets-empty">{emptyText}</p>
      ) : (
        <div className="reports-table" role="table" aria-label="Miktar hareketleri">
          <div className="reports-head" role="row">
            <span>Tarih</span>
            <span>Kategori</span>
            <span>Kod</span>
            <span>Yön</span>
            <span>Miktar</span>
            <span>Bakiye</span>
          </div>
          {rows.map((movement) => {
            const incoming = movement.direction === 'in'
            return (
              <div className="reports-row" role="row" key={movement.id}>
                <span>{formatDateTime(movement.createdAt)}</span>
                <div className="market-name">
                  <strong>{movement.name}</strong>
                  <span>{movement.unit}</span>
                </div>
                <span>{movement.code}</span>
                <span className={incoming ? 'change-up' : 'change-down'}>
                  {incoming ? 'Ekleme' : 'Çıkarma'}
                </span>
                <span className={incoming ? 'change-up' : 'change-down'}>
                  {incoming ? '+' : '−'}{formatQuantity(movement.quantity)} {movement.unit}
                </span>
                <span>{formatQuantity(movement.balance)} {movement.unit}</span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
