import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Bell,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  CircleDollarSign,
  Coins,
  Euro,
  Eye,
  EyeOff,
  Gem,
  Home,
  Landmark,
  LayoutGrid,
  Minus,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  WalletCards,
  X,
} from 'lucide-react'

const STORAGE_KEY = 'bolkese-assets-v2'

const PRESETS = [
  {
    key: 'gold',
    name: 'Gram Altın',
    code: 'XAU',
    unit: 'gram',
    price: 6245.4,
    icon: 'gold',
    color: '#D69A29',
  },
  {
    key: 'usd',
    name: 'Amerikan Doları',
    code: 'USD',
    unit: 'adet',
    price: 44.18,
    icon: 'usd',
    color: '#159478',
  },
  {
    key: 'eur',
    name: 'Euro',
    code: 'EUR',
    unit: 'adet',
    price: 51.93,
    icon: 'eur',
    color: '#3867D6',
  },
  {
    key: 'try',
    name: 'Türk Lirası',
    code: 'TRY',
    unit: 'TL',
    price: 1,
    icon: 'cash',
    color: '#D6575D',
  },
  {
    key: 'other',
    name: 'Diğer Varlık',
    code: 'VAR',
    unit: 'adet',
    price: 0,
    icon: 'other',
    color: '#7C5CC4',
  },
]

const MARKET_ITEMS = [
  { name: 'Gram Altın', code: 'GA', price: 6245.4, change: 1.18, icon: 'gold' },
  { name: 'Dolar', code: 'USD', price: 44.18, change: 0.21, icon: 'usd' },
  { name: 'Euro', code: 'EUR', price: 51.93, change: -0.34, icon: 'eur' },
]

const iconMap = {
  gold: Coins,
  usd: CircleDollarSign,
  eur: Euro,
  cash: Banknote,
  other: Gem,
}

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

function timeNow() {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
}

function IconBadge({ icon, color, size = 'normal' }) {
  const Icon = iconMap[icon] || Gem
  return (
    <span
      className={`icon-badge ${size === 'small' ? 'icon-badge--small' : ''}`}
      style={{ '--asset-color': color }}
      aria-hidden="true"
    >
      <Icon size={size === 'small' ? 18 : 22} strokeWidth={1.9} />
    </span>
  )
}

function Modal({ children, onClose, labelledBy }) {
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.classList.remove('modal-open')
    }
  }, [onClose])

  return (
    <div className="modal-layer" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </section>
    </div>
  )
}

function AddAssetModal({ onClose, onCreate }) {
  const [selectedKey, setSelectedKey] = useState('gold')
  const selected = PRESETS.find((item) => item.key === selectedKey)
  const [form, setForm] = useState({ ...selected })

  const choosePreset = (preset) => {
    setSelectedKey(preset.key)
    setForm({ ...preset })
  }

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.code.trim()) return
    onCreate({
      ...form,
      id: crypto.randomUUID(),
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      amount: 0,
      price: Number(form.price) || 0,
      change: 0,
    })
  }

  return (
    <Modal onClose={onClose} labelledBy="add-asset-title">
      <div className="modal-head">
        <div>
          <span className="eyebrow">Yeni kategori</span>
          <h2 id="add-asset-title">Takip etmek istediğiniz varlık</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Pencereyi kapat">
          <X size={21} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="preset-grid" role="radiogroup" aria-label="Varlık türü">
          {PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.key}
              className={`preset ${selectedKey === preset.key ? 'preset--active' : ''}`}
              onClick={() => choosePreset(preset)}
              role="radio"
              aria-checked={selectedKey === preset.key}
            >
              <IconBadge icon={preset.icon} color={preset.color} size="small" />
              <span>{preset.key === 'gold' ? 'Altın' : preset.name.replace('Amerikan ', '')}</span>
              {selectedKey === preset.key && <Check size={15} className="preset-check" />}
            </button>
          ))}
        </div>

        <div className="form-grid">
          <label>
            <span>Kategori adı</span>
            <input
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="Örn. Gram Altın"
              autoFocus
              required
            />
          </label>
          <label>
            <span>Kod</span>
            <input
              value={form.code}
              onChange={(event) => updateField('code', event.target.value)}
              placeholder="XAU"
              maxLength={6}
              required
            />
          </label>
          <label>
            <span>Birim</span>
            <input
              value={form.unit}
              onChange={(event) => updateField('unit', event.target.value)}
              placeholder="gram"
              required
            />
          </label>
          <label>
            <span>Güncel alış fiyatı</span>
            <div className="input-with-suffix">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => updateField('price', event.target.value)}
                aria-label="Güncel alış fiyatı Türk lirası"
              />
              <span>₺</span>
            </div>
          </label>
        </div>

        <div className="api-note">
          <RefreshCw size={17} />
          <span>API bağlandığında alış fiyatı bu alanda otomatik güncellenecek.</span>
        </div>

        <div className="modal-actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Vazgeç
          </button>
          <button type="submit" className="button button--primary">
            Kategoriyi oluştur
            <ArrowRight size={17} />
          </button>
        </div>
      </form>
    </Modal>
  )
}

