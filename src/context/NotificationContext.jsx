import { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../../backend/service api/notification.service'
import { useAuth } from './AuthContext'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const { user } = useAuth()

  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [toast, setToast] = useState(null)

  const intervalRef = useRef(null)
  const loadingRef = useRef(false)
  const prevIdsRef = useRef([])

  const showToast = (notification) => {
    setToast(notification)
    window.clearTimeout(showToast._timer)
    showToast._timer = window.setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  const dismissToast = () => setToast(null)

  const loadNotifications = async ({ silent = false } = {}) => {
    if (!user?._id || loadingRef.current) return

    loadingRef.current = true

    try {
      const data = await getMyNotifications()

      const sortedNotifications = [...(data.notifications || [])].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      )

      if (!silent && prevIdsRef.current.length > 0) {
        const newItems = sortedNotifications.filter(
          (n) => !prevIdsRef.current.includes(n._id)
        )

        if (newItems.length > 0) {
          showToast(newItems[0])
        }
      }

      prevIdsRef.current = sortedNotifications.map((n) => n._id)

      setNotifications((prev) => {
        const prevSerialized = JSON.stringify(prev)
        const nextSerialized = JSON.stringify(sortedNotifications)
        return prevSerialized === nextSerialized ? prev : sortedNotifications
      })

      setUnread((prev) => {
        const nextUnread = data.unreadCount || 0
        return prev === nextUnread ? prev : nextUnread
      })
    } catch {
      setNotifications([])
      setUnread(0)
    } finally {
      loadingRef.current = false
    }
  }

  const markAsRead = async (id) => {
    const target = notifications.find((n) => n._id === id)
    if (!target || target.isRead) return

    const previousNotifications = notifications
    const previousUnread = unread

    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      )
    )
    setUnread((prev) => Math.max(prev - 1, 0))

    try {
      await markNotificationRead(id)
    } catch {
      setNotifications(previousNotifications)
      setUnread(previousUnread)
    }
  }

  const markAll = async () => {
    const hasUnread = notifications.some((n) => !n.isRead)
    if (!hasUnread) return

    const previousNotifications = notifications
    const previousUnread = unread

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    )
    setUnread(0)

    try {
      await markAllNotificationsRead()
    } catch {
      setNotifications(previousNotifications)
      setUnread(previousUnread)
    }
  }

  useEffect(() => {
    if (user?._id) {
      loadNotifications({ silent: true })
    } else {
      setNotifications([])
      setUnread(0)
      setToast(null)
      prevIdsRef.current = []
    }
  }, [user?._id])

  useEffect(() => {
    if (!user?._id) return

    const start = () => {
      if (intervalRef.current) return
      const delay = unread > 0 ? 15000 : 30000
      intervalRef.current = setInterval(() => {
        loadNotifications()
      }, delay)
    }

    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    const handleVisibility = () => {
      if (document.hidden) {
        stop()
      } else {
        loadNotifications()
        start()
      }
    }

    stop()
    start()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [user?._id, unread])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unread,
        toast,
        dismissToast,
        loadNotifications,
        markAsRead,
        markAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)