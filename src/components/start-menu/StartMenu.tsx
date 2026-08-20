import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, Power, Settings } from 'lucide-react'
import { applicationRegistry } from '../../core/applications/registry'
import { os } from '../../core/os/api'

interface StartMenuProps {
  onClose: () => void
}

export function StartMenu({ onClose }: StartMenuProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const allApps = useMemo(() => applicationRegistry.getAll(), [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const filteredApps = useMemo(() => {
    if (!query.trim()) return allApps
    const lower = query.toLowerCase()
    return allApps.filter((app) => app.name.toLowerCase().includes(lower))
  }, [query, allApps])

  const handleAppClick = (appId: string) => {
    os.windows.open(appId)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-[1001]" onClick={onClose} />
      <div className="absolute bottom-12 left-0 w-80 bg-os-surface border border-os-border rounded-t-xl shadow-2xl z-[1002] animate-slide-up overflow-hidden">
        {/* Search */}
        <div className="p-3 border-b border-os-border">
          <div className="flex items-center gap-2 px-3 py-2 bg-os-bg border border-os-border rounded-lg focus-within:border-os-accent transition-colors">
            <Search size={16} className="text-os-text-muted" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search apps..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-os-text outline-none"
            />
          </div>
        </div>

        {/* App list */}
        <div className="max-h-[320px] overflow-auto py-1">
          {filteredApps.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-os-text-muted">
              No applications found
            </div>
          ) : (
            filteredApps.map((app) => (
              <button
                key={app.id}
                onClick={() => handleAppClick(app.id)}
                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-os-surface-hover transition-colors text-left"
              >
                <div className="w-8 h-8 flex items-center justify-center text-os-text-secondary">
                  {app.icon}
                </div>
                <span className="text-sm">{app.name}</span>
              </button>
            ))
          )}
        </div>

        {/* Bottom actions */}
        <div className="border-t border-os-border p-2 flex items-center gap-1">
          <button
            onClick={() => {
              os.windows.open('settings')
              onClose()
            }}
            className="flex items-center gap-2 px-3 py-2 rounded text-sm text-os-text-secondary hover:bg-os-surface-hover flex-1"
          >
            <Settings size={16} />
            Settings
          </button>
          <button
            onClick={() => {
              os.notifications.create({
                title: 'Power',
                message: 'WebOS is a browser application. Close the tab to shut down.',
                type: 'info',
              })
              onClose()
            }}
            className="flex items-center gap-2 px-3 py-2 rounded text-sm text-os-text-secondary hover:bg-os-surface-hover"
          >
            <Power size={16} />
          </button>
        </div>
      </div>
    </>
  )
}
