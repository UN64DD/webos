import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { shellExecute } from '../../core/terminal/shell'

interface TerminalLine {
  id: number
  type: 'input' | 'output' | 'error'
  text: string
  command?: string
}

let lineCounter = 0

export function TerminalApp(props: { windowId: string }) {
  void props.windowId
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: lineCounter++, type: 'output', text: 'WebOS Terminal v1.0.0\nType "help" for available commands.\n' },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [cwd, setCwd] = useState('/home/user')
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const prompt = useMemo(() => `user@webos:${cwd === '/home/user' ? '~' : cwd}$`, [cwd])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [lines])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    const promptStr = `user@webos:${cwd === '/home/user' ? '~' : cwd}$`

    setLines((prev) => [
      ...prev,
      { id: lineCounter++, type: 'input', text: `${promptStr} ${trimmed}`, command: trimmed },
    ])

    setHistory((prev) => [...prev, trimmed])
    setHistoryIndex(-1)
    setInput('')

    try {
      const result = await shellExecute(trimmed, cwd)
      if (result.newCwd) {
        setCwd(result.newCwd)
      }
      if (result.output) {
        setLines((prev) => [
          ...prev,
          { id: lineCounter++, type: result.isError ? 'error' : 'output', text: result.output! },
        ])
      }
      if (result.clear) {
        setLines([])
      }
    } catch (err) {
      setLines((prev) => [
        ...prev,
        { id: lineCounter++, type: 'error', text: `Error: ${String(err)}` },
      ])
    }
  }, [input, cwd])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setInput(history[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= history.length) {
          setHistoryIndex(-1)
          setInput('')
        } else {
          setHistoryIndex(newIndex)
          setInput(history[newIndex])
        }
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }, [history, historyIndex])

  return (
    <div
      className="flex flex-col h-full bg-[#0c0c14] font-mono text-sm cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-auto p-3 space-y-0.5">
        {lines.map((line) => (
          <div key={line.id} className="whitespace-pre-wrap break-all">
            {line.type === 'input' ? (
              <span>
                <span className="text-os-accent">{prompt}</span>
                <span className="text-os-text"> {line.command}</span>
              </span>
            ) : (
              <span className={line.type === 'error' ? 'text-os-error' : 'text-os-text'}>
                {line.text}
              </span>
            )}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-os-accent whitespace-nowrap">{prompt} </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent text-os-text outline-none caret-os-accent"
            spellCheck={false}
            autoComplete="off"
          />
        </form>
        <div ref={endRef} />
      </div>
    </div>
  )
}
