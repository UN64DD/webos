import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { Notification } from '../types'

interface NotificationStore {
  notifications: Notification[]
  create: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  dismiss: (id: string) => void
  clearAll: () => void
  markRead: (id: string) => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  create: (n) => {
    const notification: Notification = {
      ...n,
      id: nanoid(),
      timestamp: Date.now(),
      read: false,
    }
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
    }))
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((not) => not.id !== notification.id),
      }))
    }, 5000)
  },

  dismiss: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),

  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
}))
