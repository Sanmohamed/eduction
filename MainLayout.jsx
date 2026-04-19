import { Link, NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../.././context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'
import { getMyNotifications } from '../../../backend/service api/notification.service'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dark, setDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  // ── Fetch unread notification count ────────────────────────────────────────
  useEffect(() => {
    if (!user) { setUnread(0); return }
    let isMounted = true
    getMyNotifications()
      .then((res) => { if (isMounted) setUnread(res?.unreadCount ?? 0) })
      .catch(() => { if (isMounted) setUnread(0) })
    return () => { isMounted = false }
  }, [user])

  // ── Sync dark class on <html> — app.css handles CSS variables ──────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  // ── Role-based dashboard path ───────────────────────────────────────────────
  const dashboardPath =
    user?.role === 'admin' ? '/admin' :
      user?.role === 'instructor' ? '/instructor' : '/student'

  // ── NavLink class helper ───────────────────────────────────────────────────
  const linkClass = ({ isActive }) =>
    `rounded-lg px-2 py-1 text-sm font-medium transition-colors ${isActive
      ? 'font-semibold text-blue-600 dark:text-blue-400'
      : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
    }`


  return (
    <div  className={`relative flex min-h-screen w-full flex-col transition-colors duration-300 ${dark ? "dark bg-black" : "bg-slate-50"}`}>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-[#101622]/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-6 w-6 text-blue-600">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
              EduPlatform
            </h2>
          </div>

          <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
            <NavLink to="/" className={linkClass}>Home</NavLink>
            <NavLink to="/catalog" className={linkClass}>Catalog</NavLink>
            <NavLink to="/resources" className={linkClass}>Resources</NavLink>

            <NavLink to="/wishlist" className={linkClass}>
              Wishlist
              {wishlist?.length > 0 && (
                <span className="ml-1 rounded-full bg-slate-200 px-1.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {wishlist.length}
                </span>
              )}
            </NavLink>

            <NavLink to="/checkout" className={linkClass}>
              Cart
              {cart?.length > 0 && (
                <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                  {cart.length}
                </span>
              )}
            </NavLink>

            <NavLink to="/profile" className={linkClass}>Profile</NavLink>

            {user && <NavLink to="/complaints" className={linkClass}>Complaints</NavLink>}

            {user && (
              <NavLink to="/notifications" className={linkClass}>
                Notifications
                {unread > 0 && (
                  <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                    {unread}
                  </span>
                )}
              </NavLink>
            )}

            {user?.role === "instructor" && (
              <NavLink to="/instructor" className={linkClass}>Instructor</NavLink>
            )}

            {user?.role === "admin" && (
              <NavLink to="/admin" className={linkClass}>Admin</NavLink>
            )}

            {user ? (
              <>
                <NavLink to={dashboardPath} className={linkClass}>Dashboard</NavLink>
                <button
                  onClick={logout}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>Login</NavLink>
                <NavLink
                  to="/login"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Join
                </NavLink>
              </>
            )}

            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle dark mode"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Menu
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800 md:hidden">
            <div className="flex flex-col gap-2 text-sm font-medium">
              <NavLink to="/" className={linkClass}>Home</NavLink>
              <NavLink to="/catalog" className={linkClass}>Catalog</NavLink>
              <NavLink to="/resources" className={linkClass}>Resources</NavLink>
              <NavLink to="/wishlist" className={linkClass}>Wishlist</NavLink>
              <NavLink to="/checkout" className={linkClass}>Cart</NavLink>
              <NavLink to="/profile" className={linkClass}>Profile</NavLink>

              {user && <NavLink to="/complaints" className={linkClass}>Complaints</NavLink>}
              {user && <NavLink to="/notifications" className={linkClass}>Notifications</NavLink>}
              {user?.role === "instructor" && <NavLink to="/instructor" className={linkClass}>Instructor</NavLink>}
              {user?.role === "admin" && <NavLink to="/admin" className={linkClass}>Admin</NavLink>}

              {user ? (
                <>
                  <NavLink to={dashboardPath} className={linkClass}>Dashboard</NavLink>
                  <button
                    onClick={logout}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-left text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={linkClass}>Login</NavLink>
                  <NavLink
                    to="/login"
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Join
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}