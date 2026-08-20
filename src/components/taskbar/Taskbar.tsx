import { useWindowStore } from '../../stores/windowStore'
import { os } from '../../core/os/api'
import { applicationRegistry } from '../../core/applications/registry'
import {
  Wifi,
  Battery,
  BatteryCharging,
  Bell,
} from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'

interface BatteryManager {
  level: number
  charging: boolean
  addEventListener(type: string, listener: () => void): void
}

interface TaskbarProps {
  startMenuOpen: boolean
  onToggleStartMenu: () => void
}

export function Taskbar({ startMenuOpen, onToggleStartMenu }: TaskbarProps) {
  const windows = useWindowStore((s) => s.windows)
  const [time, setTime] = useState(new Date())
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [isCharging, setIsCharging] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if ('getBattery' in navigator) {
      void (navigator as unknown as { getBattery?: () => Promise<BatteryManager> })
        .getBattery?.()
        .then((battery) => {
          setBatteryLevel(Math.round(battery.level * 100))
          setIsCharging(battery.charging)
          battery.addEventListener('levelchange', () => setBatteryLevel(Math.round(battery.level * 100)))
          battery.addEventListener('chargingchange', () => setIsCharging(battery.charging))
        })
    }
  }, [])

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (d: Date) => {
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleTaskbarAppClick = (appId: string) => {
    os.windows.open(appId)
  }

  const runningApps = useMemo(() =>
    windows.reduce<{ appId: string; title: string; count: number; isFocused: boolean }[]>((acc, win) => {
      const existing = acc.find((a) => a.appId === win.appId)
      if (existing) {
        existing.count++
      } else {
        acc.push({ appId: win.appId, title: win.title, count: 1, isFocused: win.isFocused && !win.isMinimized })
      }
      return acc
    }, []),
    [windows]
  )

  const clock = useMemo(() => ({ time: formatTime(time), date: formatDate(time) }), [time])

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 glass border-t border-os-border flex items-center px-1 z-[1000]">
      {/* Start button */}
      <button
        onClick={onToggleStartMenu}
        className={`h-10 px-3 flex items-center gap-2 rounded transition-colors ${
          startMenuOpen ? 'bg-os-accent text-white' : 'hover:bg-os-surface-hover text-os-text-secondary'
        }`}
      >
        <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-os-accent to-purple-500" />
        <span className="text-xs font-medium">Start</span>
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-os-border mx-1" />

      {/* Running apps */}
      <div className="flex-1 flex items-center gap-0.5 overflow-x-auto">
        {runningApps.map((app) => {
          const appDef = applicationRegistry.get(app.appId)
          return (
            <button
              key={app.appId}
              onClick={() => handleTaskbarAppClick(app.appId)}
              className={`relative flex items-center gap-1.5 px-2.5 h-8 rounded text-xs transition-colors shrink-0 ${
                app.isFocused
                  ? 'bg-os-surface-active text-os-text'
                  : 'text-os-text-secondary hover:bg-os-surface-hover'
              }`}
            >
              <span className="shrink-0">{appDef?.icon}</span>
              <span className="truncate max-w-[100px]">{app.title}</span>
              {app.count > 1 && (
                <span className="text-[10px] bg-os-accent/20 text-os-accent px-1 rounded">
                  {app.count}
                </span>
              )}
              {app.isFocused && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-os-accent rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* System tray */}
      <div className="flex items-center gap-2 px-2 h-8">
        <Wifi size={14} className="text-os-text-secondary" />
        {batteryLevel !== null ? (
          <div className="flex items-center gap-1 text-xs text-os-text-secondary">
            {isCharging ? <BatteryCharging size={14} /> : <Battery size={14} />}
            <span>{batteryLevel}%</span>
          </div>
        ) : (
          <Battery size={14} className="text-os-text-secondary" />
        )}
        <Bell size={14} className="text-os-text-secondary" />
        <div className="w-px h-4 bg-os-border" />
        <div className="text-right">
          <div className="text-xs text-os-text">{clock.time}</div>
          <div className="text-[10px] text-os-text-muted">{clock.date}</div>
        </div>
      </div>
    </div>
  )
}
