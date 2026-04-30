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
  const skills = (o.requirements || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6)

  return {
    id: o.id,
    title: o.title,
    company: o.company_name,
    duration: o.duration || DASH,
    city: city || DASH,
    remote: remote || 'Présentiel',
    filiere: skills[0] || DASH,
    salary: o.salary_range || DASH,
    published_at: o.published_at,
    deadline: o.closes_at,
    description: o.description,
    is_published: o.is_published ?? true,
    missions: (o.description || '')
      .split(/\.|\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4),
    skills,
    applicants: o.applications_count ?? 0,
  }
}

export function denormalizeOffer(form) {
  const city = clean(form.city)
  const remoteRaw = clean(form.remote)
  // Don't persist the default 'Présentiel' as a tag when there's no explicit remote mode
  const remote = remoteRaw === 'Présentiel' ? '' : remoteRaw
  const location = city && remote ? `${city} · ${remote}` : city || remote
  const filiere = clean(form.filiere)
  const skillList = Array.isArray(form.skills)
    ? form.skills
    : (form.skills || '').split(',').map((s) => s.trim()).filter(Boolean)
  // Drop filiere if it is already present to avoid duplication on each edit
  const filteredSkills = filiere ? skillList.filter((s) => s !== filiere) : skillList
  const requirements = [filiere, ...filteredSkills].filter(Boolean).join(', ')
  return {
    title: form.title,
    company_name: form.company,
    description: form.description || `Offre ${form.title} chez ${form.company}.`,
    requirements: requirements || null,
    location: location || null,
    duration: clean(form.duration) || null,
    salary_range: clean(form.salary) || null,
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
    status: statusToUi(a.status),
    applied_at: a.applied_at || a.created_at,
    stagiaire: a.user?.full_name,
    filiere: a.user?.filiere || '—',
    offer: a.offer?.title,
    company: a.offer?.company_name,
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
    niveau: profile.niveau || '—',
    employment_status: profile.employment_status || 'looking',
    job_title: profile.job_title || '',
    job_company: profile.job_company || '',
    job_city: profile.job_city || '',
    job_start_date: profile.job_start_date || '',
    applications_count: s.applications_count ?? 0,
    created_at: s.created_at,
    profile,
    cv: s.cv || null,
    user: s,
  }
}
