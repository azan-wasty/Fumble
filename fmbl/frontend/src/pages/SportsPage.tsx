import { useEffect, useState } from 'react'
import { sportsApi, type Sport } from '../services/api'
import PageShell from '../components/PageShell'
import { Trophy } from 'lucide-react'

export default function SportsPage() {
  const [data, setData] = useState<Sport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    sportsApi.list()
      .then(setData)
      .catch(() => setError('Failed to load sports.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageShell
      title="Sports"
      subtitle={`${data.length} sport${data.length !== 1 ? 's' : ''} supported`}
      loading={loading}
      error={error}
    >
      {data.length === 0 ? (
        <div className="empty-state">No sports found.</div>
      ) : (
        <div className="card-grid">
          {data.map(s => (
            <div key={s.sport_id} className="sport-card card">
               <div className="sport-card-head">
                  <div className="sport-icon">
                    <Trophy size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <div className="fw-700" style={{ color: 'var(--gray-900)' }}>{s.sport_name}</div>
                    <div className="text-sm text-muted">Max Team Size: {s.max_team_size}</div>
                  </div>
               </div>
               <p className="sport-desc text-sm">{s.description}</p>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
