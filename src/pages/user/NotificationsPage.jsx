import { Link } from 'react-router-dom'
import { useNotifications } from '../../context/NotificationContext'

function formatDate(dateValue) {
  if (!dateValue) return ''
  try {
    return new Date(dateValue).toLocaleString()
  } catch {
    return ''
  }
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-500 dark:text-slate-400"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>

      <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
        No notifications yet
      </h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Course, payment, and system updates will appear here.
      </p>
    </div>
  )
}

function NotificationCard({ item, onRead }) {
  const createdAt = formatDate(item?.createdAt)

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-200 ${item.isRead
          ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
          : 'border-blue-200 bg-blue-50/70 dark:border-blue-500/20 dark:bg-blue-500/10'
        }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
              {item.title}
            </h2>

            {!item.isRead && (
              <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500" />
            )}
          </div>

          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {item.message}
          </p>

          {createdAt && (
            <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
              {createdAt}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          {item.actionUrl && (
            <Link
              to={item.actionUrl}
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Open
            </Link>
          )}

          {!item.isRead && (
            <button
              onClick={() => onRead(item._id)}
              className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Mark read
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const { notifications, unread, markAsRead, markAll } = useNotifications()

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {notifications.length > 0
                ? unread > 0
                  ? `${unread} unread notification${unread > 1 ? 's' : ''}`
                  : 'All notifications are read'
                : 'You have no notifications yet'}
            </p>
          </div>

          {notifications.length > 0 && unread > 0 && (
            <button
              onClick={markAll}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <NotificationCard
              key={item._id}
              item={item}
              onRead={markAsRead}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}