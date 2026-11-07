import { go, useStore } from './store'
import { Empty, Icon, JoinButton, PersonRow, RoleBadge, StatusPill, TypeLabel } from './ui'
import { mixCounts, people, spotsLeft, when } from './util'

export default function PostDetail({ id }) {
  const { posts, user, me, dispatch } = useStore()
  const post = posts.find(p => p.id === id)
  if (!post) return <Empty title="This post no longer exists"><a className="link" href="#/">Back to Discover</a></Empty>

  const host = user(post.hostId)
  const ppl = people(post, user)
  const { students, staff } = mixCounts(ppl)
  const left = spotsLeft(post)
  const studentPct = ppl.length ? (students / ppl.length) * 100 : 0

  const details = [
    [post.type === 'event' ? 'calendar' : 'clock', post.type === 'event' ? 'When' : post.type === 'class' ? 'Schedule' : 'Meets', when(post)],
    ['pin', 'Where', post.location],
    post.type === 'class' && ['level', 'Level', post.level],
    post.type === 'event' && post.bring && ['bag', 'Bring', post.bring],
    ['users', 'Capacity', post.capacity ? `${post.capacity} people` : 'Open'],
  ].filter(Boolean)

  const remove = () => {
    if (!confirm('Delete this post?')) return
    dispatch({ type: 'deletePost', id: post.id })
    go('/')
  }

  return (
    <>
      <a href="#/" className="back"><Icon name="back" />Back to Discover</a>
      <div className="detail">
        <div className="detail-main">
          <div className="card-top">
            <TypeLabel type={post.type} />
            {post.type === 'project' && <StatusPill status={post.status} />}
          </div>
          <h1 className="detail-title">{post.title}</h1>
          <PersonRow user={host} extra={host.id === me.id ? ' (you)' : ''} />
          <p className="detail-desc">{post.description}</p>

          <div className="detail-grid">
            {details.map(([icon, label, value]) => (
              <div key={label} className="detail-item">
                <span className="detail-label"><Icon name={icon} size={14} />{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>

          {post.type === 'project' && post.roles.length > 0 && (
            <div className="detail-block">
              <h2>Looking for help with</h2>
              <div className="roles">{post.roles.map(r => <span key={r} className="role-chip">{r}</span>)}</div>
            </div>
          )}

          <div className="detail-block">
            <h2>Tags</h2>
            <div className="tags">{post.tags.map(t => <span className="tag" key={t}>{t}</span>)}</div>
          </div>

          {post.hostId === me.id && (
            <div className="detail-block"><button className="btn btn-danger btn-sm" onClick={remove}>Delete post</button></div>
          )}
        </div>

        <aside className="detail-side">
          <div className="panel">
            <div className="panel-count">
              <b>{post.attendees.length}</b>
              <span className="muted">{post.capacity ? `of ${post.capacity} spots taken` : 'people in'}</span>
            </div>
            {post.capacity && (
              <div className="progress"><span style={{ width: `${Math.min(100, (post.attendees.length / post.capacity) * 100)}%` }} /></div>
            )}
            {left !== null && left > 0 && left <= 3 && <p className="small warn">Only {left} spot{left === 1 ? '' : 's'} left</p>}
            <JoinButton post={post} block />
          </div>

          <div className="panel">
            <h3>Who's in</h3>
            <div className="mix"><span style={{ width: `${studentPct}%` }} /></div>
            <div className="mix-legend small">
              <span><i className="dot dot-student" />{students} student{students === 1 ? '' : 's'}</span>
              <span><i className="dot dot-staff" />{staff} staff & faculty</span>
            </div>
            <div className="people-list">
              {ppl.map(u => (
                <div key={u.id} className="people-list-row">
                  <PersonRow user={u} extra={u.id === me.id ? ' (you)' : ''} />
                  {u.id === post.hostId ? <span className="badge badge-host">Host</span> : <RoleBadge user={u} />}
                </div>
              ))}
            </div>
            {post.attendees.length === 0 && <p className="small muted">No one has joined yet.</p>}
          </div>
        </aside>
      </div>
    </>
  )
}
