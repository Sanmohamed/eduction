import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

// ─── Icons ───────────────────────────────────────────────────────────────────
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)
const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)
const SpinnerIcon = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)
const GoogleLogo = () => (
  <img
    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDm00smVas-ylGOFyP4V0QWgAbHzMcwKOOJoD1KhPBf3ozNr3NdOyVL3TpETBmNbSeqVE2k9joqFKz-R9LqtjhW9Z5kjEMU6KJzMH-R3QwDkUuNp1c-i0CiwPRLXqigh6hEVMDG4RBjw6RhvCRY5UX4QG0u75f4ECO_17xlHuIRPD3XW3MU1BxCXTdOGL5ppzrrFAY97aC95P8S6VqS60mI7OLspB1-cQRG3tBIlxskgvA_IObKVLz4kfr9S-vgxxJ9pkkgUxBx7ik"
    alt="Google"
    className="w-5 h-5 flex-shrink-0"
  />
)
function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium animate-fade-in bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400">
      <AlertIcon />
      {message}
    </div>
  )
}

function Divider({ text = 'or continue with' }) {
  return (
    <div className="relative flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
      <span className="text-xs uppercase tracking-widest font-medium text-slate-400 dark:text-slate-500">{text}</span>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
    </div>
  )
}

function GoogleButton({ label = 'Continue with Google' }) {
  return (
    <button
      type="button"
      className="w-full h-11 flex items-center justify-center gap-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-400"
    >
      <GoogleLogo />
      {label}
    </button>
  )
}

function PrimaryBtn({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full h-12 rounded-lg font-semibold text-[15px] tracking-tight text-white transition-all duration-200 active:scale-[.98] bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 hover:shadow-blue-600/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
    >
      {loading ? <><SpinnerIcon /> Loading…</> : children}
    </button>
  )
}

function InputField({ label, id, type = 'text', placeholder, icon, value, onChange, required, autoComplete, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}{required && <span className="text-amber-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
          {icon}
        </span>
        <input
          id={id} type={type} placeholder={placeholder}
          value={value} onChange={onChange} autoComplete={autoComplete}
          className="w-full h-11 pl-10 pr-10 rounded-lg text-sm outline-none transition-all duration-200 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-800"
        />
        {children}
      </div>
    </div>
  )
}

function PasswordField({ label, id, placeholder, value, onChange, required, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <InputField
      label={label} id={id} type={show ? 'text' : 'password'}
      placeholder={placeholder} icon={<LockIcon />}
      value={value} onChange={onChange} required={required} autoComplete={autoComplete}
    >
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        {show ? <EyeIcon /> : <EyeOffIcon />}
      </button>
    </InputField>
  )
}

// ─── Password strength ────────────────────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const map = [
    { label: '',       color: ''             },
    { label: 'Weak',   color: 'bg-red-500'   },
    { label: 'Fair',   color: 'bg-amber-400' },
    { label: 'Good',   color: 'bg-amber-400' },
    { label: 'Strong', color: 'bg-green-500' },
  ]
  return { score, ...map[score] }
}

