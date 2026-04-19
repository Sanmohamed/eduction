import { useEffect, useState } from 'react'
import { createComplaint, getMyComplaints } from '../../../backend/services/complaint.service'

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [form, setForm] = useState({ subject: '', category: 'other', priority: 'medium', message: '' })

  const loadData = async () => {
    const res = await getMyComplaints()
    setComplaints(res.complaints || [])
  }

  useEffect(() => { loadData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await createComplaint(form)
    setForm({ subject: '', category: 'other', priority: 'medium', message: '' })
    loadData()
    alert('Complaint submitted successfully')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900">Submit a Complaint or Feedback</h1>
        <p className="mt-2 text-slate-600">Tell us what happened and we will review it.</p>
        <div className="mt-6 space-y-4">
          <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <div className="grid gap-4 md:grid-cols-2">
            <select className="rounded-2xl border border-slate-200 px-4 py-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="technical">Technical</option>
              <option value="payment">Payment</option>
              <option value="course">Course</option>
              <option value="account">Account</option>
              <option value="feedback">Feedback</option>
              <option value="other">Other</option>
            </select>
            <select className="rounded-2xl border border-slate-200 px-4 py-3" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <textarea className="min-h-44 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Describe your issue" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <button className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white">Send complaint</button>
        </div>
      </form>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">My complaints</h2>
        <div className="mt-4 space-y-4">
          {complaints.map((item) => (
            <div key={item._id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-slate-900">{item.subject}</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{item.message}</p>
              {item.adminReply && <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Reply: {item.adminReply}</p>}
            </div>
          ))}
          {!complaints.length && <p className="text-slate-500">No complaints yet.</p>}
        </div>
      </div>
    </div>
  )
}
