import { nanoid } from 'nanoid'
import { useWindowStore } from '../../stores/windowStore'
import type { WindowState } from '../../types'
import { applicationRegistry } from '../applications/registry'

const DESKTOP_PADDING = 10
const TASKBAR_HEIGHT = 48
const GRID_SIZE = 50

function getInitialPosition(width: number, height: number): { x: number; y: number } {
  const maxX = window.innerWidth - width - DESKTOP_PADDING
  const maxY = window.innerHeight - height - TASKBAR_HEIGHT - DESKTOP_PADDING
  const offset = (useWindowStore.getState().windows.length % 8) * GRID_SIZE
  return {
    x: Math.max(DESKTOP_PADDING, Math.min(offset + 80, maxX)),
    y: Math.max(DESKTOP_PADDING, Math.min(offset + 40, maxY)),
  }
}

function open(appId: string, options?: { title?: string; path?: string }): string | null {
  const app = applicationRegistry.get(appId)
  if (!app) return null

  const existing = useWindowStore
    .getState()
    .windows.find((w) => w.appId === appId && !w.isMinimized)

  if (existing) {
    useWindowStore.getState().focusWindow(existing.id)
    return existing.id
  }

  const minimized = useWindowStore
    .getState()
    .windows.find((w) => w.appId === appId && w.isMinimized)

  if (minimized) {
    useWindowStore.getState().restoreWindow(minimized.id)
    useWindowStore.getState().focusWindow(minimized.id)
    return minimized.id
  }

  const pos = getInitialPosition(app.defaultWidth, app.defaultHeight)
  const windowState: WindowState = {
    id: nanoid(),
    appId,
    title: options?.title ?? app.name,
    icon: app.icon,
    x: pos.x,
    y: pos.y,
    width: app.defaultWidth,
    height: app.defaultHeight,
    zIndex: 100,
    isMinimized: false,
    isMaximized: false,
    isFocused: true,
    minWidth: app.minWidth,
    minHeight: app.minHeight,
  }

  useWindowStore.getState().openWindow(windowState)
  return windowState.id
}

function close(windowId: string): void {
  useWindowStore.getState().closeWindow(windowId)
}

function minimize(windowId: string): void {
  useWindowStore.getState().minimizeWindow(windowId)
}

function maximize(windowId: string): void {
  useWindowStore.getState().maximizeWindow(windowId)
}

function focus(windowId: string): void {
  const state = useWindowStore.getState()
  if (state.windows.find((w) => w.id === windowId)?.isMinimized) {
    state.restoreWindow(windowId)
  }
  state.focusWindow(windowId)
}

function getWindows(): WindowState[] {
  return useWindowStore.getState().windows
}

function getFocusedWindow(): WindowState | null {
  return useWindowStore.getState().windows.find((w) => w.isFocused) ?? null
}

function updateWindowTitle(windowId: string, title: string): void {
  useWindowStore.getState().updateWindowTitle(windowId, title)
}

export const windowManagerService = {
  open,
  close,
  minimize,
  maximize,
  focus,
  getWindows,
  getFocusedWindow,
  updateWindowTitle,
}
