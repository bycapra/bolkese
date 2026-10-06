import { useMemo, useState } from 'react'
import { Landmark, RefreshCw, Search } from 'lucide-react'
import { groupQuotes, labelFor } from './data/symbolLabels'

function formatPrice(value) {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value)
}

function matchesQuery(quote, needle) {
  if (!needle) return true
  const symbol = String(quote.symbol || '').toLocaleLowerCase('tr')
  const name = labelFor(quote).toLocaleLowerCase('tr')
  return symbol.includes(needle) || name.includes(needle)
}

export default function MarketsPage({ quotes, loading, error, stale, onRefresh, onAdd }) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLocaleLowerCase('tr')
  const filtered = useMemo(() => {
    if (!needle) return quotes
    const next = new Map()
    for (const [symbol, quote] of quotes) {
      if (matchesQuery(quote, needle)) next.set(symbol, quote)
    }
    return next
  }, [quotes, needle])

  const groups = groupQuotes(filtered)
  const total = quotes.size
  const count = filtered.size
  const searching = Boolean(needle)

  return (
    <section className="markets-page" aria-label="Piyasalar">
      <div className="section-heading">
        <div>
          <h2>Tüm piyasalar</h2>
          <span>
            {loading && !total
              ? 'Fiyatlar yükleniyor…'
              : error && !total
                ? error
                : `${count} sembol · satıra tıklayarak kategori ekleyin`}
          </span>
        </div>
        <button className="refresh-button" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={16} />
          Fiyatları yenile
        </button>
      </div>

      {total > 0 && (
        <label className="markets-search">
          <span className="markets-search-label">Piyasalarda ara</span>
          <span className="markets-search-field">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ad veya kod"
              aria-label="Piyasalarda ara"
            />
          </span>
        </label>
      )}

      {error && (
        <div className="market-note">
          <Landmark size={18} />
          <p>
            <strong>{stale ? 'Gecikmeli veri' : 'Fiyat bağlantısı'}</strong>
            <br />
            {error}
          </p>
        </div>
      )}

      {!error && !total && loading && (
        <p className="markets-empty">Piyasa fiyatları altinapi’den alınıyor.</p>
      )}

      {searching && total > 0 && count === 0 && (
        <p className="markets-empty">Sonuç bulunamadı.</p>
      )}

      {groups.map((group) => (
        <div className="markets-group" key={group.category}>
          <h3>{group.title}</h3>
          <div className="markets-table" role="table" aria-label={group.title}>
            <div className="markets-head" role="row">
              <span>Sembol</span>
              <span>Alış</span>
              <span>Satış</span>
            </div>
            {group.rows.map((quote) => (
              <button
                type="button"
                className="markets-row"
                key={quote.symbol}
                onClick={() => onAdd(quote)}
                aria-label={`${labelFor(quote)} kategorisini ekle`}
              >
                <div className="market-name">
                  <strong>{labelFor(quote)}</strong>
                  <span>{quote.symbol}</span>
                </div>
                <span className="markets-bid">{formatPrice(quote.bid)}</span>
                <span className="markets-ask">{formatPrice(quote.ask)}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
