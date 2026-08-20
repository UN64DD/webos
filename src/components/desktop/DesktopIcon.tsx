import { useCallback, useState, useRef } from 'react'
import { useDesktopStore } from '../../stores/desktopStore'
import { os } from '../../core/os/api'
import type { DesktopIcon } from '../../types'
import type { OSApplication } from '../../types'

interface DesktopIconProps {
  icon: DesktopIcon
  app: OSApplication
}

export function DesktopIcon({ icon, app }: DesktopIconProps) {
  const updateIconPosition = useDesktopStore((s) => s.updateIconPosition)
  const [, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, iconX: 0, iconY: 0 })

  const handleDoubleClick = useCallback(() => {
    os.windows.open(app.id)
  }, [app.id])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return
      const startX = e.clientX
      const startY = e.clientY
      dragStart.current = { x: startX, y: startY, iconX: icon.x, iconY: icon.y }
      let dragged = false

      const handleMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          dragged = true
          setIsDragging(true)
        }
      }
      const handleUp = (ev: MouseEvent) => {
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', handleUp)
        if (dragged) {
          const dx = ev.clientX - startX
          const dy = ev.clientY - startY
          updateIconPosition(icon.id, dragStart.current.iconX + dx, dragStart.current.iconY + dy)
        }
        setIsDragging(false)
      }
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleUp)
    },
    [icon.id, icon.x, icon.y, updateIconPosition]
  )

  return (
    <div
      className="absolute flex flex-col items-center gap-1 w-20 p-2 rounded cursor-pointer select-none hover:bg-white/5 transition-colors"
      style={{ left: icon.x, top: icon.y }}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      <div className="w-10 h-10 flex items-center justify-center">
        {app.icon}
      </div>
      <span className="text-[11px] text-center text-os-desktop-icon leading-tight drop-shadow-md">
        {app.name}
      </span>
    </div>
  )
}
