import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { venuesApi, type Venue } from '../services/api'
import PageShell from '../components/PageShell'
import StatusBadge from '../components/StatusBadge'
import { MapPin, CalendarPlus } from 'lucide-react'

export default function VenuesPage() {
  const [data, setData] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    venuesApi.list()
      .then(setData)
      .catch(() => setError('Failed to load venues.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageShell
      title="Venues"
      subtitle={`${data.length} venue${data.length !== 1 ? 's' : ''} available`}
      loading={loading}
      error={error}
    >
      {data.length === 0 ? (
        <div className="empty-state">No venues found.</div>
      ) : (
        <div className="card-grid">
          {data.map(v => (
            <div key={v.venue_id} className="venue-card card">
              <div className="venue-card-head">
                 <div className="venue-icon">
                    <MapPin size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <div className="fw-700" style={{ color: 'var(--gray-900)' }}>{v.venue_name}</div>
                    <div className="text-sm text-muted">{v.location}</div>
                  </div>
                  <span className={`badge ${v.is_available ? 'badge-green' : 'badge-gray'}`} style={{ marginLeft: 'auto' }}>
                    {v.is_available ? 'Available' : 'Unavailable'}
                  </span>
              </div>
              <div className="venue-info">
                  <div className="text-sm"><strong>Sport:</strong> {v.sport_name}</div>
                  <div className="text-sm"><strong>Capacity:</strong> {v.capacity} persons</div>
              </div>
              <div style={{ marginTop: 12 }}>
                <Link to="/courts" className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                  <CalendarPlus size={14} />
                  Book This Venue
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
