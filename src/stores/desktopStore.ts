import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DesktopIcon } from '../types'

interface DesktopStore {
  icons: DesktopIcon[]
  setIcons: (icons: DesktopIcon[]) => void
  updateIconPosition: (id: string, x: number, y: number) => void
}

export const useDesktopStore = create<DesktopStore>()(
  persist(
    (set) => ({
      icons: [
        { id: 'icon-files', appId: 'file-manager', x: 32, y: 32 },
        { id: 'icon-terminal', appId: 'terminal', x: 32, y: 128 },
        { id: 'icon-text-editor', appId: 'text-editor', x: 32, y: 224 },
        { id: 'icon-browser', appId: 'browser', x: 32, y: 320 },
        { id: 'icon-settings', appId: 'settings', x: 32, y: 416 },
      ],
      setIcons: (icons) => set({ icons }),
      updateIconPosition: (id, x, y) =>
        set((state) => ({
          icons: state.icons.map((icon) =>
            icon.id === id ? { ...icon, x, y } : icon
          ),
        })),
    }),
    { name: 'webos-desktop' }
  )
)
