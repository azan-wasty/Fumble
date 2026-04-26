import { useEffect, useState } from 'react'
import { itemsApi, sportsApi, type Item, type Sport } from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageShell from '../components/PageShell'
import { Package, Plus, X, Trash2 } from 'lucide-react'

export default function ItemsPage() {
  const { user } = useAuth()
  const [data, setData] = useState<Item[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form State
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [sportId, setSportId] = useState('')
  const [totalQty, setTotalQty] = useState('')
  const [condition, setCondition] = useState('New')
  const [submitting, setSubmitting] = useState(false)

  const loadData = () => {
    setLoading(true)
    itemsApi.list()
      .then(setData)
      .catch(() => setError('Failed to load equipment.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    if (user?.role === 'admin') {
      sportsApi.list().then(setSports).catch(() => {})
    }
  }, [user])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !sportId || !totalQty) return
    setSubmitting(true)
    try {
      await itemsApi.create({
        item_name: name,
        sport_id: parseInt(sportId),
        total_qty: parseInt(totalQty),
        condition
      })
      setShowForm(false)
      setName(''); setSportId(''); setTotalQty(''); setCondition('New')
      loadData()
    } catch {
      setError('Failed to add item.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this item?')) return
    try {
      await itemsApi.delete(id)
      loadData()
    } catch {
      setError('Failed to delete item.')
    }
  }

  const displayed = data.filter(it =>
    !search ||
    it.item_name.toLowerCase().includes(search.toLowerCase()) ||
    it.sport_name?.toLowerCase().includes(search.toLowerCase())
  )

  const condColor = (c: string) => {
    if (!c) return 'badge-gray'
    const cl = c.toLowerCase()
    if (cl === 'new' || cl === 'excellent') return 'badge-green'
    if (cl === 'good') return 'badge-blue'
    if (cl === 'fair') return 'badge-yellow'
    return 'badge-gray'
  }

  const pct = (avail: number, total: number) => total > 0 ? Math.round((avail / total) * 100) : 0

  return (
    <PageShell
      title="Sports Equipment"
      subtitle={`${displayed.length} item${displayed.length !== 1 ? 's' : ''} in inventory`}
      loading={loading}
      error={error}
      action={user?.role === 'admin' && (
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16}/> : <Plus size={16}/>}
          {showForm ? 'Cancel' : 'Add Equipment'}
        </button>
      )}
    >
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24, border: '2px solid var(--primary-pale)' }}>
          <h3 className="section-title">Add New Equipment</h3>
          <form className="auth-form" onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 16 }}>
            <div className="form-group" style={{ gridColumn: '1 / -2' }}>
              <label className="form-label">Item Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Cricket Bat" />
            </div>
            <div className="form-group">
              <label className="form-label">Sport</label>
              <select className="form-input" value={sportId} onChange={e => setSportId(e.target.value)} required>
                <option value="">Select Sport</option>
                {sports.map(s => <option key={s.sport_id} value={s.sport_id}>{s.sport_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Total Quantity</label>
              <input className="form-input" type="number" min="1" value={totalQty} onChange={e => setTotalQty(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select className="form-input" value={condition} onChange={e => setCondition(e.target.value)}>
                <option>New</option><option>Excellent</option><option>Good</option><option>Fair</option><option>Poor</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Adding...' : 'Add to Inventory'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <input
          className="form-input"
          style={{ maxWidth: 320 }}
          placeholder="Search by item or sport…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {displayed.length === 0 ? (
        <div className="empty-state">No items found.</div>
      ) : (
        <div className="card-grid">
          {displayed.map(it => {
            const stockPct = pct(it.available_qty, it.total_qty)
            const lowStock = stockPct <= 25
            return (
              <div key={it.item_id} className="item-card card">
                <div className="item-card-head">
                  <div className="item-icon">
                    <Package size={20} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="fw-700" style={{ color: 'var(--gray-900)' }}>{it.item_name}</div>
                    <span className="badge badge-blue" style={{ marginTop: 4 }}>{it.sport_name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                     <span className={`badge ${condColor(it.condition)}`}>{it.condition}</span>
                     {user?.role === 'admin' && (
                        <button className="btn btn-ghost btn-sm" style={{ color: '#ef4444', padding: 4 }} onClick={() => handleDelete(it.item_id)}>
                           <Trash2 size={14} />
                        </button>
                     )}
                  </div>
                </div>
                <div className="item-stock">
                  <div className="item-stock-labels">
                    <span className="text-sm text-muted">Available</span>
                    <span className={`text-sm fw-600 ${lowStock ? 'text-error' : 'text-primary'}`}>
                      {it.available_qty} / {it.total_qty}
                    </span>
                  </div>
                  <div className="stock-bar">
                    <div
                      className="stock-fill"
                      style={{ width: `${stockPct}%`, background: lowStock ? '#ef4444' : 'var(--primary)' }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
