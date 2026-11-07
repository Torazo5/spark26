import { useState } from 'react'
import { INTERESTS, TYPES } from './config'
import { go, useStore } from './store'
import { ChipPicker, Icon } from './ui'
import { formatTime, uid } from './util'

const BLURB = {
  project: 'Ongoing work in the community: sustainability, energy, art, music, anything you build together.',
  class: 'Something you teach on a regular schedule: a language, an instrument, a craft, a subject.',
  event: 'A one-time gathering: a cultural dinner, a workshop, a performance, a clinic.',
}

const Field = ({ label, hint, children }) => (
  <label className="field"><span className="field-label">{label}</span>{children}{hint && <span className="field-hint">{hint}</span>}</label>
)

export default function CreatePost() {
  const { me, dispatch } = useStore()
  const [type, setType] = useState(null)
  const [f, setF] = useState({
    title: '', description: '', location: '', capacity: '', tags: [],
    status: 'Recruiting', meets: '', roles: '',
    days: '', start: '19:00', end: '20:00', level: 'Beginner',
    date: '', time: '18:00', bring: '',
  })
  const [error, setError] = useState('')
  const set = k => e => setF(s => ({ ...s, [k]: e.target.value }))

  const submit = e => {
    e.preventDefault()
    if (!f.tags.length) return setError('Pick at least one tag so the right people find this.')
    const base = {
      id: uid(), type, hostId: me.id, attendees: [], tags: f.tags,
      title: f.title.trim(), description: f.description.trim(), location: f.location.trim(),
      capacity: Number(f.capacity) || null,
    }
    const post =
      type === 'project' ? { ...base, status: f.status, meets: f.meets.trim(), roles: f.roles.split(',').map(r => r.trim()).filter(Boolean) } :
      type === 'class' ? { ...base, level: f.level, schedule: `${f.days.trim()}, ${formatTime(f.start)} – ${formatTime(f.end)}` } :
      { ...base, date: f.date, time: f.time, bring: f.bring.trim() }
    dispatch({ type: 'createPost', post })
    go(`/post/${post.id}`)
  }

  if (!type) return (
    <div className="narrow">
      <div className="page-head"><div><h1>Create a post</h1><p>What kind of thing are you starting?</p></div></div>
      <div className="type-picker">
        {Object.entries(TYPES).map(([key, t]) => (
          <button key={key} className="type-option" onClick={() => setType(key)}>
            <span className="type-option-icon"><Icon name={t.icon} size={20} /></span>
            <span className="type-option-name">{t.label}</span>
            <span className="muted small">{BLURB[key]}</span>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="narrow">
      <button className="back link-btn" onClick={() => setType(null)}><Icon name="back" />Change type</button>
      <div className="page-head"><div><h1>New {TYPES[type].label.toLowerCase()}</h1><p>{BLURB[type]}</p></div></div>

      <form className="form card" onSubmit={submit}>
        <Field label="Title">
          <input className="input" required value={f.title} onChange={set('title')} maxLength={80}
            placeholder={type === 'project' ? 'Rooftop solar monitoring' : type === 'class' ? 'Korean conversation' : 'Friendsgiving potluck'} />
        </Field>
        <Field label="Description">
          <textarea className="input" required rows={4} value={f.description} onChange={set('description')}
            placeholder="What is it, who is it for, and what will people do?" />
        </Field>

        {type === 'project' && <>
          <div className="row">
            <Field label="Status">
              <select className="input" value={f.status} onChange={set('status')}>
                <option>Recruiting</option><option>In progress</option>
              </select>
            </Field>
            <Field label="When it meets">
              <input className="input" required value={f.meets} onChange={set('meets')} placeholder="Saturdays, 10 am · through December" />
            </Field>
          </div>
          <Field label="Help needed" hint="Separate with commas">
            <input className="input" value={f.roles} onChange={set('roles')} placeholder="Sensor wiring, Data analysis, Outreach" />
          </Field>
        </>}

        {type === 'class' && <>
          <div className="row">
            <Field label="Day(s)">
              <input className="input" required value={f.days} onChange={set('days')} placeholder="Tuesdays" />
            </Field>
            <Field label="Starts"><input className="input" type="time" required value={f.start} onChange={set('start')} /></Field>
            <Field label="Ends"><input className="input" type="time" required value={f.end} onChange={set('end')} /></Field>
          </div>
          <Field label="Level">
            <select className="input" value={f.level} onChange={set('level')}>
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>All levels</option>
            </select>
          </Field>
        </>}

        {type === 'event' && <>
          <div className="row">
            <Field label="Date"><input className="input" type="date" required value={f.date} onChange={set('date')} /></Field>
            <Field label="Time"><input className="input" type="time" required value={f.time} onChange={set('time')} /></Field>
          </div>
          <Field label="What to bring">
            <input className="input" value={f.bring} onChange={set('bring')} placeholder="A dish to share" />
          </Field>
        </>}

        <div className="row">
          <Field label="Location">
            <input className="input" required value={f.location} onChange={set('location')} placeholder="Community Center, Room 2" />
          </Field>
          <Field label="Capacity" hint="Leave blank for no limit">
            <input className="input" type="number" min="1" value={f.capacity} onChange={set('capacity')} placeholder="10" />
          </Field>
        </div>

        <div className="field">
          <span className="field-label">Tags</span>
          <ChipPicker options={INTERESTS} value={f.tags} onChange={tags => { setError(''); setF(s => ({ ...s, tags })) }} />
          {error && <span className="field-error">{error}</span>}
        </div>

        <div className="form-actions">
          <a href="#/" className="btn btn-ghost">Cancel</a>
          <button className="btn btn-primary">Publish {TYPES[type].label.toLowerCase()}</button>
        </div>
      </form>
    </div>
  )
}
