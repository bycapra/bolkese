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
  HandCoins,
  Home,
  Landmark,
  LayoutGrid,
  LogOut,
  Minus,
  MoreHorizontal,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  WalletCards,
  X,
} from 'lucide-react'
import { fetchMe, logoutAccount } from './api/auth'
import { createAssetRecord, deleteAssetRecord, fetchAssets, updateAssetRecord } from './api/assets'
import { fetchPrice } from './api/prices'
import AuthScreen from './AuthScreen'
import { useMarketPrices } from './hooks/useMarketPrices'

const STORAGE_KEY = 'bolkese-assets-v2'
const MANUAL_CODES = new Set(['TRY'])
const CODE_MIGRATE = {
  XAU: 'ALTIN',
  USD: 'USDTRY',
  EUR: 'EURTRY',
  GA: 'ALTIN',
}

const PRESETS = [
  {
    key: 'gold',
    name: 'Gram Altın',
    code: 'ALTIN',
    unit: 'gram',
    price: 0,
    ask: 0,
    icon: 'gold',
    color: '#D69A29',
  },
  {
    key: 'usd',
    name: 'Amerikan Doları',
    code: 'USDTRY',
    unit: 'adet',
    price: 0,
    ask: 0,
    icon: 'usd',
    color: '#159478',
  },
  {
    key: 'eur',
    name: 'Euro',
    code: 'EURTRY',
    unit: 'adet',
    price: 0,
    ask: 0,
    icon: 'eur',
    color: '#3867D6',
  },
  {
    key: 'try',
    name: 'Türk Lirası',
    code: 'TRY',
    unit: 'TL',
    price: 1,
    ask: 1,
    icon: 'cash',
    color: '#D6575D',
  },
  {
    key: 'other',
    name: 'Diğer Varlık',
    code: 'VAR',
    unit: 'adet',
    price: 0,
    ask: 0,
    icon: 'other',
    color: '#7C5CC4',
  },
]

