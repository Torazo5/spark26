import { TYPES } from './config'
import { go, useStore } from './store'
import { initials, mixCounts, mixLine, people, roleLine, spotsLeft, when } from './util'

const PATHS = {
  calendar: <><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  pin: <><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2 .7 3.5 2.6 3.5 5.7" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  repeat: <><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" /><path d="M18 3v4h-4M6 21v-4h4" /></>,
  flag: <path d="M5 21V4h11l-2 4 2 4H5" />,
  bag: <><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  level: <path d="M6 20v-4M12 20v-9M18 20V5" />,
  tools: <path d="M14.5 6.5a4 4 0 0 0 5 5L21 13l-8 8-3-3 1.5-1.5a4 4 0 0 1-5-5L3 8l2-2 3.5 3.5L11 7 7.5 3.5 9.5 1.5" />,
}

export const Icon = ({ name, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {PATHS[name]}
  </svg>
)

const TINTS = ['#F6E7AE', '#E9E5DA', '#DCE7DE', '#E6E0EC', '#F2DFD3', '#DDE4EE']

export function Avatar({ user, size = 32 }) {
  const n = [...user.id].reduce((a, c) => a + c.charCodeAt(0), 0)
  return (
    <span className="avatar" title={user.name}
      style={{ width: size, height: size, fontSize: size * 0.38, background: TINTS[n % TINTS.length] }}>
      {initials(user.name)}
    </span>
  )
}

export function AvatarStack({ users, max = 5, size = 28 }) {
  const extra = users.length - max
  return (
    <span className="stack">
      {users.slice(0, max).map(u => <Avatar key={u.id} user={u} size={size} />)}
      {extra > 0 && <span className="avatar stack-more" style={{ width: size, height: size }}>+{extra}</span>}
    </span>
  )
}

export function RoleBadge({ user }) {
  return <span className={'badge ' + (user.role === 'student' ? 'badge-student' : 'badge-staff')}>
    {user.role === 'student' ? 'Student' : user.role === 'faculty' ? 'Faculty' : 'Staff'}
  </span>
}

export const TypeLabel = ({ type }) => (
  <span className="type"><Icon name={TYPES[type].icon} size={14} />{TYPES[type].label}</span>
)

export const StatusPill = ({ status }) => (
  <span className={'pill ' + (status === 'Recruiting' ? 'pill-yellow' : '')}>{status}</span>
)

export function PersonRow({ user, extra }) {
  return (
    <a className="person" href={`#/u/${user.id}`} onClick={e => e.stopPropagation()}>
      <Avatar user={user} />
      <span className="person-text">
        <span className="person-name">{user.name}{extra}</span>
        <span className="small muted">{roleLine(user)}</span>
      </span>
    </a>
  )
}

export function JoinButton({ post, block }) {
  const { me, dispatch } = useStore()
  const t = TYPES[post.type]
  const cls = 'btn' + (block ? ' btn-block' : ' btn-sm')
  if (post.hostId === me.id) return <button className={cls} disabled>You're hosting</button>
  const joined = post.attendees.includes(me.id)
  const left = spotsLeft(post)
  if (!joined && left !== null && left <= 0) return <button className={cls} disabled>Full</button>
  const toggle = e => { e.stopPropagation(); dispatch({ type: 'toggleJoin', id: post.id }) }
  return joined
    ? <button className={cls + ' btn-outline'} onClick={toggle}><Icon name="check" />{t.joined}</button>
    : <button className={cls + ' btn-primary'} onClick={toggle}>{t.join}</button>
}

export function PostCard({ post, highlight }) {
  const { user, me } = useStore()
  const host = user(post.hostId)
  const ppl = people(post, user)
  const left = spotsLeft(post)
  return (
    <article className="card post-card" onClick={() => go(`/post/${post.id}`)}>
      <div className="card-top">
        <TypeLabel type={post.type} />
        <span className="card-top-right">
          {highlight && <span className="pill pill-outline">Matches your interests</span>}
          {post.type === 'project' && <StatusPill status={post.status} />}
        </span>
      </div>
      <div>
        <h3 className="card-title"><a href={`#/post/${post.id}`} onClick={e => e.stopPropagation()}>{post.title}</a></h3>
        <p className="card-desc">{post.description}</p>
      </div>
      <div className="meta">
        <div className="meta-row"><Icon name={post.type === 'event' ? 'calendar' : 'clock'} />{when(post)}</div>
        <div className="meta-row"><Icon name="pin" />{post.location}</div>
        {post.type === 'project' && post.roles.length > 0 &&
          <div className="meta-row"><Icon name="tools" />Needs {post.roles.join(', ').toLowerCase()}</div>}
        {post.type === 'class' && <div className="meta-row"><Icon name="level" />{post.level}</div>}
        {post.type === 'event' && post.bring && <div className="meta-row"><Icon name="bag" />{post.bring}</div>}
      </div>
      <PersonRow user={host} extra={host.id === me.id ? ' (you)' : ''} />
      <div className="tags">{post.tags.map(t => <span className="tag" key={t}>{t}</span>)}</div>
      <div className="card-foot">
        <div className="foot-people">
          <AvatarStack users={ppl} />
          <div>
            <div className="small">{mixLine(mixCounts(ppl))}</div>
            {left !== null && <div className={'small ' + (left <= 3 ? 'warn' : 'muted')}>
              {left <= 0 ? 'Full' : `${left} spot${left === 1 ? '' : 's'} left`}
            </div>}
          </div>
        </div>
        <JoinButton post={post} />
      </div>
    </article>
  )
}

export function ChipPicker({ options, value, onChange }) {
  const toggle = o => onChange(value.includes(o) ? value.filter(x => x !== o) : [...value, o])
  return (
    <div className="chips">
      {options.map(o => (
        <button type="button" key={o} className={'chip' + (value.includes(o) ? ' on' : '')} onClick={() => toggle(o)}>{o}</button>
      ))}
    </div>
  )
}

export const Empty = ({ title, children }) => (
  <div className="empty"><h3>{title}</h3>{children && <p className="muted">{children}</p>}</div>
)
