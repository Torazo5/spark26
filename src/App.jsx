import { APP_NAME } from './config'
import { go, useRoute, useStore } from './store'
import { Avatar, Icon } from './ui'
import Discover from './Discover'
import PostDetail from './PostDetail'
import CreatePost from './CreatePost'
import { People, Profile } from './People'
import { EditProfile, Onboarding } from './ProfileForm'

export default function App() {
  const { me } = useStore()
  const route = useRoute()
  if (!me) return <Onboarding />

  const [, page, id] = route.split('/')
  const view =
    page === 'post' ? <PostDetail id={id} /> :
    page === 'new' ? <CreatePost /> :
    page === 'people' ? <People /> :
    page === 'u' ? <Profile id={id} /> :
    page === 'me' ? <EditProfile /> :
    <Discover />

  return (
    <>
      <Nav page={page} me={me} />
      <main className="container">{view}</main>
      <Footer />
    </>
  )
}

export const Brand = () => (
  <a href="#/" className="brand"><span className="brand-mark">{APP_NAME[0]}</span><span className="brand-name">{APP_NAME}</span></a>
)

function Nav({ page, me }) {
  const link = (href, label, active) => (
    <a href={href} className={'nav-link' + (active ? ' active' : '')}>{label}</a>
  )
  return (
    <header className="nav">
      <div className="nav-inner">
        <Brand />
        <nav className="nav-links">
          {link('#/', 'Discover', !page || page === 'post')}
          {link('#/people', 'People', page === 'people' || (page === 'u' && location.hash !== `#/u/${me.id}`))}
        </nav>
        <div className="nav-right">
          <a href="#/new" className="btn btn-primary" aria-label="Create post"><Icon name="plus" /><span className="hide-sm">Create post</span></a>
          <a href={`#/u/${me.id}`} className="nav-me" title="Your profile"><Avatar user={me} size={36} /></a>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  const { dispatch } = useStore()
  const reset = () => {
    if (!confirm('Reset all demo data? Your profile and posts in this browser will be removed.')) return
    dispatch({ type: 'reset' })
    go('/')
  }
  return (
    <footer className="footer">
      <span>{APP_NAME} prototype · data is stored in this browser</span>
      <button className="link-btn" onClick={reset}>Reset demo data</button>
    </footer>
  )
}
