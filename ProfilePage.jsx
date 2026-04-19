import { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../../backend/service api/api'

// ─── Icons ────────────────────────────────────────────────────────────────────
const PersonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)
const CardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
)
const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
  </svg>
)
const SpinnerIcon = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)
const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV = [
  { key: 'personal',      label: 'Personal Info',  icon: <PersonIcon /> },
  { key: 'password',      label: 'Password',       icon: <LockIcon />   },
  { key: 'notifications', label: 'Notifications',  icon: <BellIcon />   },
  { key: 'billing',       label: 'Billing',        icon: <CardIcon />   },
]

// ─── Reusable field ───────────────────────────────────────────────────────────
function Field({ label, id, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls = `block w-full rounded-lg border border-slate-300 dark:border-slate-700
  bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm
  text-slate-900 dark:text-slate-50 placeholder:text-slate-400
  focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600
  transition-all duration-200`

// ─── Success / error toast ────────────────────────────────────────────────────
function Toast({ type, message }) {
  if (!message) return null
  const base = 'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium animate-fade-in'
  return type === 'success'
    ? <div className={`${base} bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400`}><CheckIcon />{message}</div>
    : <div className={`${base} bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400`}>{message}</div>
}

// ─── Section card wrapper ─────────────────────────────────────────────────────
function SectionCard({ title, subtitle, footer, children }) {
  return (
    <div className="flex flex-col gap-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-slate-900 dark:text-slate-50 text-xl font-bold leading-tight">{title}</h3>
        {subtitle && <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="p-6">{children}</div>
      {footer && (
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-800">
          {footer}
        </div>
      )}
    </div>
  )
}

// ─── Personal Info section ────────────────────────────────────────────────────
function PersonalSection({ user, setUser }) {
  const [form,    setForm]    = useState({ name: user?.name ?? '', email: user?.email ?? '', bio: user?.bio ?? '' })
  const [loading, setLoading] = useState(false)
  const [toast,   setToast]   = useState({ type: '', message: '' })
  const [avatar,  setAvatar]  = useState(user?.avatar ?? '')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast({ type: '', message: '' }), 3500)
  }

  // Upload avatar to Cloudinary via backend
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('avatar', file)
    try {
      setUploading(true)
      const { data } = await api.post('/users/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setAvatar(data.avatarUrl)
      showToast('success', 'Avatar updated.')
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const removeAvatar = async () => {
    try {
      await api.delete('/users/avatar')
      setAvatar('')
      showToast('success', 'Avatar removed.')
    } catch {
      showToast('error', 'Failed to remove avatar.')
    }
  }

  const save = async () => {
    setLoading(true)
    try {
      const { data } = await api.put('/users/profile', form)
      setUser(data.user)
      showToast('success', 'Profile updated successfully.')
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed to save changes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SectionCard
      title="Personal Information"
      subtitle="Update your photo and personal details here."
      footer={
        <>
          <Toast type={toast.type} message={toast.message} />
          <button
            onClick={() => setForm({ name: user?.name ?? '', email: user?.email ?? '', bio: user?.bio ?? '' })}
            className="flex h-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={loading}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <><SpinnerIcon /> Saving…</> : 'Save Changes'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Name */}
        <Field label="Full Name" id="full-name">
          <input id="full-name" type="text" className={inputCls} value={form.name} onChange={set('name')} placeholder="Your full name" />
        </Field>

        {/* Email */}
        <div className="md:col-span-2">
          <Field label="Email Address" id="email">
            <input id="email" type="email" className={inputCls} value={form.email} onChange={set('email')} placeholder="you@example.com" />
          </Field>
        </div>

        {/* Avatar */}
        <div className="md:col-span-3 flex items-center gap-6">
          <div className="relative flex-shrink-0">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-slate-200 dark:border-slate-700">
                {form.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <SpinnerIcon />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <CameraIcon /> Change
            </button>
            {avatar && (
              <button
                onClick={removeAvatar}
                className="flex h-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="md:col-span-3">
          <Field label="Bio" id="bio">
            <textarea
              id="bio" rows={4}
              className={inputCls}
              value={form.bio}
              onChange={set('bio')}
              placeholder="Tell us a little about yourself…"
            />
          </Field>
        </div>
      </div>
    </SectionCard>
  )
}

// ─── Password section ─────────────────────────────────────────────────────────
function PasswordSection() {
  const [form,    setForm]    = useState({ current: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [toast,   setToast]   = useState({ type: '', message: '' })

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast({ type: '', message: '' }), 3500)
  }

  const save = async () => {
    if (form.password !== form.confirm) { showToast('error', 'Passwords do not match.'); return }
    if (form.password.length < 8) { showToast('error', 'Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      await api.put('/users/password', { currentPassword: form.current, newPassword: form.password })
      setForm({ current: '', password: '', confirm: '' })
      showToast('success', 'Password updated successfully.')
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SectionCard
      title="Change Password"
      subtitle="Ensure your account is using a strong password."
      footer={
        <>
          <Toast type={toast.type} message={toast.message} />
          <button
            onClick={() => setForm({ current: '', password: '', confirm: '' })}
            className="flex h-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={loading}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <><SpinnerIcon /> Saving…</> : 'Update Password'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 max-w-md">
        <Field label="Current Password" id="current-pw">
          <input id="current-pw" type="password" className={inputCls} value={form.current} onChange={set('current')} placeholder="Enter current password" autoComplete="current-password" />
        </Field>
        <Field label="New Password" id="new-pw">
          <input id="new-pw" type="password" className={inputCls} value={form.password} onChange={set('password')} placeholder="At least 8 characters" autoComplete="new-password" />
        </Field>
        <Field label="Confirm New Password" id="confirm-pw">
          <input id="confirm-pw" type="password" className={inputCls} value={form.confirm} onChange={set('confirm')} placeholder="Re-enter new password" autoComplete="new-password" />
        </Field>
      </div>
    </SectionCard>
  )
}

// ─── Notifications section ────────────────────────────────────────────────────
function NotificationsSection() {
  const [prefs,   setPrefs]   = useState({ email: true, push: false, newsletter: true })
  const [loading, setLoading] = useState(false)
  const [toast,   setToast]   = useState({ type: '', message: '' })

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }))

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast({ type: '', message: '' }), 3500)
  }

  const save = async () => {
    setLoading(true)
    try {
      await api.put('/users/notifications', prefs)
      showToast('success', 'Notification preferences saved.')
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed to save preferences.')
    } finally {
      setLoading(false)
    }
  }

  const ITEMS = [
    { key: 'email',      label: 'Email Notifications',  desc: 'Receive emails about course updates, announcements, and deadlines.'        },
    { key: 'push',       label: 'Push Notifications',   desc: 'Get push notifications on your devices for important updates.'              },
    { key: 'newsletter', label: 'Platform Newsletter',  desc: 'Subscribe to our monthly newsletter for new courses and platform news.'     },
  ]

  return (
    <SectionCard
      title="Notification Preferences"
      subtitle="Manage how you receive notifications from us."
      footer={
        <>
          <Toast type={toast.type} message={toast.message} />
          <button
            className="flex h-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={loading}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <><SpinnerIcon /> Saving…</> : 'Save Changes'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {ITEMS.map(({ key, label, desc }) => (
          <div key={key} className="flex items-start gap-3">
            <div className="flex h-6 items-center">
              <input
                id={key}
                type="checkbox"
                checked={prefs[key]}
                onChange={() => toggle(key)}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 accent-blue-600 cursor-pointer"
              />
            </div>
            <div className="text-sm leading-6">
              <label htmlFor={key} className="font-medium text-slate-900 dark:text-slate-200 cursor-pointer">{label}</label>
              <p className="text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── Billing section ──────────────────────────────────────────────────────────
function BillingSection() {
  return (
    <SectionCard title="Billing" subtitle="Manage your subscription and payment methods.">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Billing management coming soon. Contact support for help with payments.
      </p>
    </SectionCard>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [active, setActive] = useState('personal')

  const sections = {
    personal:      <PersonalSection      user={user} setUser={setUser} />,
    password:      <PasswordSection />,
    notifications: <NotificationsSection />,
    billing:       <BillingSection />,
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-slate-50 dark:bg-[#101622] overflow-x-hidden transition-colors duration-300">

   
      <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 px-10 py-3 sticky top-0 z-10 bg-slate-50/80 dark:bg-[#101622]/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 text-blue-600">

          </div>
          <h2 className="text-slate-900 dark:text-slate-50 text-lg font-bold tracking-tight">EduPlatform</h2>
        </div>

        <nav className="flex flex-1 justify-center">
          <div className="flex items-center gap-9">
            {[
              { label: 'Home',      href: '/'          },
              { label: 'Dashboard', href: '/student', active: true },
              { label: 'Resources', href: '/resources' },
              { label: 'Courses',   href: '/courses'   },
            ].map(({ label, href, active: a }) => (
              <a key={label} href={href} className={`text-sm font-medium leading-normal transition-colors ${a ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                {label}
              </a>
            ))}
          </div>
        </nav>

        <div className="flex items-center gap-3">
          <button className="relative rounded-full p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <BellIcon />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-50 dark:ring-[#101622]" />
          </button>
          {user?.avatar
            ? <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            : <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">{user?.name?.[0]?.toUpperCase() ?? 'U'}</div>
          }
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="px-10 flex flex-1 justify-center py-8">
        <div className="flex flex-col w-full max-w-7xl flex-1 gap-8">

          {/* Title */}
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-slate-50 text-4xl font-black leading-tight tracking-tight">
              Profile &amp; Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-base leading-normal max-w-2xl">
              Manage your personal information, contact details, and preferences.
            </p>
          </div>

          {/* Layout */}
          <div className="flex flex-col lg:flex-row items-start gap-8">

            {/* Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                {NAV.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setActive(key)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-left w-full transition-colors duration-150 ${
                      active === key
                        ? 'bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1 flex flex-col gap-8">
              {sections[active]}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}