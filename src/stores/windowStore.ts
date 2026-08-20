import { create } from 'zustand'
import type { WindowState } from '../types'

interface WindowStore {
  windows: WindowState[]
  nextZIndex: number
  openWindow: (window: WindowState) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  focusWindow: (id: string) => void
  updateWindowPosition: (id: string, x: number, y: number) => void
  updateWindowSize: (id: string, width: number, height: number) => void
  updateWindowTitle: (id: string, title: string) => void
}

export const useWindowStore = create<WindowStore>((set) => ({
  windows: [],
  nextZIndex: 100,

  openWindow: (window) =>
    set((state) => ({
      windows: [
        ...state.windows.map((w) => ({ ...w, isFocused: false })),
        { ...window, zIndex: state.nextZIndex, isFocused: true },
      ],
      nextZIndex: state.nextZIndex + 1,
    })),

  closeWindow: (id) =>
    set((state) => {
      const remaining = state.windows.filter((w) => w.id !== id)
      if (remaining.length > 0) {
        const topWindow = remaining.reduce((top, w) =>
          w.zIndex > top.zIndex && !w.isMinimized ? w : top
        )
        return {
          windows: remaining.map((w) => ({
            ...w,
            isFocused: w.id === topWindow.id,
          })),
        }
      }
      return { windows: remaining }
    }),

  minimizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true, isFocused: false } : w
      ),
    })),

  maximizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      ),
    })),

  restoreWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: false } : w
      ),
    })),

  focusWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) => ({
        ...w,
        isFocused: w.id === id,
        zIndex: w.id === id ? state.nextZIndex : w.zIndex,
      })),
      nextZIndex: state.nextZIndex + 1,
    })),

  updateWindowPosition: (id, x, y) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, x, y } : w
      ),
    })),

  updateWindowSize: (id, width, height) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, width, height } : w
      ),
    })),

  updateWindowTitle: (id, title) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, title } : w
      ),
    })),
}))