const MARKET_WATCHLIST = [
  { name: 'Gram Altın', code: 'ALTIN', icon: 'gold' },
  { name: 'Dolar', code: 'USDTRY', icon: 'usd' },
  { name: 'Euro', code: 'EURTRY', icon: 'eur' },
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

function timeNow(date = new Date()) {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function migrateAssets(assets) {
  return assets.map((asset) => {
    const code = CODE_MIGRATE[asset.code] || asset.code
    const price = code === 'TRY' ? 1 : Number(asset.price) || 0
    return {
      ...asset,
      code,
      price,
      ask: Number(asset.ask) || price,
    }
  })
}

function loadStoredAssets() {
  try {
    return migrateAssets(JSON.parse(localStorage.getItem(STORAGE_KEY)) || [])
  } catch {
    return []
  }
}

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

async function migrateLocalAssets() {
  const stored = loadStoredAssets()
  if (!stored.length) return []

  const created = []
  for (const asset of stored) {
    const { asset: row } = await createAssetRecord({
      name: asset.name,
      code: asset.code,
      unit: asset.unit,
      amount: asset.amount,
      icon: asset.icon,
      color: asset.color,
      key: asset.key,
      price: asset.price,
      ask: asset.ask,
    })
    created.push(row)
  }
  localStorage.removeItem(STORAGE_KEY)
  return created
}

function isManualCode(code) {
  return MANUAL_CODES.has(code)
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

function PricePair({ bid, ask, hidden, change }) {
  const hasChange = typeof change === 'number' && change !== 0
  const positive = (change || 0) >= 0

  return (
    <div className="price-pair">
      <span>Alış: {formatTRY(bid, hidden)}</span>
      <span>Satış: {formatTRY(ask, hidden)}</span>
      {hasChange && (
        <span className={positive ? 'change-up' : 'change-down'}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          %{Math.abs(change).toFixed(2)}
        </span>
      )}
    </div>
  )
}

function AddAssetModal({ onClose, onCreate }) {
  const [selectedKey, setSelectedKey] = useState('gold')
  const selected = PRESETS.find((item) => item.key === selectedKey)
  const [form, setForm] = useState({ ...selected })
  const [live, setLive] = useState(false)
  const [lookup, setLookup] = useState('')

  const choosePreset = (preset) => {
    setSelectedKey(preset.key)
    setForm({ ...preset })
    setLive(false)
    setLookup('')
  }

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  useEffect(() => {
    const code = form.code.trim()
    if (!code || isManualCode(code.toUpperCase())) {
      setLive(false)
      setLookup('')
      return undefined
    }

    let cancelled = false
    const requestId = window.setTimeout(async () => {
      setLookup('loading')
      try {
        const quote = await fetchPrice(code)
        if (cancelled) return
        if (!quote) {
          setLive(false)
          setLookup('missing')
          return
        }
        setForm((current) => ({
          ...current,
          price: quote.bid,
          ask: quote.ask,
        }))
        setLive(true)
        setLookup('live')
      } catch {
        if (cancelled) return
        setLive(false)
        setLookup('error')
      }
    }, 350)

    return () => {
      cancelled = true
      window.clearTimeout(requestId)
    }
  }, [form.code])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.code.trim()) return
    const code = form.code.trim().toUpperCase()
    onCreate({
      ...form,
      id: crypto.randomUUID(),
      name: form.name.trim(),
      code,
      amount: 0,
      price: code === 'TRY' ? 1 : Number(form.price) || 0,
      ask: code === 'TRY' ? 1 : Number(form.ask) || Number(form.price) || 0,
      change: 0,
    })
  }

  const locked = live || isManualCode(form.code.trim().toUpperCase())
  const note = (() => {
    if (isManualCode(form.code.trim().toUpperCase())) {
      return 'Türk lirası için fiyat her zaman 1 ₺ olarak kalır.'
    }
    if (lookup === 'loading') return 'Bu kod için fiyat sorgulanıyor…'
    if (lookup === 'live') return 'Bu kod için fiyat altinapi’den geliyor.'
    if (lookup === 'missing') return 'Bu kod API’de yok. Alış fiyatını elle girebilirsiniz.'
    if (lookup === 'error') return 'Fiyat alınamadı. Alış fiyatını elle girebilirsiniz.'
    return 'Kod girildiğinde alış ve satış fiyatı otomatik doldurulur.'
  })()

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
              placeholder="ALTIN"
              maxLength={32}
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
        </div>
        <div className="price-fields">
          <label className="price-field">
            <span>Güncel alış fiyatı</span>
            <div className="input-with-suffix">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                readOnly={locked}
                onChange={(event) => updateField('price', event.target.value)}
                aria-label="Güncel alış fiyatı Türk lirası"
              />
              <span>₺</span>
            </div>
          </label>
          <label className="price-field">
            <span>Güncel satış fiyatı</span>
            <div className="input-with-suffix">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.ask}
                readOnly={locked}
                onChange={(event) => updateField('ask', event.target.value)}
                aria-label="Güncel satış fiyatı Türk lirası"
              />
              <span>₺</span>
            </div>
          </label>
        </div>

        <div className={`api-note ${lookup === 'error' ? 'api-note--warn' : ''}`}>
          <RefreshCw size={17} />
          <span>{note}</span>
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

function UpdateAssetModal({ asset, live, onClose, onSave, onDelete }) {
  const [amount, setAmount] = useState(asset.amount)
  const [price, setPrice] = useState(asset.price)
  const [ask, setAsk] = useState(asset.ask ?? asset.price)

  useEffect(() => {
    if (!live) return
    setPrice(asset.price)
    setAsk(asset.ask ?? asset.price)
  }, [live, asset.price, asset.ask])

  const step = asset.unit === 'gram' ? 1 : asset.unit === 'TL' ? 100 : 1
  const bid = live ? asset.price : Number(price) || 0
  const total = Math.max(0, Number(amount) || 0) * bid

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

      <div className="price-fields">
        <label className="price-field">
          <span>Güncel alış fiyatı</span>
          <div className="input-with-suffix">
            <input
              type="number"
              min="0"
              step="0.01"
              value={live ? asset.price : price}
              readOnly={live}
              onChange={(event) => setPrice(event.target.value)}
            />
            <span>₺</span>
          </div>
        </label>
        <label className="price-field">
          <span>Güncel satış fiyatı</span>
          <div className="input-with-suffix">
            <input
              type="number"
              min="0"
              step="0.01"
              value={live ? (asset.ask ?? asset.price) : ask}
              readOnly={live}
              onChange={(event) => setAsk(event.target.value)}
              aria-label="Güncel satış fiyatı Türk lirası"
            />
            <span>₺</span>
          </div>
        </label>
      </div>

      {live && (
        <div className="api-note">
          <RefreshCw size={17} />
          <span>
            {isManualCode(asset.code)
              ? 'Türk lirası için fiyat her zaman 1 ₺ olarak kalır.'
              : 'Alış ve satış fiyatı canlı güncellenir. Yalnızca miktarı değiştirin.'}
          </span>
        </div>
      )}

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
          onClick={() => onSave(
            asset.id,
            Number(amount) || 0,
            Number(live ? asset.price : price) || 0,
            Number(live ? asset.ask : ask) || 0,
          )}
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
        <PricePair bid={asset.price} ask={asset.ask ?? asset.price} hidden={hidden} change={asset.change} />
      </div>
    </button>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    fetchMe()
      .then((result) => setUser(result.user))
      .catch(() => setUser(null))
      .finally(() => setAuthReady(true))
  }, [])

  if (!authReady) {
    return <div className="boot-screen">BolKese yükleniyor…</div>
  }

  if (!user) {
    return <AuthScreen onAuth={setUser} />
  }

  return (
    <Portfolio
      user={user}
      onLogout={() => setUser(null)}
    />
  )
}

