import { useState } from 'react'
import { APP_NAME, COLLEGES, INTERESTS, PLACE, TYPES } from './config'
import { go, useStore } from './store'
import { Avatar, ChipPicker, Icon } from './ui'
import { roleLine, uid } from './util'

const YEARS = [2026, 2027, 2028, 2029, 2030]
const DEMO = ['u11', 'u2', 'u3']
const NOTE_MAX = 140

function ProfileForm({ initial, submitLabel, onSaved }) {
  const { dispatch } = useStore()
  const [f, setF] = useState(() => ({
    name: '', role: 'student', college: COLLEGES[0], year: 2028, major: '', dept: '', interests: [], note: '',
    ...initial,
    teaches: (initial?.teaches || []).join(', '),
  }))
  const [error, setError] = useState('')
  const set = k => e => setF(s => ({ ...s, [k]: e.target.value }))

  const submit = e => {
    e.preventDefault()
    if (!f.interests.length) return setError('Pick at least one interest.')
    const user = {
      ...f,
      id: f.id || uid(),
      name: f.name.trim(),
      year: Number(f.year),
      note: f.note.trim(),
      teaches: f.teaches.split(',').map(t => t.trim()).filter(Boolean),
    }
    dispatch({ type: 'saveProfile', user })
    onSaved(user)
  }

  return (
    <form className="form" onSubmit={submit}>
      <label className="field">
        <span className="field-label">Full name</span>
        <input className="input" required value={f.name} onChange={set('name')} placeholder="Alex Rivera" />
      </label>

      <div className="field">
        <span className="field-label">I am</span>
        <div className="segmented">
          {[['student', 'A student'], ['faculty', 'Faculty'], ['staff', 'Staff']].map(([key, label]) => (
            <button type="button" key={key} className={f.role === key ? 'on' : ''} onClick={() => setF(s => ({ ...s, role: key }))}>{label}</button>
          ))}
        </div>
      </div>

      <div className="row">
        <label className="field">
          <span className="field-label">College</span>
          <select className="input" value={f.college} onChange={set('college')}>{COLLEGES.map(c => <option key={c}>{c}</option>)}</select>
        </label>
        {f.role === 'student' ? <>
          <label className="field">
            <span className="field-label">Class year</span>
            <select className="input" value={f.year} onChange={set('year')}>{YEARS.map(y => <option key={y}>{y}</option>)}</select>
          </label>
          <label className="field">
            <span className="field-label">Major</span>
            <input className="input" value={f.major} onChange={set('major')} placeholder="Undeclared" />
          </label>
        </> : (
          <label className="field">
            <span className="field-label">Department</span>
            <input className="input" required value={f.dept} onChange={set('dept')} placeholder={f.role === 'faculty' ? 'Physics' : 'Facilities'} />
          </label>
        )}
      </div>

      <div className="field">
        <span className="field-label">Interests</span>
        <ChipPicker options={INTERESTS} value={f.interests} onChange={interests => { setError(''); setF(s => ({ ...s, interests })) }} />
        {error && <span className="field-error">{error}</span>}
      </div>

      <label className="field">
        <span className="field-label">Things you could teach</span>
        <input className="input" value={f.teaches} onChange={set('teaches')} placeholder="Spanish, Guitar, Bread baking" />
        <span className="field-hint">Separate with commas. Optional.</span>
      </label>

      <label className="field">
        <span className="field-label">Personal note</span>
        <textarea className="input" rows={2} maxLength={NOTE_MAX} value={f.note} onChange={set('note')}
          placeholder="Something people should know about you" />
        <span className="field-hint">{f.note.length}/{NOTE_MAX}</span>
      </label>

      <div className="form-actions"><button className="btn btn-primary btn-block">{submitLabel}</button></div>
    </form>
  )
}

export function Onboarding() {
  const { user, dispatch } = useStore()
  const enter = () => go('/')
  return (
    <div className="onboard">
      <div className="onboard-side">
        <div className="brand brand-lg"><span className="brand-mark">{APP_NAME[0]}</span>{APP_NAME}</div>
        <p className="onboard-lead">Projects, classes, and events shared by 5C students and the staff and faculty who live at {PLACE}.</p>
        <div className="onboard-types">
          {Object.entries(TYPES).map(([k, t]) => (
            <div key={k} className="onboard-type">
              <span className="type-option-icon"><Icon name={t.icon} size={18} /></span>
              <div>
                <b>{t.plural}</b>
                <span>{k === 'project' ? 'Build something together in the community.' : k === 'class' ? 'Teach or learn on a regular schedule.' : 'One-time dinners, workshops, and nights out.'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="onboard-main">
        <div className="onboard-form">
          <h1>Create your profile</h1>
          <p className="muted">Takes about a minute. Your interests decide what shows up first for you.</p>
          <ProfileForm submitLabel="Create profile" onSaved={enter} />
          <div className="demo-pick">
            <span className="field-label">Or explore as an existing member</span>
            {DEMO.map(id => user(id)).map(u => (
              <button key={u.id} className="demo-row" onClick={() => { dispatch({ type: 'signIn', id: u.id }); enter() }}>
                <Avatar user={u} size={36} />
                <span className="person-text"><span className="person-name">{u.name}</span><span className="small muted">{roleLine(u)}</span></span>
                <Icon name="back" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function EditProfile() {
  const { me } = useStore()
  return (
    <div className="narrow">
      <a href={`#/u/${me.id}`} className="back"><Icon name="back" />Your profile</a>
      <div className="page-head"><div><h1>Edit profile</h1></div></div>
      <div className="card"><ProfileForm initial={me} submitLabel="Save changes" onSaved={u => go(`/u/${u.id}`)} /></div>
    </div>
  )
}
