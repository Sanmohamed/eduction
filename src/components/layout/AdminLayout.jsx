import { Link, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Admin</h2>
          <div className="space-y-2 text-sm">
            <Link className="block rounded-lg px-3 py-2 hover:bg-slate-100" to="/admin">Overview</Link>
            <Link className="block rounded-lg px-3 py-2 hover:bg-slate-100" to="/admin/users">Users</Link>
            <Link className="block rounded-lg px-3 py-2 hover:bg-slate-100" to="/admin/courses">Courses</Link>
            <Link className="block rounded-lg px-3 py-2 hover:bg-slate-100" to="/admin/payments">Payments</Link>
          </div>
        </aside>
        <section><Outlet /></section>
      </div>
    </div>
  )
}
