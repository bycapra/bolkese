import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { createNoteRecord, deleteNoteRecord, fetchNotes, updateNoteRecord } from './api/notes'

const KIND_OPTIONS = [
  { value: 'yatirim', label: 'Yatırım' },
  { value: 'cekim', label: 'Çekim' },
  { value: 'genel', label: 'Genel' },
]

function todayDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function emptyForm() {
  return {
    title: '',
    date: todayDate(),
    kind: 'genel',
    assetId: '',
    body: '',
  }
}

function formatNoteDate(value) {
  const [year, month, day] = String(value || '').split('-')
  if (!year || !month || !day) return value || '—'
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(
    new Date(Number(year), Number(month) - 1, Number(day)),
  )
}

function kindLabel(kind) {
  return KIND_OPTIONS.find((option) => option.value === kind)?.label || kind
}

function excerpt(text) {
  const value = String(text || '').trim()
  if (!value) return ''
  return value.length > 140 ? `${value.slice(0, 140)}…` : value
}

function compareNotes(a, b) {
  if (a.date !== b.date) return b.date.localeCompare(a.date)
  return String(b.createdAt).localeCompare(String(a.createdAt))
}

export default function NotesPage({ assets }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState('')
  const [kindFilter, setKindFilter] = useState('')

  const assetNameById = useMemo(() => {
    const map = new Map()
    for (const asset of assets) map.set(asset.id, asset.name)
    return map
  }, [assets])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchNotes()
      .then(({ notes: rows }) => {
        if (cancelled) return
        setNotes(rows)
        setError('')
      })
      .catch((err) => {
        if (cancelled) return
        setNotes([])
        setError(err.message || 'Notlar alınamadı.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('tr-TR')
    return notes.filter((note) => {
      if (kindFilter && note.kind !== kindFilter) return false
      if (!needle) return true
      const haystack = `${note.title} ${note.body}`.toLocaleLowerCase('tr-TR')
      return haystack.includes(needle)
    })
  }, [notes, query, kindFilter])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm())
  }

  function startEdit(note) {
    setEditingId(note.id)
    setForm({
      title: note.title,
      date: note.date,
      kind: note.kind,
      assetId: note.assetId || '',
      body: note.body || '',
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const title = form.title.trim()
    if (title.length < 2) {
      setError('Başlık en az 2 karakter olmalı.')
      return
    }

    const payload = {
      title,
      body: form.body.trim(),
      date: form.date,
      kind: form.kind,
      assetId: form.assetId || null,
    }

    setSaving(true)
    try {
      if (editingId) {
        const { note } = await updateNoteRecord(editingId, payload)
        setNotes((rows) => rows.map((row) => (row.id === note.id ? note : row)).sort(compareNotes))
      } else {
        const { note } = await createNoteRecord(payload)
        setNotes((rows) => [note, ...rows].sort(compareNotes))
      }
      setError('')
      cancelEdit()
    } catch (err) {
      setError(err.message || 'Not kaydedilemedi.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(note) {
    if (!window.confirm('Bu not silinsin mi?')) return
    try {
      await deleteNoteRecord(note.id)
      setNotes((rows) => rows.filter((row) => row.id !== note.id))
      if (editingId === note.id) cancelEdit()
      setError('')
    } catch (err) {
      setError(err.message || 'Not silinemedi.')
    }
  }

  const emptyText = error
    ? error
    : loading
      ? 'Notlar yükleniyor…'
      : query || kindFilter
        ? 'Sonuç bulunamadı.'
        : 'İlk notunu ekle — yatırdığın veya çektiğin tutarı burada hatırlatabilirsin.'

  return (
    <section className="reports-page notes-page" aria-label="Notlar">
      <div className="section-heading">
        <div>
          <h2>{editingId ? 'Notu düzenle' : 'Not ekle'}</h2>
          <span>
            {loading
              ? 'Notlar yükleniyor…'
              : error
                ? error
                : `${notes.length} kayıt`}
          </span>
        </div>
      </div>

      <form className="notes-form" onSubmit={handleSubmit}>
        <div className="reports-filters notes-form-grid">
          <label>
            <span>Başlık</span>
            <input
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              aria-label="Not başlığı"
              required
              minLength={2}
            />
          </label>
          <label>
            <span>Tarih</span>
            <input
              type="date"
              value={form.date}
              onChange={(event) => updateField('date', event.target.value)}
              aria-label="Not tarihi"
              required
            />
          </label>
          <label>
            <span>Tür</span>
            <select
              value={form.kind}
              onChange={(event) => updateField('kind', event.target.value)}
              aria-label="Not türü"
            >
              {KIND_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Kategori</span>
            <select
              value={form.assetId}
              onChange={(event) => updateField('assetId', event.target.value)}
              aria-label="Bağlı kategori"
            >
              <option value="">Yok</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} · {asset.code}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="notes-body-field">
          <span>Not</span>
          <textarea
            value={form.body}
            onChange={(event) => updateField('body', event.target.value)}
            aria-label="Not metni"
            rows={4}
          />
        </label>
        <div className="notes-form-actions">
          <button type="submit" className="button button--primary" disabled={saving}>
            <Plus size={16} />
            {editingId ? 'Kaydet' : 'Not ekle'}
          </button>
          {editingId && (
            <button type="button" className="button" onClick={cancelEdit}>
              Vazgeç
            </button>
          )}
        </div>
      </form>

      <div className="reports-filters notes-list-filters">
        <label>
          <span>Ara</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Notlarda ara"
            placeholder="Başlık veya metin"
          />
        </label>
        <label>
          <span>Tür</span>
          <select
            value={kindFilter}
            onChange={(event) => setKindFilter(event.target.value)}
            aria-label="Türe göre süz"
          >
            <option value="">Tümü</option>
            {KIND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="markets-empty">{emptyText}</p>
      ) : (
        <ul className="notes-list">
          {filtered.map((note) => {
            const categoryName = note.assetId ? assetNameById.get(note.assetId) : ''
            return (
              <li className="notes-item" key={note.id}>
                <div className="notes-item-head">
                  <time dateTime={note.date}>{formatNoteDate(note.date)}</time>
                  <span className={`notes-kind notes-kind--${note.kind}`}>{kindLabel(note.kind)}</span>
                </div>
                <strong>{note.title}</strong>
                {excerpt(note.body) ? <p>{excerpt(note.body)}</p> : null}
                {categoryName ? <span className="notes-asset">{categoryName}</span> : null}
                <div className="notes-item-actions">
                  <button type="button" className="icon-button" onClick={() => startEdit(note)} aria-label="Notu düzenle">
                    <Pencil size={16} />
                  </button>
                  <button type="button" className="icon-button" onClick={() => handleDelete(note)} aria-label="Notu sil">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