function StrengthMeter({ password }) {
  const { score, label, color } = getStrength(password)
  const textColor = score === 1 ? 'text-red-500' : score <= 3 ? 'text-amber-500' : 'text-green-500'
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : 'bg-slate-200 dark:bg-slate-700'}`}
          />
        ))}
      </div>
      {label && <p className={`text-xs text-right font-medium ${textColor}`}>{label}</p>}
    </div>
  )
}

// ─── Login panel ──────────────────────────────────────────────────────────────
function LoginPanel() {
  const [form,     setForm]     = useState({ email: '', password: '' })
  const [remember, setRemember] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const { login } = useAuth()
  const navigate  = useNavigate()

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const { mergeCartAfterLogin } = useCart()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    try {
      setLoading(true)
      const data = await login ({email : form.email, password: form.password})
      try {
      await mergeCartAfterLogin()
      } catch (mergeErr) {
        console.error('Cart merge failed after login:', mergeErr)
      }
      if (data.user.role === 'instructor') {
        navigate('/instructor', { replace: true })
      } else {
        navigate('/student', { replace: true })
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4 animate-fade-in">
      <ErrorBanner message={error} />

      <InputField
        label="Email Address" id="login-email" type="email"
        placeholder="you@example.com" icon={<MailIcon />}
        value={form.email} onChange={set('email')} autoComplete="email"
      />

      <PasswordField
        label="Password" id="login-pw" placeholder="Enter your password"
        value={form.password} onChange={set('password')} autoComplete="current-password"
      />

      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-500 dark:text-slate-400">
          <input
            type="checkbox" checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
          />
          Remember me
        </label>
        <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Forgot Password?</a>
      </div>

      <PrimaryBtn loading={loading}>Sign In</PrimaryBtn>
      <Divider />
      <GoogleButton />
    </form>
  )
}

// ─── Register panel ───────────────────────────────────────────────────────────
function RegisterPanel({ userType }) {
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' })
  const [terms,   setTerms]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const { register } = useAuth()
  const navigate     = useNavigate()
  // role is derived from the user-type toggle, not shown as a form field
  const role         = userType === 'council' ? 'instructor' : 'student'
    const redirectTo = role === 'instructor' ? '/instructor' : '/student'

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const { name, email, password, confirm } = form
    if (!name || !email || !password || !confirm) {
      setError('Please fill in all required fields.')
      return
    }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (!terms) { setError('Please agree to the Terms of Service.'); return }
    try {
      setLoading(true)
      // matches backend: { name, email, password, role }
      await register({ name, email, password, role })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4 animate-fade-in">
      <ErrorBanner message={error} />

      <InputField
        label="Full Name" id="reg-name" placeholder="Jane Doe"
        icon={<UserIcon />} value={form.name} onChange={set('name')}
        required autoComplete="name"
      />

      <InputField
        label="Email Address" id="reg-email" type="email"
        placeholder="you@example.com" icon={<MailIcon />}
        value={form.email} onChange={set('email')}
        required autoComplete="email"
      />

      <div>
        <PasswordField
          label="Password" id="reg-pw" placeholder="Create a strong password"
          value={form.password} onChange={set('password')}
          required autoComplete="new-password"
        />
        <StrengthMeter password={form.password} />
      </div>

      <PasswordField
        label="Confirm Password" id="reg-pw2" placeholder="Re-enter your password"
        value={form.confirm} onChange={set('confirm')}
        required autoComplete="new-password"
      />

      <label className="flex items-start gap-2.5 cursor-pointer text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        <input
          type="checkbox" checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded accent-blue-600 cursor-pointer flex-shrink-0"
        />
        <span>
          I agree to the{' '}
          <a href="#" className="text-blue-600 font-medium hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-blue-600 font-medium hover:underline">Privacy Policy</a>
        </span>
      </label>

      <PrimaryBtn loading={loading}>Create Account</PrimaryBtn>
      <Divider text="or sign up with" />
      <GoogleButton label="Sign up with Google" />
    </form>
  )
}

export default function LoginPage() {
  const [dark,     setDark]     = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [userType, setUserType] = useState('student')
  const [tab,      setTab]      = useState('login')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div className="min-h-screen relative overflow-x-hidden transition-colors duration-300">

      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage:
          'linear-gradient(rgba(148,163,184,.12) 1px,transparent 1px),' +
          'linear-gradient(90deg,rgba(148,163,184,.12) 1px,transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div className="fixed -top-32 -left-20 w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-[0.08] pointer-events-none z-0" />
      <div className="fixed -bottom-16 -right-10 w-72 h-72 bg-amber-400 rounded-full blur-[80px] opacity-[0.07] pointer-events-none z-0" />

      <div className="relative z-[1] flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12 min-h-screen">
        <div className="w-full max-w-[440px] animate-slide-up">

          <div className="text-center mb-6 sm:mb-7">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 leading-tight text-slate-900 dark:text-white">
              Welcome back to{' '}
              <span className="text-blue-600 italic">learning</span>
            </h1>
            <p className="text-sm leading-relaxed text-[#6366f1] dark:text-slate-400">
              Sign in to access your courses, grades, and platform resources.
            </p>
          </div>

          
          <div className="rounded-2xl overflow-hidden shadow-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">

         
            <div className="px-5 pt-5">
              <div className="flex rounded-xl p-1 gap-1 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                {[
                  { val: 'student', label: 'Student / User' },
                  { val: 'council', label: 'Council Member' },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setUserType(val)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                      userType === val
                        ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {userType === val && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                    )}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab nav */}
            <div className="flex px-5 mt-4 border-b border-slate-200 dark:border-slate-800">
              {[
                { val: 'login',    label: 'Login'    },
                { val: 'register', label: 'Register' },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTab(val)}
                  className={`flex-1 py-3 text-[13.5px] font-medium border-b-2 transition-all duration-200 ${
                    tab === val
                      ? 'border-blue-600 text-blue-600 font-semibold'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

       
            <div className="p-5">
              {tab === 'login'
                ? <LoginPanel />
                : <RegisterPanel key={`register-${userType}`} userType={userType} />
              }
            </div>
          </div>

          <p className="text-center text-xs mt-6 text-slate-400 dark:text-slate-600">
            &copy; 2025 Educational Platform — All rights reserved
          </p>
        </div>
      </div>
    </div>
  )
}