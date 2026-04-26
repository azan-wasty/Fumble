import { useEffect, useState } from 'react'
import { playersApi, type Player } from '../services/api'
import PageShell from '../components/PageShell'

const SKILLS = ['all', 'beginner', 'intermediate', 'advanced', 'professional']

export default function PlayersPage() {
  const [data, setData] = useState<Player[]>([])
  const [skill, setSkill] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    playersApi.list()
      .then(setData)
      .catch(() => setError('Failed to load players.'))
      .finally(() => setLoading(false))
  }, [])

  const displayed = data
    .filter(p => skill === 'all' || p.skill_level?.toLowerCase() === skill)
    .filter(p =>
      !search ||
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.roll_number.toLowerCase().includes(search.toLowerCase()) ||
      p.sport_name?.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <PageShell
      title="Players"
      subtitle={`${displayed.length} player${displayed.length !== 1 ? 's' : ''}`}
      loading={loading}
      error={error}
    >
      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <input
          className="form-input"
          style={{ flex: '1 1 220px', maxWidth: 300 }}
          placeholder="Search by name, roll no, sport…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filter-bar" style={{ margin: 0 }}>
          {SKILLS.map(s => (
            <button key={s} className={`filter-btn${skill === s ? ' active' : ''}`} onClick={() => setSkill(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="empty-state">No players match your search.</div>
      ) : (
        <div className="card-grid">
          {displayed.map(p => (
            <div key={p.profile_id} className="player-card card">
              <div className="player-avatar">{p.full_name.charAt(0).toUpperCase()}</div>
              <div className="player-info">
                <div className="fw-700" style={{ color: 'var(--gray-900)' }}>{p.full_name}</div>
                <div className="text-sm text-muted">{p.roll_number}</div>
                {p.position && <div className="text-sm" style={{ color: 'var(--gray-600)' }}>{p.position}</div>}
                <div className="player-tags">
                  <span className="badge badge-blue">{p.sport_name}</span>
                  <span className="badge badge-yellow">{p.skill_level}</span>
                  <span className={`badge ${p.is_available ? 'badge-green' : 'badge-gray'}`}>
                    {p.is_available ? '✓ Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
