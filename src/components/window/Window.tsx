import { useRef, useCallback, useEffect, useState } from 'react'
import { Minus, X, Maximize2, Minimize2 } from 'lucide-react'
import { useWindowStore } from '../../stores/windowStore'
import type { WindowState } from '../../types'

interface WindowProps {
  window: WindowState
  children: React.ReactNode
}

const MIN_WIDTH = 300
const MIN_HEIGHT = 200

export function Window({ window: win, children }: WindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPosition, updateWindowSize } = useWindowStore()
  const windowRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 })
  const rafRef = useRef<number>(0)

  const handleMouseDown = useCallback(() => {
    if (!win.isFocused) {
      focusWindow(win.id)
    }
  }, [win.id, win.isFocused, focusWindow])

  // Drag with requestAnimationFrame
  const handleTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (win.isMaximized) return
      e.preventDefault()
      setIsDragging(true)
      dragOffset.current = {
        x: e.clientX - win.x,
        y: e.clientY - win.y,
      }
    },
    [win.x, win.y, win.isMaximized]
  )

  useEffect(() => {
    if (!isDragging) return
    let active = true

    const handleMove = (e: MouseEvent) => {
      if (!active) return
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const newX = Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - 100))
        const newY = Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 80))
        updateWindowPosition(win.id, newX, newY)
      })
    }
    const handleUp = () => {
      active = false
      cancelAnimationFrame(rafRef.current)
      setIsDragging(false)
    }
    window.addEventListener('mousemove', handleMove, { passive: true })
    window.addEventListener('mouseup', handleUp)
    return () => {
      active = false
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [isDragging, win.id, updateWindowPosition])

  // Resize with requestAnimationFrame
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, direction: string) => {
      if (win.isMaximized) return
      e.preventDefault()
      e.stopPropagation()
      setIsResizing(true)
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        w: win.width,
        h: win.height,
      }
      const rWin = { id: win.id, minWidth: win.minWidth, minHeight: win.minHeight }

      let active = true

      const handleMove = (ev: MouseEvent) => {
        if (!active) return
        cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => {
          const dx = ev.clientX - resizeStart.current.x
          const dy = ev.clientY - resizeStart.current.y
          let newW = resizeStart.current.w
          let newH = resizeStart.current.h

          if (direction.includes('e')) newW = Math.max(rWin.minWidth ?? MIN_WIDTH, resizeStart.current.w + dx)
          if (direction.includes('s')) newH = Math.max(rWin.minHeight ?? MIN_HEIGHT, resizeStart.current.h + dy)
          if (direction.includes('w')) {
            newW = Math.max(rWin.minWidth ?? MIN_WIDTH, resizeStart.current.w - dx)
          }
          if (direction.includes('n')) {
            newH = Math.max(rWin.minHeight ?? MIN_HEIGHT, resizeStart.current.h - dy)
          }

          updateWindowSize(rWin.id, newW, newH)
        })
      }
      const handleUp = () => {
        active = false
        cancelAnimationFrame(rafRef.current)
        setIsResizing(false)
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', handleUp)
      }
      window.addEventListener('mousemove', handleMove, { passive: true })
      window.addEventListener('mouseup', handleUp)
    },
    [win, updateWindowSize]
  )

  if (win.isMinimized) return null

  const style: React.CSSProperties = win.isMaximized
    ? { left: 0, top: 0, width: '100%', height: 'calc(100% - 48px)' }
    : { left: win.x, top: win.y, width: win.width, height: win.height }

  return (
    <div
      ref={windowRef}
      className={`absolute flex flex-col rounded-lg overflow-hidden shadow-2xl border ${
        win.isFocused
          ? 'border-os-border-light shadow-black/40'
          : 'border-os-border shadow-black/20'
      }`}
      style={{
        ...style,
        zIndex: win.zIndex,
        willChange: isDragging || isResizing ? 'transform' : 'auto',
        contain: 'layout',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Title bar */}
      <div
        className={`flex items-center h-9 px-2 shrink-0 ${
          win.isFocused ? 'bg-os-titlebar' : 'bg-os-titlebar-inactive'
        } ${win.isMaximized ? '' : 'cursor-move'}`}
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={() => maximizeWindow(win.id)}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-os-text-secondary text-sm">{win.icon}</span>
          <span className="text-xs truncate text-os-text-secondary">{win.title}</span>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              minimizeWindow(win.id)
            }}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-os-text-secondary"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              maximizeWindow(win.id)
            }}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-os-text-secondary"
          >
            {win.isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeWindow(win.id)
            }}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500/80 hover:text-white text-os-text-secondary"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-os-window-bg">
        {children}
      </div>

      {/* Resize handles */}
      {!win.isMaximized && (
        <>
          <div className="absolute right-0 top-0 bottom-0 w-1 cursor-e-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'e')} />
          <div className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize" onMouseDown={(e) => handleResizeMouseDown(e, 's')} />
          <div className="absolute left-0 top-0 bottom-0 w-1 cursor-w-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'w')} />
          <div className="absolute top-0 left-0 right-0 h-1 cursor-n-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'n')} />
          <div className="absolute right-0 bottom-0 w-3 h-3 cursor-se-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'se')} />
          <div className="absolute left-0 bottom-0 w-3 h-3 cursor-sw-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'sw')} />
          <div className="absolute right-0 top-0 w-3 h-3 cursor-ne-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'ne')} />
          <div className="absolute left-0 top-0 w-3 h-3 cursor-nw-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'nw')} />
        </>
      )}

      {(isDragging || isResizing) && <div className="fixed inset-0 z-[9999]" />}
    </div>
  )
}