function Portfolio({ user, onLogout }) {
  const [assets, setAssets] = useState([])
  const [modal, setModal] = useState(null)
  const [hidden, setHidden] = useState(false)
  const [toast, setToast] = useState('')
  const [activeNav, setActiveNav] = useState('home')
  const { quotes, loading, error, stale, updatedAt, refresh } = useMarketPrices()

  useEffect(() => {
    let cancelled = false

    fetchAssets()
      .then(async ({ assets: rows }) => {
        if (cancelled) return
        if (!rows.length) {
          try {
            const migrated = await migrateLocalAssets()
            if (!cancelled && migrated.length) {
              setAssets(migrated)
              setToast('Bu cihazdaki kategoriler hesabınıza taşındı.')
              return
            }
          } catch {
            // keep empty list if migration fails
          }
        }
        if (!cancelled) setAssets(migrateAssets(rows))
      })
      .catch((err) => {
        if (!cancelled) setToast(err.message || 'Kategoriler alınamadı.')
      })

    return () => {
      cancelled = true
    }
  }, [user.id])

  useEffect(() => {
    if (!quotes.size) return
    setAssets((current) => current.map((asset) => {
      if (isManualCode(asset.code)) {
        return { ...asset, price: 1, ask: 1 }
      }
      const quote = quotes.get(asset.code)
      if (!quote) return asset
      return {
        ...asset,
        price: quote.bid,
        ask: quote.ask,
        change: quote.change == null ? 0 : Number(quote.change.toFixed(2)),
      }
    }))
  }, [quotes])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timeout)
  }, [toast])

  const total = useMemo(
    () => assets.reduce((sum, asset) => sum + asset.amount * asset.price, 0),
    [assets],
  )

  const recordedChange = useMemo(
    () => assets.reduce((sum, asset) => sum + asset.amount * asset.price * ((asset.change || 0) / 100), 0),
    [assets],
  )

  const createAsset = async (asset) => {
    try {
      const { asset: created } = await createAssetRecord({
        name: asset.name,
        code: asset.code,
        unit: asset.unit,
        amount: 0,
        icon: asset.icon,
        color: asset.color,
        key: asset.key,
        price: asset.price,
        ask: asset.ask,
      })
      setAssets((current) => [...current, created])
      setModal({ type: 'update', asset: created })
      setToast('Kategori oluşturuldu. Şimdi miktarınızı girebilirsiniz.')
    } catch (err) {
      setToast(err.message || 'Kategori oluşturulamadı.')
    }
  }

  const saveAsset = async (id, amount, price, ask) => {
    try {
      const current = assets.find((asset) => asset.id === id)
      const payload = { amount }
      if (current && !isManualCode(current.code) && !quotes.has(current.code)) {
        payload.price = price
        payload.ask = ask
      }
      const { asset: saved } = await updateAssetRecord(id, payload)
      setAssets((list) => list.map((asset) => {
        if (asset.id !== saved.id) return asset
        return {
          ...saved,
          price: quotes.has(saved.code) ? asset.price : saved.price,
          ask: quotes.has(saved.code) ? asset.ask : saved.ask,
          change: asset.change,
        }
      }))
      setModal(null)
      setToast('Varlık miktarınız güncellendi.')
    } catch (err) {
      setToast(err.message || 'Kategori güncellenemedi.')
    }
  }

  const deleteAsset = async (id) => {
    try {
      await deleteAssetRecord(id)
      setAssets((current) => current.filter((asset) => asset.id !== id))
      setModal(null)
      setToast('Kategori kaldırıldı.')
    } catch (err) {
      setToast(err.message || 'Kategori silinemedi.')
    }
  }

  const refreshPrices = async () => {
    const result = await refresh()
    if (result.ok) {
      setToast('Piyasa fiyatları yenilendi.')
      return
    }
    setToast(result.message || 'Fiyatlar alınamadı.')
  }

  const handleLogout = async () => {
    try {
      await logoutAccount()
    } catch {
      // cookie may already be gone
    }
    onLogout()
  }

  const handleNav = (item) => {
    if (item === 'settings') {
      handleLogout()
      return
    }
    setActiveNav(item)
    if (item !== 'home') setToast('Bu bölüm tasarımın sonraki ekranı için hazır.')
  }

  const lastUpdatedLabel = updatedAt ? timeNow(updatedAt) : '—'
  const syncClass = error ? 'sync-status sync-status--error' : stale ? 'sync-status sync-status--stale' : 'sync-status'
  const syncText = error
    ? error
    : stale
      ? `Veri gecikmeli · ${lastUpdatedLabel}`
      : loading && !updatedAt
        ? 'Fiyatlar yükleniyor…'
        : `Son güncelleme ${lastUpdatedLabel}`
  const editingAsset = modal?.type === 'update'
    ? assets.find((asset) => asset.id === modal.asset.id) || modal.asset
    : null

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
              <span>Hesabınızda saklanır</span>
            </div>
          </div>
          <button className="settings-link" onClick={handleLogout}>
            <LogOut size={18} />
            Çıkış yap
          </button>
          <div className="profile">
            <span className="avatar">{initials(user.name)}</span>
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
            <button className="profile-logout" onClick={handleLogout} aria-label="Çıkış yap">
              <LogOut size={18} />
            </button>
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
                  <span className={recordedChange >= 0 ? 'balance-pill' : 'balance-pill balance-pill--down'}>
                    {recordedChange >= 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                    {formatTRY(Math.abs(recordedChange), hidden)}
                  </span>
                  <span>son kayda göre</span>
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
            <div className={syncClass}>
              <span className="live-dot" />
              {syncText}
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
              <button className="refresh-button" onClick={refreshPrices} disabled={loading}>
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
                <span>Canlı alış / satış</span>
              </div>
              <HandCoins size={18} className="spark-icon" />
            </div>

            <div className="market-list">
              {MARKET_WATCHLIST.map((item) => {
                const quote = quotes.get(item.code)
                const preset = PRESETS.find((presetItem) => presetItem.icon === item.icon)
                const change = quote?.change
                const positive = (change || 0) >= 0
                return (
                  <div className="market-row" key={item.code}>
                    <IconBadge icon={item.icon} color={preset.color} size="small" />
                    <div className="market-name">
                      <strong>{item.name}</strong>
                      <span>{item.code}</span>
                    </div>
                    <div className="market-price">
                      {quote ? (
                        <>
                          <strong>{formatTRY(quote.bid)}</strong>
                          <span>Satış {formatTRY(quote.ask)}</span>
                          {typeof change === 'number' && (
                            <span className={positive ? 'change-up' : 'change-down'}>
                              {positive ? '+' : ''}{change.toFixed(2)}%
                            </span>
                          )}
                        </>
                      ) : (
                        <strong>{loading ? 'Yükleniyor…' : error ? 'Alınamadı' : '—'}</strong>
                      )}
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
              <p>
                <strong>
                  {error ? 'Fiyat bağlantısı' : stale ? 'Gecikmeli veri' : loading && !updatedAt ? 'Fiyatlar yükleniyor' : 'Canlı veri bağlantısı'}
                </strong>
                <br />
                {error
                  ? error
                  : stale
                    ? 'Kaynak gecikmeli. Gösterilen alış ve satış son alınan değerlerdir.'
                    : loading && !updatedAt
                      ? 'Piyasa fiyatları altinapi’den alınıyor.'
                      : 'Alış ve satış fiyatları altinapi üzerinden güncellenir.'}
              </p>
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
        <button onClick={handleLogout}>
          <LogOut size={21} /><span>Çıkış</span>
        </button>
      </nav>

      {modal?.type === 'add' && (
        <AddAssetModal onClose={() => setModal(null)} onCreate={createAsset} />
      )}
      {editingAsset && (
        <UpdateAssetModal
          asset={editingAsset}
          live={quotes.has(editingAsset.code) || isManualCode(editingAsset.code)}
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