function UpdateAssetModal({ asset, onClose, onSave, onDelete }) {
  const [amount, setAmount] = useState(asset.amount)
  const [price, setPrice] = useState(asset.price)

  const step = asset.unit === 'gram' ? 1 : asset.unit === 'TL' ? 100 : 1
  const total = Math.max(0, Number(amount) || 0) * (Number(price) || 0)

  return (
    <Modal onClose={onClose} labelledBy="update-asset-title">
      <div className="modal-head asset-modal-head">
        <div className="asset-heading">
          <IconBadge icon={asset.icon} color={asset.color} />
          <div>
            <span className="eyebrow">{asset.code} · miktar güncelle</span>
            <h2 id="update-asset-title">{asset.name}</h2>
          </div>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Pencereyi kapat">
          <X size={21} />
        </button>
      </div>

      <div className="quantity-panel">
        <span className="field-label">Toplam miktar</span>
        <div className="quantity-control">
          <button
            type="button"
            aria-label={`${step} azalt`}
            onClick={() => setAmount((current) => Math.max(0, Number(current || 0) - step))}
          >
            <Minus size={21} />
          </button>
          <div>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              aria-label={`Toplam miktar, ${asset.unit}`}
            />
            <span>{asset.unit}</span>
          </div>
          <button
            type="button"
            aria-label={`${step} artır`}
            onClick={() => setAmount((current) => Number(current || 0) + step)}
          >
            <Plus size={21} />
          </button>
        </div>

        <div className="quick-add" aria-label="Hızlı miktar ekleme">
          {[step, step * 5, step * 10].map((value) => (
            <button key={value} type="button" onClick={() => setAmount((current) => Number(current || 0) + value)}>
              +{value} {asset.unit}
            </button>
          ))}
        </div>
      </div>

      <label className="price-field">
        <span>Güncel alış fiyatı</span>
        <div className="input-with-suffix">
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
          <span>₺</span>
        </div>
      </label>

      <div className="calculated-total">
        <span>Güncel toplam değer</span>
        <strong>{formatTRY(total)}</strong>
      </div>

      <div className="modal-actions modal-actions--between">
        <button type="button" className="delete-button" onClick={() => onDelete(asset.id)}>
          <Trash2 size={17} />
          Kategoriyi sil
        </button>
        <button
          type="button"
          className="button button--primary"
          onClick={() => onSave(asset.id, Number(amount) || 0, Number(price) || 0)}
        >
          Değişiklikleri kaydet
        </button>
      </div>
    </Modal>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div className="empty-state">
      <div className="empty-visual" aria-hidden="true">
        <div className="empty-coin empty-coin--one">₺</div>
        <div className="empty-coin empty-coin--two">€</div>
        <div className="empty-wallet"><WalletCards size={34} /></div>
      </div>
      <h3>İlk varlığınızı ekleyin</h3>
      <p>Altın, döviz veya nakit için bir kategori oluşturarak portföyünüzü takip etmeye başlayın.</p>
      <button className="button button--primary" onClick={onAdd}>
        <Plus size={18} />
        Kategori ekle
      </button>
      <span className="empty-hint">Kategoriler tamamen sizin kontrolünüzde.</span>
    </div>
  )
}

