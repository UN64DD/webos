import { filesystemService } from '../filesystem/filesystem'
import { windowManagerService } from '../window-manager/windowManager'
import { useNotificationStore } from '../../stores/notificationStore'
import { useSettingsStore } from '../../stores/settingsStore'
import type { WebOSAPI, Notification } from '../../types'
import { db } from '../../database/db'

const notificationService = {
  create: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    useNotificationStore.getState().create(n)
  },
  dismiss: (id: string) => {
    useNotificationStore.getState().dismiss(id)
  },
  clearAll: () => {
    useNotificationStore.getState().clearAll()
  },
}

const settingsService = {
  getTheme: () => useSettingsStore.getState().theme,
  setTheme: (theme: 'dark' | 'light') => useSettingsStore.getState().setTheme(theme),
  getWallpaper: () => useSettingsStore.getState().wallpaper,
  setWallpaper: (wp: { id: string; name: string; type: 'gradient' | 'solid'; value: string }) =>
    useSettingsStore.getState().setWallpaper(wp),
  resetAll: async () => {
    await db.delete()
    await db.open()
    await filesystemService.initializeFilesystem()
    useSettingsStore.getState().setTheme('dark')
  },
}

export const os: WebOSAPI = {
  filesystem: filesystemService,
  windows: windowManagerService,
  notifications: notificationService,
  settings: settingsService,
}
