import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { createComplaint, getMyComplaints } from "../../../backend/service api/complaint.service";
// ─── Service calls (replaces backend direct import) ───────────────────────────


// ─── Icons ────────────────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
)
const FaqIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)
const ChatIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)
const PhoneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.44 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)
const SpinnerIcon = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:    'bg-amber-50  dark:bg-amber-500/10  text-amber-700  dark:text-amber-400  border-amber-200  dark:border-amber-500/20',
    reviewing:  'bg-blue-50   dark:bg-blue-500/10   text-blue-700   dark:text-blue-400   border-blue-200   dark:border-blue-500/20',
    resolved:   'bg-green-50  dark:bg-green-500/10  text-green-700  dark:text-green-400  border-green-200  dark:border-green-500/20',
    rejected:   'bg-red-50    dark:bg-red-500/10    text-red-700    dark:text-red-400    border-red-200    dark:border-red-500/20',
  }
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${map[status] ?? map.pending}`}>
      {status}
    </span>
  )
}

// ─── Priority badge ───────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const map = {
    low:    'text-slate-500  dark:text-slate-400',
    medium: 'text-amber-600  dark:text-amber-400',
    high:   'text-red-600    dark:text-red-400',
  }
  return (
    <span className={`text-xs font-semibold uppercase ${map[priority] ?? map.medium}`}>
      {priority}
    </span>
  )
}

// ─── Input / textarea shared styles ──────────────────────────────────────────
const inputCls = `w-full rounded-lg border border-slate-200 dark:border-slate-700
  bg-slate-50 dark:bg-[#101622] text-slate-900 dark:text-slate-50
  placeholder:text-slate-400 dark:placeholder:text-slate-500
  px-4 h-12 text-sm outline-none transition-all duration-200
  focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20`

const selectCls = `${inputCls} appearance-none cursor-pointer`

const textareaCls = `w-full rounded-lg border border-slate-200 dark:border-slate-700
  bg-slate-50 dark:bg-[#101622] text-slate-900 dark:text-slate-50
  placeholder:text-slate-400 dark:placeholder:text-slate-500
  px-4 py-3 text-sm outline-none transition-all duration-200 resize-y
  focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20`

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
      {children}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ComplaintsPage() {
  const { user } = useAuth()

  const [form, setForm] = useState({
    subject:  '',
    category: '',
    priority: 'medium',
    message:  '',
  })
  const [consent,     setConsent]     = useState(false)
  const [file,        setFile]        = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState('')
  const [complaints,  setComplaints]  = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const fileRef = useRef(null)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  // ── Load existing complaints ────────────────────────────────────────────────
  const loadComplaints = async () => {
    try {
      const data = await getMyComplaints()
      setComplaints(data.complaints ?? [])
    } catch { /* silent */ }
    finally { setLoadingList(false) }
  }

  useEffect(() => { loadComplaints() }, [])

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!form.subject || !form.category || !form.message) {
      setError('Please fill in all required fields.')
      return
    }
    if (!consent) {
      setError('Please give your consent to be contacted.')
      return
    }
    try {
      setLoading(true)
      const payload = new FormData()
      payload.append('subject',  form.subject)
      payload.append('category', form.category)
      payload.append('priority', form.priority)
      payload.append('message',  form.message)
      if (file) payload.append('attachment', file)

      await createComplaint(payload)
      setForm({ subject: '', category: '', priority: 'medium', message: '' })
      setConsent(false)
      setFile(null),
      setSuccess('Your complaint has been submitted. We\'ll get back to you within 24–48 hours.')
      loadComplaints()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit complaint. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#101622] transition-colors duration-300 -mt-8 -mx-6 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex flex-wrap gap-2 mb-6 text-sm font-medium">
          <a href="/"          className="text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors">Home</a>
          <span className="text-slate-400">/</span>
          <a href="/resources" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors">Help Center</a>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 dark:text-slate-50">Submit a Complaint</span>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Submit a Complaint or Feedback
          </h1>
          <p className="mt-2 text-base text-slate-500 dark:text-slate-400 max-w-2xl">
            We value your input. Please fill out the form below and we'll get back to you within 24–48 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Form ─────────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 bg-white dark:bg-[#182234] rounded-xl border border-slate-200 dark:border-slate-700 p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">

              {/* Success */}
              {success && (
                <div className="rounded-lg px-4 py-3 text-sm font-medium bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 animate-fade-in">
                  {success}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-lg px-4 py-3 text-sm font-medium bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 animate-fade-in">
                  {error}
                </div>
              )}

              {/* Name + Email — pre-filled from auth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Full Name">
                  <input
                    type="text" className={inputCls}
                    placeholder="John Doe"
                    defaultValue={user?.name ?? ''}
                    readOnly={!!user?.name}
                  />
                </Field>
                <Field label="Email Address">
                  <input
                    type="email" className={inputCls}
                    placeholder="you@example.com"
                    defaultValue={user?.email ?? ''}
                    readOnly={!!user?.email}
                  />
                </Field>
              </div>

              {/* Subject + Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Subject *">
                  <input
                    type="text" className={inputCls}
                    placeholder="Briefly describe your issue"
                    value={form.subject} onChange={set('subject')}
                  />
                </Field>
                <Field label="Complaint Category *">
                  <select className={selectCls} value={form.category} onChange={set('category')}>
                    <option value="" disabled>Select a category</option>
                    <option value="technical">Technical Issue</option>
                    <option value="payment">Payment</option>
                    <option value="course">Course Content</option>
                    <option value="account">Account</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
              </div>

              {/* Priority */}
              <Field label="Priority">
                <select className={selectCls} value={form.priority} onChange={set('priority')}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </Field>

              {/* Message */}
              <Field label="Detailed Description *">
                <textarea
                  className={textareaCls} rows={6}
                  placeholder="Please provide as much detail as possible..."
                  value={form.message} onChange={set('message')}
                />
              </Field>

              {/* File upload */}
              <Field label="Attachments (Optional)">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer bg-slate-50 dark:bg-[#101622] hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-colors"
                >
                  <UploadIcon />
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {file
                      ? <span className="font-semibold text-blue-600">{file.name}</span>
                      : <><span className="font-semibold">Click to upload</span> or drag and drop</>
                    }
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">PNG, JPG, or PDF (MAX. 5MB)</p>
                  <input
                    ref={fileRef} type="file" className="hidden"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </Field>

              {/* Consent */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox" checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-blue-600 flex-shrink-0"
                />
                <div className="text-sm">
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    I consent to be contacted regarding this submission.
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    We will use your email to follow up on your feedback.
                  </p>
                </div>
              </label>

              {/* Actions */}
              <div className="flex justify-end items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setForm({ subject: '', category: '', priority: 'medium', message: '' })
                    setConsent(false)
                    setFile(null)
                    setError('')
                    setSuccess('')
                  }}
                  className="h-12 px-6 rounded-lg text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors shadow-md shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? <><SpinnerIcon /> Submitting…</> : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-6">

            {/* Need help faster */}
            <div className="bg-white dark:bg-[#182234] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Need Help Faster?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                For immediate assistance, please use one of the options below. Our support team is available 24/7.
              </p>
              <div className="space-y-3">
                {[
                  { icon: <FaqIcon />,  title: 'Read Our FAQs',  desc: 'Find answers to common questions.',    href: '#' },
                  { icon: <ChatIcon />, title: 'Live Chat',       desc: 'Connect with a support agent now.',   href: '#' },
                  { icon: <PhoneIcon />,title: 'Call Us',         desc: '+1 (555) 123-4567',                   href: 'tel:+15551234567' },
                ].map(({ icon, title, desc, href }) => (
                  <a
                    key={title} href={href}
                    className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-[#101622] hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                  >
                    <span className="text-blue-600 dark:text-blue-400 flex-shrink-0">{icon}</span>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                    </div>
                  </a>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-2">Data Privacy</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your information is safe with us. We will only use the data provided to address your complaint.
                  Read our full <a href="#" className="text-blue-600 font-medium hover:underline">privacy policy</a>.
                </p>
              </div>
            </div>

            {/* My complaints list */}
            <div className="bg-white dark:bg-[#182234] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">My Complaints</h3>
              {loadingList ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 animate-pulse space-y-2">
                      <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
                      <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
                    </div>
                  ))}
                </div>
              ) : complaints.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500">No complaints submitted yet.</p>
              ) : (
                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                  {complaints.map((item) => (
                    <div key={item._id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 leading-snug">{item.subject}</h4>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 dark:text-slate-500 capitalize">{item.category}</span>
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <PriorityBadge priority={item.priority} />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{item.message}</p>
                      {item.adminReply && (
                        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3 text-xs text-emerald-800 dark:text-emerald-400 leading-relaxed">
                          <span className="font-semibold">Admin reply: </span>{item.adminReply}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}