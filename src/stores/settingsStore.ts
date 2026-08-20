import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WallpaperOption } from '../types'
import { WALLPAPERS } from '../core/os/wallpapers'

interface SettingsStore {
  theme: 'dark' | 'light'
  wallpaper: WallpaperOption
  setTheme: (theme: 'dark' | 'light') => void
  setWallpaper: (wallpaper: WallpaperOption) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      wallpaper: WALLPAPERS[0],
      setTheme: (theme) => set({ theme }),
      setWallpaper: (wallpaper) => set({ wallpaper }),
    }),
    { name: 'webos-settings' }
  )
)
