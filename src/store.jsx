import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { seedPosts, seedUsers } from './seed'

const KEY = 'commons-demo-v1'
const fresh = () => ({ users: seedUsers, posts: seedPosts, me: null })

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (saved && Array.isArray(saved.users) && Array.isArray(saved.posts)) return saved
  } catch {}
  return fresh()
}

function reducer(s, a) {
  switch (a.type) {
    case 'saveProfile': {
      const exists = s.users.some(u => u.id === a.user.id)
      return {
        ...s,
        me: a.user.id,
        users: exists ? s.users.map(u => (u.id === a.user.id ? a.user : u)) : [...s.users, a.user],
      }
    }
    case 'signIn':
      return { ...s, me: a.id }
    case 'signOut':
      return { ...s, me: null }
    case 'createPost':
      return { ...s, posts: [a.post, ...s.posts] }
    case 'deletePost':
      return { ...s, posts: s.posts.filter(p => p.id !== a.id) }
    case 'toggleJoin':
      return {
        ...s,
        posts: s.posts.map(p => {
          if (p.id !== a.id) return p
          const joined = p.attendees.includes(s.me)
          return { ...p, attendees: joined ? p.attendees.filter(x => x !== s.me) : [...p.attendees, s.me] }
        }),
      }
    case 'reset':
      return fresh()
    default:
      return s
  }
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, load)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  }, [state])
  const value = useMemo(() => {
    const byId = Object.fromEntries(state.users.map(u => [u.id, u]))
    return { users: state.users, posts: state.posts, me: byId[state.me] || null, user: id => byId[id], dispatch }
  }, [state])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)

// Hash routing keeps Vercel static hosting zero-config.
export function useRoute() {
  const get = () => location.hash.slice(1) || '/'
  const [route, setRoute] = useState(get)
  useEffect(() => {
    const onChange = () => { setRoute(get()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export const go = path => { location.hash = path }
