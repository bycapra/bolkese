import { useMemo, useState } from 'react'
import { Eye, EyeOff, Search } from 'lucide-react'

function formatTRY(value, hide = false) {
  if (hide) return '•••••• ₺'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatNumber(value) {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 4 }).format(value)
}

function matchesQuery(asset, needle) {
  if (!needle) return true
  const name = String(asset.name || '').toLocaleLowerCase('tr')
  const code = String(asset.code || '').toLocaleLowerCase('tr')
  return name.includes(needle) || code.includes(needle)
}

export default function AssetsPage({
  assets,
  ready,
  hidden,
  onToggleHidden,
  onOpen,
  onAdd,
  IconBadge,
  empty,
}) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLocaleLowerCase('tr')
  const searching = Boolean(needle)

  const rows = useMemo(() => {
    const next = assets.filter((asset) => matchesQuery(asset, needle))
    next.sort((a, b) => String(a.name || '').localeCompare(b.name || '', 'tr'))
    return next
  }, [assets, needle])

  const waiting = !ready && !assets.length
  const subtitle = waiting
    ? 'Kategoriler yükleniyor…'
    : searching
      ? `${rows.length} sonuç`
      : assets.length
        ? `${assets.length} kategori`
        : 'Henüz kategori bulunmuyor'

  return (
    <section className="assets-page" aria-label="Varlıklarım">
      <div className="section-heading">
        <div>
          <h2>Kategoriler</h2>
          <span>{subtitle}</span>
        </div>
        <button
          type="button"
          className="refresh-button"
          onClick={onToggleHidden}
          aria-label={hidden ? 'Bakiyeyi göster' : 'Bakiyeyi gizle'}
        >
          {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
          {hidden ? 'Göster' : 'Gizle'}
        </button>
      </div>

      {!waiting && assets.length > 0 && (
        <label className="markets-search">
          <span className="markets-search-label">Kategorilerde ara</span>
          <span className="markets-search-field">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ad veya kod"
              aria-label="Kategorilerde ara"
            />
          </span>
        </label>
      )}

      {waiting && <p className="markets-empty">Kategoriler yükleniyor…</p>}

      {!waiting && !assets.length && empty}

      {!waiting && searching && assets.length > 0 && rows.length === 0 && (
        <p className="markets-empty">Sonuç bulunamadı.</p>
      )}

      {!waiting && rows.length > 0 && (
        <div className="assets-table" role="table" aria-label="Kategoriler">
          <div className="assets-head" role="row">
            <span>Kategori</span>
            <span>Miktar</span>
            <span>Değer</span>
          </div>
          {rows.map((asset) => (
            <button
              type="button"
              className="assets-row"
              key={asset.id}
              onClick={() => onOpen(asset)}
              aria-label={`${asset.name} miktarını güncelle`}
            >
              <div className="assets-row-name">
                <IconBadge icon={asset.icon} color={asset.color} size="small" />
                <div className="market-name">
                  <strong>{asset.name}</strong>
                  <span>{asset.code}</span>
                </div>
              </div>
              <span>{formatNumber(asset.amount)} {asset.unit}</span>
              <span className="assets-row-value">{formatTRY(asset.amount * asset.price, hidden)}</span>
            </button>
          ))}
          <button type="button" className="assets-add-row" onClick={onAdd}>
            Yeni kategori ekle
          </button>
        </div>
      )}
    </section>
  )
}
