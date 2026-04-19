import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const { register } = useAuth()
  const navigate = useNavigate()
  const submit = async (e) => { e.preventDefault(); await register(form); navigate('/student') }
  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-3xl font-bold">Create Account</h1>
      <form onSubmit={submit} className="space-y-4">
        <input className="w-full rounded-xl border p-3" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="w-full rounded-xl border p-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" className="w-full rounded-xl border p-3" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className="w-full rounded-xl border p-3" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="student">Student</option><option value="instructor">Instructor</option></select>
        <button className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white">Register</button>
      </form>
    </div>
  )
}
