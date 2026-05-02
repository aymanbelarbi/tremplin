// Backend DTOs -> UI shapes used across pages.

// Display sentinel used for empty optional fields in the UI.
const DASH = '—'
const clean = (v) => (v == null || v === '' || v === DASH ? '' : v)

const REMOTE_KEYWORDS = ['Remote', 'Hybride', 'Présentiel', 'Télétravail']

function splitLocation(location) {
  const raw = (location || '').trim()
  if (!raw) return { city: '', remote: 'Présentiel' }
  const parts = raw.split(' · ').map((s) => s.trim())
  if (parts.length >= 2) return { city: parts[0], remote: parts[1] || 'Présentiel' }
  // Single-value locations: if it's a known mode keyword, treat as remote; otherwise as city
  if (REMOTE_KEYWORDS.includes(parts[0])) return { city: '', remote: parts[0] }
  return { city: parts[0], remote: 'Présentiel' }
}

export function normalizeOffer(o) {
  if (!o) return null
  const { city, remote } = splitLocation(o.location)
  const filiere = (o.requirements || '').trim() || DASH

  return {
    id: o.id,
    title: o.title,
    type: o.type || 'emploi',
    company: o.company_name,
    city: city || DASH,
    remote: remote || 'Présentiel',
    filiere,
    published_at: o.published_at,
    deadline: o.closes_at ? o.closes_at.slice(0, 10) : '',
    description: o.description,
    is_published: o.is_published ?? true,
  }
}

export function denormalizeOffer(form) {
  const city = clean(form.city)
  const remoteRaw = clean(form.remote)
  // Don't persist the default 'Présentiel' as a tag when there's no explicit remote mode
  const remote = remoteRaw === 'Présentiel' ? '' : remoteRaw
  const location = city && remote ? `${city} · ${remote}` : city || remote
  const filiere = clean(form.filiere)
  return {
    title: form.title,
    company_name: form.company,
    type: form.type || 'stage',
    description: form.description,
    requirements: filiere || null,
    location: location || null,
    is_published: form.is_published ?? true,
    closes_at: form.deadline || null,
  }
}

function statusToUi(s) {
  return s === 'rejected' ? 'refused' : s
}

export function normalizeApplication(a) {
  if (!a) return null
  return {
    id: a.id,
    status: statusToUi(a.status),
    applied_at: a.applied_at || a.created_at,
    updated_at: a.decided_at || a.applied_at,
    offer_id: a.offer?.id,
    offer_title: a.offer?.title,
    company: a.offer?.company_name,
    city: (a.offer?.location || '').split(' · ')[0] || '',
  }
}

export function normalizeAdminApplication(a) {
  if (!a) return null
  return {
    id: a.id,
    userId: a.user?.id,
    stagiaire: a.user?.full_name,
    email: a.user?.email,
    filiere: a.user?.filiere || '—',
    offer: a.offer?.title,
    company: a.offer?.company_name,
    applied_at: a.applied_at || a.created_at,
  }
}

export function normalizeStagiaire(s) {
  if (!s) return null
  const profile = s.profile || {}
  return {
    id: s.id,
    full_name: s.full_name,
    email: s.email,
    phone: s.phone,
    filiere: profile.filiere || '—',
    promotion: profile.promotion || '—',
    employment_status: profile.employment_status || 'looking',
    job_title: profile.job_title || '',
    job_company: profile.job_company || '',
    job_city: profile.job_city || '',
    job_start_date: profile.job_start_date || '',
    created_at: s.created_at,
    profile,
    cv: s.cv || null,
    user: s,
  }
}
