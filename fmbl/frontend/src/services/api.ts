import axios from 'axios'

const baseURL = import.meta.env.API_BASE_URL
  ? `${import.meta.env.API_BASE_URL}`
  : ''

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fmbl_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fmbl_token')
      localStorage.removeItem('fmbl_user')
      window.location.href = '/auth'
    }
    return Promise.reject(err)
  }
)

// Auth 
export interface LoginPayload {
  roll_number: string
  password: string
}

export interface RegisterPayload {
  roll_number: string
  full_name: string
  email: string
  phone?: string
  password: string
}

export interface AuthUser {
  user_id: number
  roll_number: string
  full_name: string
  email: string
  role: string
  token: string
}

export interface MeUser {
  user_id: number
  roll_number: string
  full_name: string
  email: string
  phone?: string
  role: string
}

export const authApi = {
  login: (data: LoginPayload) =>
    api.post<AuthUser>('/api/auth/login', data).then((r) => r.data),
  register: (data: RegisterPayload) =>
    api.post<AuthUser>('/api/auth/register', data).then((r) => r.data),
  me: () => api.get<MeUser>('/api/auth/me').then((r) => r.data),
}

// Tournaments 
export interface Tournament {
  tournament_id: number
  name: string
  sport_name: string
  organizer_name: string
  venue_name: string
  start_date: string
  end_date: string
  status: string
}

export const tournamentsApi = {
  list: (status?: string) =>
    api
      .get<Tournament[]>('/api/tournaments', { params: status ? { status } : {} })
      .then((r) => r.data),
}

// Matches 
export interface Match {
  match_id: number
  tournament_name: string
  team_a: string
  team_b: string
  winner: string | null
  match_date: string
  match_time: string
  status: string
}

export const matchesApi = {
  list: () => api.get<Match[]>('/api/matches').then((r) => r.data),
}

// Players 
export interface Player {
  profile_id: number
  full_name: string
  roll_number: string
  sport_name: string
  skill_level: string
  position: string
  is_available: boolean
}

export const playersApi = {
  list: () => api.get<Player[]>('/api/players').then((r) => r.data),
}

// Teams 
export interface Team {
  team_id: number
  team_name: string
  sport_name: string
  captain_name: string
  captain_roll: string
  created_at: string
}

export const teamsApi = {
  list: () => api.get<Team[]>('/api/teams').then((r) => r.data),
}

export default api
