import { Landmark, RefreshCw } from 'lucide-react'
import { groupQuotes, labelFor } from './data/symbolLabels'

function formatPrice(value) {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value)
}

export default function MarketsPage({ quotes, loading, error, stale, onRefresh }) {
  const groups = groupQuotes(quotes)
  const count = quotes.size

  return (
    <section className="markets-page" aria-label="Piyasalar">
      <div className="section-heading">
        <div>
          <h2>Tüm piyasalar</h2>
          <span>
            {loading && !count
              ? 'Fiyatlar yükleniyor…'
              : error && !count
                ? error
                : `${count} sembol · canlı alış / satış`}
          </span>
        </div>
        <button className="refresh-button" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={16} />
          Fiyatları yenile
        </button>
      </div>

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

      {!error && !count && loading && (
        <p className="markets-empty">Piyasa fiyatları altinapi’den alınıyor.</p>
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
              <div className="markets-row" role="row" key={quote.symbol}>
                <div className="market-name">
                  <strong>{labelFor(quote)}</strong>
                  <span>{quote.symbol}</span>
                </div>
                <span className="markets-bid">{formatPrice(quote.bid)}</span>
                <span className="markets-ask">{formatPrice(quote.ask)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
