import { useState } from 'react'
import { PLACE, TYPES } from './config'
import { useStore } from './store'
import { Empty, Icon, PostCard } from './ui'
import { isStudent, matchScore } from './util'

export default function Discover() {
  const { posts, users, me } = useStore()
  const [type, setType] = useState('all')
  const [tag, setTag] = useState(null)
  const [q, setQ] = useState('')

  const query = q.trim().toLowerCase()
  const filtered = posts.filter(p =>
    (type === 'all' || p.type === type) &&
    (!tag || p.tags.includes(tag)) &&
    (!query || `${p.title} ${p.description} ${p.location}`.toLowerCase().includes(query)))

  const filtering = tag || query
  const forYou = filtering ? [] : filtered
    .filter(p => p.hostId !== me.id && matchScore(p, me) > 0)
    .sort((a, b) => matchScore(b, me) - matchScore(a, me))
    .slice(0, 3)
  const rest = filtered.filter(p => !forYou.includes(p))
  const tags = [...new Set(posts.flatMap(p => p.tags))].sort()
  const count = t => posts.filter(p => t === 'all' || p.type === t).length
  const staff = users.filter(u => !isStudent(u)).length

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Discover</h1>
          <p>Projects, classes, and events at {PLACE}. Open to every 5C student and every staff and faculty resident.</p>
        </div>
        <div className="stats">
          <div className="stat"><b>{posts.length}</b><span>Active posts</span></div>
          <div className="stat"><b>{users.length - staff}</b><span>Students</span></div>
          <div className="stat"><b>{staff}</b><span>Staff & faculty</span></div>
        </div>
      </div>

      <div className="toolbar">
        <div className="tabs">
          {['all', 'project', 'class', 'event'].map(t => (
            <button key={t} className={'tab' + (type === t ? ' active' : '')} onClick={() => setType(t)}>
              {t === 'all' ? 'All' : TYPES[t].plural}<span className="count">{count(t)}</span>
            </button>
          ))}
        </div>
        <label className="search">
          <Icon name="search" />
          <input placeholder="Search posts" value={q} onChange={e => setQ(e.target.value)} />
        </label>
      </div>

      <div className="chips filter-chips">
        {tags.map(t => (
          <button key={t} className={'chip' + (tag === t ? ' on' : '')} onClick={() => setTag(tag === t ? null : t)}>{t}</button>
        ))}
      </div>

      {forYou.length > 0 && (
        <section>
          <div className="section-head"><h2>For you</h2><span>Based on your interests</span></div>
          <div className="grid">{forYou.map(p => <PostCard key={p.id} post={p} highlight />)}</div>
        </section>
      )}

      <section>
        {forYou.length > 0 && <div className="section-head"><h2>Everything else</h2><span>{rest.length} posts</span></div>}
        {rest.length
          ? <div className="grid">{rest.map(p => <PostCard key={p.id} post={p} />)}</div>
          : <Empty title="Nothing matches">Try a different filter, or <a className="link" href="#/new">create a post</a>.</Empty>}
      </section>
    </>
  )
}
