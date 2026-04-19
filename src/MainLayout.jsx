import { Link, NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'
import { getMyNotifications } from '../../../backend/services/notification.service'

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

export default function MainLayout() {
  const { user, logout } = useAuth()
  const { wishlist } = useWishlist()
  const { cart } = useCart()
  const [unread, setUnread] = useState(0)
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)

  useEffect(() => {
    let isMounted = true

    if (!user) {
      setUnread(0)
      return
    }

    getMyNotifications()
      .then((res) => {
        if (isMounted) setUnread(res?.unreadCount || 0)
      })
      .catch(() => {
        if (isMounted) setUnread(0)
      })

    return () => {
      isMounted = false
    }
  }, [user])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const linkClass = ({ isActive }) =>
    `rounded-lg px-2 py-1 transition-colors ${isActive
      ? 'font-semibold text-blue-600'
      : 'text-slate-700 hover:text-blue-600'
    }`

  let dashboardPath = '/student'
  if (user?.role === 'admin') dashboardPath = '/admin'
  else if (user?.role === 'instructor') dashboardPath = '/instructor'

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-slate-50 dark:bg-[#101622] overflow-x-hidden transition-colors duration-300">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 px-10 py-3 sticky top-0 z-50 bg-white dark:bg-[#101622]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-4">
            <div className='w-6 h-6 text-blue-600'>
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-slate-900 dark:text-slate-50 text-lg font-bold tracking-tight">EduPlatform</h2>
          </div>

          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium">

            <Link to="/" className={linkClass}>
              Home
            </Link>

            <NavLink to="/catalog" className={linkClass}>
              Catalog
            </NavLink>

            <NavLink to="/resources" className={linkClass}>
              Resources
            </NavLink>

            <NavLink to="/wishlist" className={linkClass}>
              Wishlist ({wishlist?.length || 0})
            </NavLink>

            <NavLink to="/checkout" className={linkClass}>
              Cart ({cart?.length || 0})
            </NavLink>
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>

            {user && (
              <NavLink to="/complaints" className={linkClass}>
                Complaints
              </NavLink>
            )}

            {user && (
              <NavLink to="/notifications" className={linkClass}>
                <span className="inline-flex items-center gap-2">
                  Notifications
                  {unread > 0 && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                      {unread}
                    </span>
                  )}
                </span>
              </NavLink>
            )}

            {user?.role === 'instructor' && (
              <NavLink to="/instructor" className={linkClass}>
                Instructor
              </NavLink>
            )}

            {user?.role === 'admin' && (
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            )}

            {user ? (
              <>
                <NavLink to={dashboardPath} className={linkClass}>
                  Dashboard
                </NavLink>
                <button
                  onClick={logout}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                >
                  Join
                </NavLink>
              </>

            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDark((d) => !d)}
                title="Toggle dark mode"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all duration-200"
              >
                {dark ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}