import { useState } from 'react'
import {
  Palette,
  Monitor,
  HardDrive,
  Info,
  Trash2,
  Sun,
  Moon,
  Check,
} from 'lucide-react'
import { os } from '../../core/os/api'
import { useSettingsStore } from '../../stores/settingsStore'
import { WALLPAPERS } from '../../core/os/wallpapers'

type SettingsTab = 'appearance' | 'system' | 'storage'

export function SettingsApp(props: { windowId: string }) {
  void props.windowId
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance')
  const { theme, wallpaper, setTheme, setWallpaper } = useSettingsStore()
  const [storageInfo, setStorageInfo] = useState<{ used: number; total: number } | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const loadStorage = async () => {
    const info = await os.filesystem.getStorageUsage()
    setStorageInfo(info)
  }

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    await os.filesystem.initializeFilesystem()
    setTheme('dark')
    setWallpaper(WALLPAPERS[0])
    setConfirmReset(false)
    os.notifications.create({
      title: 'WebOS reset',
      message: 'All data has been cleared and default settings restored.',
      type: 'info',
    })
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
    { id: 'system', label: 'System', icon: <Monitor size={16} /> },
    { id: 'storage', label: 'Storage', icon: <HardDrive size={16} /> },
  ]

  return (
    <div className="flex h-full bg-os-bg">
      {/* Sidebar */}
      <div className="w-48 border-r border-os-border bg-os-surface p-2 space-y-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              if (tab.id === 'storage') loadStorage()
            }}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-os-accent-dim text-os-accent'
                : 'text-os-text-secondary hover:bg-os-surface-hover'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'appearance' && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h3 className="text-sm font-medium text-os-text mb-3">Theme</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded border text-sm transition-colors ${
                    theme === 'dark'
                      ? 'border-os-accent bg-os-accent-dim text-os-accent'
                      : 'border-os-border hover:bg-os-surface-hover'
                  }`}
                >
                  <Moon size={16} />
                  Dark
                  {theme === 'dark' && <Check size={14} />}
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded border text-sm transition-colors ${
                    theme === 'light'
                      ? 'border-os-accent bg-os-accent-dim text-os-accent'
                      : 'border-os-border hover:bg-os-surface-hover'
                  }`}
                >
                  <Sun size={16} />
                  Light
                  {theme === 'light' && <Check size={14} />}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-os-text mb-3">Wallpaper</h3>
              <div className="grid grid-cols-3 gap-2">
                {WALLPAPERS.map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => setWallpaper(wp)}
                    className={`relative h-20 rounded-lg border-2 overflow-hidden transition-all ${
                      wallpaper.id === wp.id
                        ? 'border-os-accent ring-2 ring-os-accent/30'
                        : 'border-os-border hover:border-os-border-light'
                    }`}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background: wp.type === 'gradient' ? wp.value : wp.value,
                      }}
                    />
                    {wallpaper.id === wp.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Check size={18} className="text-white" />
                      </div>
                    )}
                    <span className="absolute bottom-0 inset-x-0 text-[10px] text-center py-0.5 bg-black/50 text-white/80">
                      {wp.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h3 className="text-sm font-medium text-os-text mb-3 flex items-center gap-2">
                <Info size={16} /> About WebOS
              </h3>
              <div className="bg-os-surface rounded-lg p-4 border border-os-border space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-os-text-secondary">Name</span>
                  <span>WebOS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-os-text-secondary">Version</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-os-text-secondary">Runtime</span>
                  <span>Browser (IndexedDB)</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-os-text mb-3 flex items-center gap-2">
                <Trash2 size={16} /> Reset WebOS
              </h3>
              <p className="text-sm text-os-text-secondary mb-3">
                This will clear all files, settings, and restore default configuration.
              </p>
              <button
                onClick={handleReset}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  confirmReset
                    ? 'bg-os-error text-white hover:bg-red-600'
                    : 'bg-os-surface border border-os-border hover:bg-os-surface-hover text-os-text-secondary'
                }`}
              >
                {confirmReset ? 'Click again to confirm reset' : 'Reset WebOS'}
              </button>
              {confirmReset && (
                <button
                  onClick={() => setConfirmReset(false)}
                  className="ml-2 px-4 py-2 rounded text-sm text-os-text-secondary hover:bg-os-surface-hover"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="space-y-6 max-w-lg">
            <h3 className="text-sm font-medium text-os-text mb-3 flex items-center gap-2">
              <HardDrive size={16} /> Storage Usage
            </h3>
            {storageInfo ? (
              <div className="bg-os-surface rounded-lg p-4 border border-os-border space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-os-text-secondary">Used</span>
                  <span>{formatBytes(storageInfo.used)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-os-text-secondary">Available</span>
                  <span>{formatBytes(storageInfo.total)}</span>
                </div>
                <div className="w-full h-2 bg-os-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-os-accent rounded-full transition-all"
                    style={{
                      width: `${storageInfo.total ? (storageInfo.used / storageInfo.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={loadStorage}
                className="px-4 py-2 bg-os-surface border border-os-border rounded text-sm hover:bg-os-surface-hover"
              >
                Check storage
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
