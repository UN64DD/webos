import { useState, useEffect, useCallback } from 'react'
import { useWindowStore } from '../../stores/windowStore'
import { useDesktopStore } from '../../stores/desktopStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { applicationRegistry } from '../../core/applications/registry'
import { Window } from '../window/Window'
import { DesktopIcon } from './DesktopIcon'
import { Taskbar } from '../taskbar/Taskbar'
import { StartMenu } from '../start-menu/StartMenu'
import { NotificationToast } from '../notifications/NotificationToast'

export function Desktop() {
  const windows = useWindowStore((s) => s.windows)
  const icons = useDesktopStore((s) => s.icons)
  const wallpaper = useSettingsStore((s) => s.wallpaper)
  const [startMenuOpen, setStartMenuOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setStartMenuOpen(false)
        setContextMenu(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleDesktopClick = useCallback(() => {
    setStartMenuOpen(false)
    setContextMenu(null)
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  const handleRefresh = useCallback(() => {
    setContextMenu(null)
    window.location.reload()
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Wallpaper */}
      <div
        className="absolute inset-0"
        style={{
          background: wallpaper.type === 'gradient' ? wallpaper.value : wallpaper.value,
        }}
      />

      {/* Desktop area */}
      <div
        className="absolute inset-0 bottom-12"
        onClick={handleDesktopClick}
        onContextMenu={handleContextMenu}
      >
        {/* Desktop icons */}
        {icons.map((icon) => {
          const app = applicationRegistry.get(icon.appId)
          if (!app) return null
          return (
            <DesktopIcon
              key={icon.id}
              icon={icon}
              app={app}
            />
          )
        })}

        {/* Windows */}
        {windows.map((win) => {
          const app = applicationRegistry.get(win.appId)
          if (!app) return null
          const AppComponent = app.component
          return (
            <Window key={win.id} window={win}>
              <AppComponent windowId={win.id} />
            </Window>
          )
        })}
      </div>

      {/* Taskbar */}
      <Taskbar
        startMenuOpen={startMenuOpen}
        onToggleStartMenu={() => setStartMenuOpen(!startMenuOpen)}
      />

      {/* Start Menu */}
      {startMenuOpen && (
        <StartMenu onClose={() => setStartMenuOpen(false)} />
      )}

      {/* Notifications */}
      <NotificationToast />

      {/* Desktop context menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setContextMenu(null)} />
          <div
            className="fixed z-[9999] bg-os-surface border border-os-border rounded-lg shadow-xl py-1 min-w-[160px] animate-fade-in"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={handleRefresh}
              className="w-full px-3 py-1.5 text-sm text-left hover:bg-os-surface-hover"
            >
              Refresh
            </button>
            <div className="h-px bg-os-border my-1" />
            <button
              onClick={() => {
                setContextMenu(null)
              }}
              className="w-full px-3 py-1.5 text-sm text-left hover:bg-os-surface-hover text-os-text-secondary"
            >
              Settings
            </button>
          </div>
        </>
      )}
    </div>
  )
}
