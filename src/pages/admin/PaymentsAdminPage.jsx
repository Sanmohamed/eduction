import { useEffect, useState } from 'react'
import { getAdminPayments } from '../../../backend/service api/admin.service'

function SummaryCard({ title, value, subtitle }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {value}
            </h2>
            {subtitle && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
            )}
        </div>
    )
}

function StatusBadge({ status }) {
    const styles =
        status === 'paid'
            ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
            : status === 'pending'
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'

    return (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
            {status}
        </span>
    )
}

export default function PaymentsAdminPage() {
    const [orders, setOrders] = useState([])
    const [summary, setSummary] = useState({
        totalRevenue: 0,
        totalPaidOrders: 0,
        averageOrderValue: 0,
        statusBreakdown: [],
    })

    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')
    const [sort, setSort] = useState('newest')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const loadPayments = async ({
        searchValue = '',
        statusValue = '',
        sortValue = 'newest',
    } = {}) => {
        try {
            setLoading(true)
            setError('')

            const res = await getAdminPayments({
                page: 1,
                limit: 20,
                search: searchValue,
                status: statusValue,
                sort: sortValue,
            })

            setOrders(res?.orders || [])
            setSummary(
                res?.summary || {
                    totalRevenue: 0,
                    totalPaidOrders: 0,
                    averageOrderValue: 0,
                    statusBreakdown: [],
                }
            )
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load payments')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPayments()
    }, [])

    const handleFilter = async (e) => {
        e.preventDefault()
        loadPayments({
            searchValue: search,
            statusValue: status,
            sortValue: sort,
        })
    }

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                    Payments & Revenue
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Search transactions, filter by status, sort results, and track platform revenue.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard
                    title="Total Revenue"
                    value={`$${Number(summary.totalRevenue || 0).toLocaleString()}`}
                    subtitle="From paid orders"
                />
                <SummaryCard
                    title="Paid Orders"
                    value={Number(summary.totalPaidOrders || 0).toLocaleString()}
                    subtitle="Successful payments"
                />
                <SummaryCard
                    title="Average Order"
                    value={`$${Number(summary.averageOrderValue || 0).toLocaleString()}`}
                    subtitle="Average paid order value"
                />
            </div>

            {!!summary.statusBreakdown?.length && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
                        Status Breakdown
                    </h2>

                    <div className="grid gap-4 md:grid-cols-3">
                        {summary.statusBreakdown.map((item) => (
                            <div
                                key={item._id}
                                className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                            >
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {item._id || 'unknown'}
                                </p>
                                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                                    {item.count}
                                </p>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                    ${Number(item.amount || 0).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleFilter} className="grid gap-3 md:grid-cols-[1fr_180px_180px_120px]">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by user, email, course, amount, status, or order ID"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                />

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                >
                    <option value="">All statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                </select>

                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="amountDesc">Highest amount</option>
                    <option value="amountAsc">Lowest amount</option>
                    <option value="status">Status</option>
                </select>

                <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                    Filter
                </button>
            </form>

            {loading ? (
                <div>Loading payments...</div>
            ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                    {error}
                </div>
            ) : (
                <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                                <th className="px-4 py-4 font-semibold text-slate-500">Order ID</th>
                                <th className="px-4 py-4 font-semibold text-slate-500">User</th>
                                <th className="px-4 py-4 font-semibold text-slate-500">Courses</th>
                                <th className="px-4 py-4 font-semibold text-slate-500">Amount</th>
                                <th className="px-4 py-4 font-semibold text-slate-500">Status</th>
                                <th className="px-4 py-4 font-semibold text-slate-500">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id} className="border-b border-slate-100 dark:border-slate-800">
                                    <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
                                        {order._id}
                                    </td>

                                    <td className="px-4 py-4">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {order.user?.name || 'Unknown User'}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {order.user?.email || 'No email'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                                        <div className="space-y-1">
                                            {(order.courses || []).map((course) => (
                                                <p key={course._id}>{course.title}</p>
                                            ))}
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">
                                        ${Number(order.amount || 0).toLocaleString()}
                                    </td>

                                    <td className="px-4 py-4">
                                        <StatusBadge status={order.status} />
                                    </td>

                                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!orders.length && (
                        <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                            No payments found.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}