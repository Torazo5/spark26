import { useState } from 'react'
import { COLLEGES, INTERESTS } from './config'
import { go, useStore } from './store'
import { Avatar, Empty, Icon, PostCard, RoleBadge } from './ui'
import { roleLine } from './util'

const ROLES = [['all', 'Everyone'], ['student', 'Students'], ['faculty', 'Faculty'], ['staff', 'Staff']]

export function People() {
  const { users, me } = useStore()
  const [role, setRole] = useState('all')
  const [college, setCollege] = useState('')
  const [interest, setInterest] = useState('')
  const [q, setQ] = useState('')

  const query = q.trim().toLowerCase()
  const list = users.filter(u =>
    (role === 'all' || u.role === role) &&
    (!college || u.college === college) &&
    (!interest || u.interests.includes(interest)) &&
    (!query || `${u.name} ${u.teaches.join(' ')} ${u.major || u.dept}`.toLowerCase().includes(query)))

  return (
    <>
      <div className="page-head">
        <div>
          <h1>People</h1>
          <p>Students, staff, and faculty in the community. Find someone who shares an interest or can teach you something.</p>
        </div>
      </div>
      <div className="toolbar">
        <div className="tabs">
          {ROLES.map(([key, label]) => (
            <button key={key} className={'tab' + (role === key ? ' active' : '')} onClick={() => setRole(key)}>
              {label}<span className="count">{users.filter(u => key === 'all' || u.role === key).length}</span>
            </button>
          ))}
        </div>
        <div className="toolbar-right">
          <select className="input select-sm" value={college} onChange={e => setCollege(e.target.value)}>
            <option value="">All colleges</option>
            {COLLEGES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="input select-sm" value={interest} onChange={e => setInterest(e.target.value)}>
            <option value="">All interests</option>
            {INTERESTS.map(i => <option key={i}>{i}</option>)}
          </select>
          <label className="search">
            <Icon name="search" />
            <input placeholder="Name or skill" value={q} onChange={e => setQ(e.target.value)} />
          </label>
        </div>
      </div>
      {list.length
        ? <div className="grid grid-people">{list.map(u => <PersonCard key={u.id} u={u} me={me} />)}</div>
        : <Empty title="No one matches those filters" />}
    </>
  )
}

function PersonCard({ u, me }) {
  const { posts } = useStore()
  const hosting = posts.filter(p => p.hostId === u.id).length
  const joined = posts.filter(p => p.attendees.includes(u.id)).length
  return (
    <article className="card person-card" onClick={() => go(`/u/${u.id}`)}>
      <div className="person-card-head">
        <Avatar user={u} size={48} />
        <div className="person-text">
          <a className="person-name lg" href={`#/u/${u.id}`} onClick={e => e.stopPropagation()}>
            {u.name}{u.id === me.id ? ' (you)' : ''}
          </a>
          <span className="small muted">{roleLine(u)}</span>
        </div>
        <RoleBadge user={u} />
      </div>
      {u.note && <p className="note">{u.note}</p>}
      <div className="tags">
        {u.interests.map(i => <span key={i} className={'tag' + (u.id !== me.id && me.interests.includes(i) ? ' tag-match' : '')}>{i}</span>)}
      </div>
      {u.teaches.length > 0 && <div className="small"><span className="muted">Can teach </span>{u.teaches.join(', ')}</div>}
      <div className="card-foot small muted">
        <span>Hosting {hosting}</span><span>Joined {joined}</span>
      </div>
    </article>
  )
}

export function Profile({ id }) {
  const { user, posts, me, dispatch } = useStore()
  const u = user(id)
  if (!u) return <Empty title="Profile not found"><a className="link" href="#/people">Back to People</a></Empty>

  const isMe = u.id === me.id
  const hosting = posts.filter(p => p.hostId === u.id)
  const joined = posts.filter(p => p.attendees.includes(u.id))
  const shared = isMe ? [] : u.interests.filter(i => me.interests.includes(i))

  return (
    <>
      <a href="#/people" className="back"><Icon name="back" />People</a>
      <div className="profile card">
        <Avatar user={u} size={88} />
        <div className="profile-body">
          <div className="profile-name-row">
            <h1>{u.name}</h1>
            <RoleBadge user={u} />
          </div>
          <div className="muted">{roleLine(u)}{u.role === 'student' && u.major ? ` · ${u.major}` : ''}</div>
          {u.note && <p className="note note-lg">{u.note}</p>}
          <div className="profile-facts">
            <div>
              <span className="detail-label">Interests</span>
              <div className="tags">{u.interests.map(i => <span key={i} className={'tag' + (shared.includes(i) ? ' tag-match' : '')}>{i}</span>)}</div>
            </div>
            <div>
              <span className="detail-label">Can teach</span>
              <div>{u.teaches.length ? u.teaches.join(', ') : <span className="muted">Nothing listed yet</span>}</div>
            </div>
            {shared.length > 0 && (
              <div>
                <span className="detail-label">In common with you</span>
                <div>{shared.join(', ')}</div>
              </div>
            )}
          </div>
        </div>
        {isMe && (
          <div className="profile-actions">
            <a href="#/me/edit" className="btn btn-outline btn-sm">Edit profile</a>
            <button className="btn btn-ghost btn-sm" onClick={() => { dispatch({ type: 'signOut' }); go('/') }}>Switch profile</button>
          </div>
        )}
      </div>

      <section>
        <div className="section-head"><h2>Hosting</h2><span>{hosting.length}</span></div>
        {hosting.length
          ? <div className="grid">{hosting.map(p => <PostCard key={p.id} post={p} />)}</div>
          : <Empty title={isMe ? 'You aren\'t hosting anything yet' : 'Not hosting anything yet'}>
              {isMe && <a className="link" href="#/new">Create a post</a>}
            </Empty>}
      </section>
      <section>
        <div className="section-head"><h2>Participating in</h2><span>{joined.length}</span></div>
        {joined.length
          ? <div className="grid">{joined.map(p => <PostCard key={p.id} post={p} />)}</div>
          : <Empty title="Nothing joined yet">{isMe && <a className="link" href="#/">Browse posts</a>}</Empty>}
      </section>
    </>
  )
}