function AssetCard({ asset, hidden, onOpen }) {
  const Icon = iconMap[asset.icon] || Gem
  const total = asset.amount * asset.price
  const positive = asset.change >= 0

  return (
    <button className="asset-card" onClick={() => onOpen(asset)}>
      <div className="asset-card-top">
        <IconBadge icon={asset.icon} color={asset.color} />
        <span className="asset-code">{asset.code}</span>
        <span className="asset-more"><MoreHorizontal size={19} /></span>
      </div>
      <div className="asset-name">
        <Icon size={0} aria-hidden="true" />
        <strong>{asset.name}</strong>
        <span>{formatNumber(asset.amount)} {asset.unit}</span>
      </div>
      <div className="asset-total">{formatTRY(total, hidden)}</div>
      <div className="asset-meta">
        <span>Alış: {formatTRY(asset.price, hidden)}</span>
        {asset.change !== 0 && (
          <span className={positive ? 'change-up' : 'change-down'}>
            {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            %{Math.abs(asset.change).toFixed(2)}
          </span>
        )}
      </div>
    </button>
  )
}

function App() {
  const [assets, setAssets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    } catch {
      return []
    }
  })
  const [modal, setModal] = useState(null)
  const [hidden, setHidden] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(() => timeNow())
  const [toast, setToast] = useState('')
  const [activeNav, setActiveNav] = useState('home')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets))
  }, [assets])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timeout)
  }, [toast])

  const total = useMemo(
    () => assets.reduce((sum, asset) => sum + asset.amount * asset.price, 0),
    [assets],
  )

  const dailyChange = useMemo(
    () => assets.reduce((sum, asset) => sum + asset.amount * asset.price * (asset.change / 100), 0),
    [assets],
  )

  const createAsset = (asset) => {
    setAssets((current) => [...current, asset])
    setModal({ type: 'update', asset })
    setToast('Kategori oluşturuldu. Şimdi miktarınızı girebilirsiniz.')
  }

  const saveAsset = (id, amount, price) => {
    setAssets((current) => current.map((asset) => (
      asset.id === id ? { ...asset, amount, price } : asset
    )))
    setModal(null)
    setToast('Varlık miktarınız güncellendi.')
  }

  const deleteAsset = (id) => {
    setAssets((current) => current.filter((asset) => asset.id !== id))
    setModal(null)
    setToast('Kategori kaldırıldı.')
  }

  const refreshPrices = () => {
    setAssets((current) => current.map((asset) => {
      if (asset.code === 'TRY') return asset
      const change = Number(((Math.random() - 0.36) * 1.4).toFixed(2))
      return {
        ...asset,
        price: Number((asset.price * (1 + change / 100)).toFixed(2)),
        change,
      }
    }))
    setLastUpdated(timeNow())
    setToast(assets.length ? 'Demo piyasa fiyatları yenilendi.' : 'Henüz yenilenecek bir kategori yok.')
  }

  const handleNav = (item) => {
    setActiveNav(item)
    if (item !== 'home') setToast('Bu bölüm tasarımın sonraki ekranı için hazır.')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><WalletCards size={22} /></span>
          <span>BolKese</span>
        </div>

        <nav className="side-nav" aria-label="Ana menü">
          <button className={activeNav === 'home' ? 'active' : ''} onClick={() => handleNav('home')}>
            <Home size={19} />
            <span>Genel Bakış</span>
          </button>
          <button className={activeNav === 'assets' ? 'active' : ''} onClick={() => handleNav('assets')}>
            <LayoutGrid size={19} />
            <span>Varlıklarım</span>
            {assets.length > 0 && <small>{assets.length}</small>}
          </button>
          <button className={activeNav === 'market' ? 'active' : ''} onClick={() => handleNav('market')}>
            <ChartNoAxesCombined size={19} />
            <span>Piyasalar</span>
          </button>
        </nav>

        <div className="sidebar-foot">
          <div className="security-note">
            <ShieldCheck size={20} />
            <div>
              <strong>Verileriniz güvende</strong>
              <span>Bu cihazda saklanır</span>
            </div>
          </div>
          <button className="settings-link" onClick={() => handleNav('settings')}>
            <Settings size={18} />
            Ayarlar
          </button>
          <div className="profile">
            <span className="avatar">İY</span>
            <div>
              <strong>İsmail Yasar</strong>
              <span>Kişisel portföy</span>
            </div>
            <MoreHorizontal size={18} />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="date-label">PORTFÖYÜM</p>
            <h1>Genel Bakış</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button notification-button" aria-label="Bildirimler" onClick={() => setToast('Yeni bildiriminiz bulunmuyor.')}>
              <Bell size={20} />
              <span />
            </button>
            <button className="button button--primary add-button" onClick={() => setModal({ type: 'add' })}>
              <Plus size={18} />
              Kategori ekle
            </button>
          </div>
        </header>

        <section className="balance-card" aria-label="Portföy özeti">
          <div className="balance-content">
            <div className="balance-label">
              Toplam varlık değeri
              <button onClick={() => setHidden((value) => !value)} aria-label={hidden ? 'Bakiyeyi göster' : 'Bakiyeyi gizle'}>
                {hidden ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <div className="balance-value">{formatTRY(total, hidden)}</div>
            <div className="balance-change">
              {assets.length > 0 ? (
                <>
                  <span className={dailyChange >= 0 ? 'balance-pill' : 'balance-pill balance-pill--down'}>
                    {dailyChange >= 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                    {formatTRY(Math.abs(dailyChange), hidden)}
                  </span>
                  <span>dünden bugüne</span>
                </>
              ) : (
                <span>İlk kategorinizi eklediğinizde portföyünüz burada görünecek.</span>
              )}
            </div>
          </div>

          <div className="balance-side">
            <div className="mini-chart" aria-hidden="true">
              {[36, 45, 40, 56, 52, 68, 62, 79, 74, 88, 82, 100].map((height, index) => (
                <i key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="sync-status">
              <span className="live-dot" />
              Son güncelleme {lastUpdated}
            </div>
          </div>
        </section>

        <div className="content-grid">
          <section className="assets-section">
            <div className="section-heading">
              <div>
                <h2>Varlıklarım</h2>
                <span>{assets.length ? `${assets.length} kategori takip ediliyor` : 'Henüz kategori bulunmuyor'}</span>
              </div>
              <button className="refresh-button" onClick={refreshPrices}>
                <RefreshCw size={16} />
                Fiyatları yenile
              </button>
            </div>

            {assets.length === 0 ? (
              <EmptyState onAdd={() => setModal({ type: 'add' })} />
            ) : (
              <div className="asset-grid">
                {assets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    hidden={hidden}
                    onOpen={(selected) => setModal({ type: 'update', asset: selected })}
                  />
                ))}
                <button className="add-asset-card" onClick={() => setModal({ type: 'add' })}>
                  <span><Plus size={21} /></span>
                  <strong>Yeni kategori</strong>
                  <small>Portföyünüze varlık ekleyin</small>
                </button>
              </div>
            )}
          </section>

          <aside className="market-panel">
            <div className="section-heading">
              <div>
                <h2>Piyasa özeti</h2>
                <span>Demo alış fiyatları</span>
              </div>
              <Sparkles size={18} className="spark-icon" />
            </div>

            <div className="market-list">
              {MARKET_ITEMS.map((item) => {
                const positive = item.change >= 0
                const preset = PRESETS.find((presetItem) => presetItem.icon === item.icon)
                return (
                  <div className="market-row" key={item.code}>
                    <IconBadge icon={item.icon} color={preset.color} size="small" />
                    <div className="market-name">
                      <strong>{item.name}</strong>
                      <span>{item.code}</span>
                    </div>
                    <div className="market-price">
                      <strong>{formatTRY(item.price)}</strong>
                      <span className={positive ? 'change-up' : 'change-down'}>
                        {positive ? '+' : ''}{item.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <button className="market-link" onClick={() => handleNav('market')}>
              Tüm piyasayı görüntüle
              <ChevronRight size={17} />
            </button>

            <div className="market-note">
              <Landmark size={18} />
              <p><strong>Canlı veri bağlantısı</strong><br />API eklendiğinde alış fiyatları otomatik olarak burada güncellenecek.</p>
            </div>
          </aside>
        </div>
      </main>

      <nav className="mobile-nav" aria-label="Mobil menü">
        <button className={activeNav === 'home' ? 'active' : ''} onClick={() => handleNav('home')}>
          <Home size={21} /><span>Özet</span>
        </button>
        <button className={activeNav === 'assets' ? 'active' : ''} onClick={() => handleNav('assets')}>
          <LayoutGrid size={21} /><span>Varlıklar</span>
        </button>
        <button className="mobile-add" onClick={() => setModal({ type: 'add' })} aria-label="Kategori ekle">
          <Plus size={25} />
        </button>
        <button className={activeNav === 'market' ? 'active' : ''} onClick={() => handleNav('market')}>
          <ChartNoAxesCombined size={21} /><span>Piyasa</span>
        </button>
        <button className={activeNav === 'settings' ? 'active' : ''} onClick={() => handleNav('settings')}>
          <Settings size={21} /><span>Ayarlar</span>
        </button>
      </nav>

      {modal?.type === 'add' && (
        <AddAssetModal onClose={() => setModal(null)} onCreate={createAsset} />
      )}
      {modal?.type === 'update' && (
        <UpdateAssetModal
          asset={assets.find((asset) => asset.id === modal.asset.id) || modal.asset}
          onClose={() => setModal(null)}
          onSave={saveAsset}
          onDelete={deleteAsset}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          <span><Check size={15} /></span>
          {toast}
        </div>
      )}
    </div>
  )
}

export default App
