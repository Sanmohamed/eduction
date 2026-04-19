import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'
import { useNotifications } from '../../context/NotificationContext'

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

function NotificationDropdown({
  notifications,
  unread,
  onMarkRead,
  onMarkAll,
  onClose,
}) {
  const latest = notifications.slice(0, 5)

  const handleMarkRead = async (id) => {
    await onMarkRead(id)
    onClose()
  }

  const handleMarkAll = async () => {
    await onMarkAll()
    onClose()
  }

  return (
    <div className="absolute right-0 top-12 z-[60] w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-[dropdownIn_.18s_ease-out] dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Notifications
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {unread > 0 ? `${unread} unread` : 'All caught up'}
          </p>
        </div>

        {notifications.length > 0 && unread > 0 && (
          <button
            onClick={handleMarkAll}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Mark all
          </button>
        )}
      </div>

      <div className="max-h-[380px] overflow-y-auto">
        {latest.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
            No notifications yet.
          </div>
        ) : (
          latest.map((item) => (
            <div
              key={item._id}
              className={`border-b border-slate-100 px-4 py-3 last:border-b-0 transition ${item.isRead
                  ? 'bg-white dark:bg-slate-900'
                  : 'bg-blue-50/70 dark:bg-blue-500/10'
                }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                    {item.message}
                  </p>
                </div>

                {!item.isRead && (
                  <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500" />
                )}
              </div>

              <div className="mt-3 flex items-center gap-2">
                {item.actionUrl && (
                  <Link
                    to={item.actionUrl}
                    onClick={onClose}
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-slate-700"
                  >
                    Open
                  </Link>
                )}

                {!item.isRead && (
                  <button
                    onClick={() => handleMarkRead(item._id)}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
        <Link
          to="/notifications"
          onClick={onClose}
          className="block text-center text-sm font-semibold text-blue-600 hover:underline"
        >
          View all notifications
        </Link>
      </div>
    </div>
  )
}

function NotificationToast({ item, onClose }) {
  if (!item) return null

  return (
    <div className="fixed right-4 top-20 z-[80] w-[340px] max-w-[calc(100vw-2rem)] animate-[toastIn_.25s_ease-out] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {item.title}
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
            {item.message}
          </p>

          <div className="mt-3 flex gap-2">
            {item.actionUrl ? (
              <Link
                to={item.actionUrl}
                onClick={onClose}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Open
              </Link>
            ) : (
              <Link
                to="/notifications"
                onClick={onClose}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                View
              </Link>
            )}

            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default function MainLayout() {
  const { user, logout } = useAuth()
  const { wishlist } = useWishlist()
  const { cart } = useCart()
  const { notifications, unread, toast, dismissToast, markAsRead, markAll } = useNotifications()
  const navigate = useNavigate()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [dark, setDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false)
      if (window.innerWidth < 768) setNotifOpen(false)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-notification-area]')) {
        setNotifOpen(false)
      }
    }

    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [notifOpen])

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'instructor'
        ? '/instructor'
        : '/student'

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const handleLogout = () => {
    closeMobileMenu()
    setNotifOpen(false)
    logout()
    navigate('/', { replace: true })
  }

  const linkClass = ({ isActive }) =>
    `rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${isActive
      ? 'font-semibold text-blue-600 dark:text-blue-400'
      : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
    }`

  const mobileLinkClass = ({ isActive }) =>
    `rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive
      ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`

  return (
    <div className={`relative flex min-h-screen w-full flex-col transition-colors duration-300 ${dark ? 'dark bg-black' : 'bg-slate-50'}`}>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-sm dark:border-slate-800 dark:bg-[#101622]/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3 shrink-0">
            <div className="h-6 w-6 text-blue-600 flex-shrink-0">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-lg">
              EduPlatform
            </h2>
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-medium lg:flex">
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

            {user && <NavLink to="/complaints" className={linkClass}>Complaints</NavLink>}
            {user?.role === 'instructor' && <NavLink to="/instructor" className={linkClass}>Instructor</NavLink>}
            {user?.role === 'admin' && <NavLink to="/admin" className={linkClass}>Admin</NavLink>}
            {user && <NavLink to={dashboardPath} className={linkClass}>Dashboard</NavLink>}
          </nav>

          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {user ? (
              <>
                <div className="relative" data-notification-area>
                  <button
                    type="button"
                    onClick={() => setNotifOpen((prev) => !prev)}
                    className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    title="Notifications"
                  >
                    <span className={unread > 0 ? 'animate-[bellRing_.6s_ease-in-out]' : ''}>
                      <BellIcon />
                    </span>

                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <NotificationDropdown
                      notifications={notifications}
                      unread={unread}
                      onMarkRead={markAsRead}
                      onMarkAll={markAll}
                      onClose={() => setNotifOpen(false)}
                    />
                  )}
                </div>

                <Link
                  to="/profile"
                  className="flex max-w-[220px] items-center gap-3 rounded-full border border-slate-200 bg-white pl-2 pr-3 py-1.5 transition hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="h-9 w-9 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white flex-shrink-0">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}

                  <div className="min-w-0 flex flex-col leading-tight">
                    <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {user?.name || 'Profile'}
                    </span>
                    <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user?.role === 'instructor'
                        ? 'Instructor'
                        : user?.role === 'admin'
                          ? 'Admin'
                          : 'Student'}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
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
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <Link
                to="/notifications"
                onClick={() => {
                  closeMobileMenu()
                  setNotifOpen(false)
                }}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <BellIcon />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center animate-pulse">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </Link>
            )}

            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle dark mode"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800 md:hidden">
            <div className="flex flex-col gap-2">
              {user && (
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="mb-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="h-11 w-11 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white flex-shrink-0">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {user?.name || 'Profile'}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user?.role === 'instructor'
                        ? 'Instructor'
                        : user?.role === 'admin'
                          ? 'Admin'
                          : 'Student'}
                    </p>
                  </div>
                </Link>
              )}

              <NavLink to="/" className={mobileLinkClass} onClick={closeMobileMenu}>Home</NavLink>
              <NavLink to="/catalog" className={mobileLinkClass} onClick={closeMobileMenu}>Catalog</NavLink>
              <NavLink to="/resources" className={mobileLinkClass} onClick={closeMobileMenu}>Resources</NavLink>

              <NavLink to="/wishlist" className={mobileLinkClass} onClick={closeMobileMenu}>
                Wishlist
                {wishlist?.length > 0 && (
                  <span className="ml-2 rounded-full bg-slate-200 px-1.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                    {wishlist.length}
                  </span>
                )}
              </NavLink>

              <NavLink to="/checkout" className={mobileLinkClass} onClick={closeMobileMenu}>
                Cart
                {cart?.length > 0 && (
                  <span className="ml-2 rounded-full bg-blue-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                    {cart.length}
                  </span>
                )}
              </NavLink>

              {user && <NavLink to="/profile" className={mobileLinkClass} onClick={closeMobileMenu}>Profile</NavLink>}
              {user && <NavLink to="/complaints" className={mobileLinkClass} onClick={closeMobileMenu}>Complaints</NavLink>}

              {user && (
                <NavLink to="/notifications" className={mobileLinkClass} onClick={closeMobileMenu}>
                  Notifications
                  {unread > 0 && (
                    <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </NavLink>
              )}

              {user?.role === 'instructor' && (
                <NavLink to="/instructor" className={mobileLinkClass} onClick={closeMobileMenu}>
                  Instructor
                </NavLink>
              )}

              {user?.role === 'admin' && (
                <NavLink to="/admin" className={mobileLinkClass} onClick={closeMobileMenu}>
                  Admin
                </NavLink>
              )}

              {user ? (
                <>
                  <NavLink to={dashboardPath} className={mobileLinkClass} onClick={closeMobileMenu}>
                    Dashboard
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="rounded-xl bg-slate-900 px-4 py-2.5 text-left text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={mobileLinkClass} onClick={closeMobileMenu}>
                    Login
                  </NavLink>
                  <NavLink
                    to="/login"
                    onClick={closeMobileMenu}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Join
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>

      <NotificationToast item={toast} onClose={dismissToast} />
    </div>
  )
}