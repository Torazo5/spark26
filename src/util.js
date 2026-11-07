export const uid = () => Math.random().toString(36).slice(2, 10)

export const initials = name =>
  name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()

export const isStudent = u => u.role === 'student'

export function roleLine(u) {
  if (isStudent(u)) return `Student · ${u.college} '${String(u.year).slice(-2)}`
  return `${u.role === 'faculty' ? 'Faculty' : 'Staff'} · ${u.dept}, ${u.college}`
}

export function formatTime(t) {
  return new Date(`2000-01-01T${t}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function formatDate(date, time) {
  const d = new Date(`${date}T${time || '00:00'}`)
  const day = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  return time ? `${day} · ${formatTime(time)}` : day
}

export function when(post) {
  if (post.type === 'event') return formatDate(post.date, post.time)
  if (post.type === 'class') return post.schedule
  return post.meets
}

// Host first, then attendees.
export const people = (post, user) => [post.hostId, ...post.attendees].map(user).filter(Boolean)

export function mixCounts(list) {
  const students = list.filter(isStudent).length
  return { students, staff: list.length - students }
}

export const mixLine = ({ students, staff }) =>
  `${students} student${students === 1 ? '' : 's'} · ${staff} staff & faculty`

export const spotsLeft = p => (p.capacity ? p.capacity - p.attendees.length : null)

export const matchScore = (post, me) => post.tags.filter(t => me.interests.includes(t)).length
