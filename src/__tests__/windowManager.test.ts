import { describe, it, expect, beforeEach } from 'vitest'
import { useWindowStore } from '../stores/windowStore'

beforeEach(() => {
  useWindowStore.setState({ windows: [], nextZIndex: 100 })
})

describe('Window Manager', () => {
  const createTestWindow = (overrides?: { id?: string; appId?: string }) => ({
    id: overrides?.id ?? 'test-window',
    appId: overrides?.appId ?? 'test-app',
    title: 'Test Window',
    icon: null,
    x: 100,
    y: 100,
    width: 600,
    height: 400,
    zIndex: 100,
    isMinimized: false,
    isMaximized: false,
    isFocused: false,
  })

  it('opens a window', () => {
    useWindowStore.getState().openWindow(createTestWindow())
    const windows = useWindowStore.getState().windows
    expect(windows.length).toBe(1)
    expect(windows[0].appId).toBe('test-app')
    expect(windows[0].isFocused).toBe(true)
  })

  it('closes a window', () => {
    useWindowStore.getState().openWindow(createTestWindow())
    useWindowStore.getState().closeWindow('test-window')
    expect(useWindowStore.getState().windows.length).toBe(0)
  })

  it('minimizes a window', () => {
    useWindowStore.getState().openWindow(createTestWindow())
    useWindowStore.getState().minimizeWindow('test-window')
    const win = useWindowStore.getState().windows[0]
    expect(win.isMinimized).toBe(true)
    expect(win.isFocused).toBe(false)
  })

  it('maximizes a window', () => {
    useWindowStore.getState().openWindow(createTestWindow())
    useWindowStore.getState().maximizeWindow('test-window')
    expect(useWindowStore.getState().windows[0].isMaximized).toBe(true)
  })

  it('focuses a window and updates z-index', () => {
    useWindowStore.getState().openWindow(createTestWindow({ id: 'w1', appId: 'app1' }))
    useWindowStore.getState().openWindow(createTestWindow({ id: 'w2', appId: 'app2' }))

    useWindowStore.getState().focusWindow('w1')
    const w1 = useWindowStore.getState().windows.find((w) => w.id === 'w1')
    const w2 = useWindowStore.getState().windows.find((w) => w.id === 'w2')
    expect(w1!.isFocused).toBe(true)
    expect(w2!.isFocused).toBe(false)
    expect(w1!.zIndex).toBeGreaterThan(w2!.zIndex)
  })

  it('updates window position', () => {
    useWindowStore.getState().openWindow(createTestWindow())
    useWindowStore.getState().updateWindowPosition('test-window', 200, 300)
    const win = useWindowStore.getState().windows[0]
    expect(win.x).toBe(200)
    expect(win.y).toBe(300)
  })

  it('updates window size', () => {
    useWindowStore.getState().openWindow(createTestWindow())
    useWindowStore.getState().updateWindowSize('test-window', 800, 600)
    const win = useWindowStore.getState().windows[0]
    expect(win.width).toBe(800)
    expect(win.height).toBe(600)
  })

  it('restores minimized window on focus', () => {
    useWindowStore.getState().openWindow(createTestWindow())
    useWindowStore.getState().minimizeWindow('test-window')
    expect(useWindowStore.getState().windows[0].isMinimized).toBe(true)
    useWindowStore.getState().focusWindow('test-window')
    expect(useWindowStore.getState().windows[0].isFocused).toBe(true)
  })

  it('handles multiple windows with proper focus', () => {
    useWindowStore.getState().openWindow(createTestWindow({ id: 'w1', appId: 'app1' }))
    useWindowStore.getState().openWindow(createTestWindow({ id: 'w2', appId: 'app2' }))
    useWindowStore.getState().openWindow(createTestWindow({ id: 'w3', appId: 'app3' }))

    useWindowStore.getState().focusWindow('w1')
    const focused = useWindowStore.getState().windows.find((w) => w.isFocused)
    expect(focused!.id).toBe('w1')
  })

  it('removes all windows of an app when closed', () => {
    useWindowStore.getState().openWindow(createTestWindow({ id: 'w1', appId: 'app1' }))
    useWindowStore.getState().openWindow(createTestWindow({ id: 'w2', appId: 'app2' }))
    useWindowStore.getState().closeWindow('w1')
    expect(useWindowStore.getState().windows.length).toBe(1)
    expect(useWindowStore.getState().windows[0].id).toBe('w2')
  })
})
