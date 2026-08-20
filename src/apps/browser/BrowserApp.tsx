import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  ExternalLink,
  Home,
  Globe,
} from 'lucide-react'

export function BrowserApp(props: { windowId: string }) {
  void props.windowId
  const [url, setUrl] = useState('https://example.com')
  const [inputUrl, setInputUrl] = useState('https://example.com')
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [history, setHistory] = useState<string[]>(['https://example.com'])
  const [historyIndex, setHistoryIndex] = useState(0)

  const navigate = (targetUrl: string) => {
    let finalUrl = targetUrl
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl
    }
    setUrl(finalUrl)
    setInputUrl(finalUrl)
    setIsLoading(true)
    setHasError(false)
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(finalUrl)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setUrl(history[newIndex])
      setInputUrl(history[newIndex])
      setIsLoading(true)
      setHasError(false)
    }
  }

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setUrl(history[newIndex])
      setInputUrl(history[newIndex])
      setIsLoading(true)
      setHasError(false)
    }
  }

  const handleReload = () => {
    setIsLoading(true)
    setHasError(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(inputUrl)
  }

  return (
    <div className="flex flex-col h-full bg-os-bg">
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-os-border bg-os-surface">
        <button
          onClick={handleBack}
          disabled={historyIndex === 0}
          className="p-1.5 rounded hover:bg-os-surface-hover disabled:opacity-30"
        >
          <ArrowLeft size={16} />
        </button>
        <button
          onClick={handleForward}
          disabled={historyIndex === history.length - 1}
          className="p-1.5 rounded hover:bg-os-surface-hover disabled:opacity-30"
        >
          <ArrowRight size={16} />
        </button>
        <button
          onClick={handleReload}
          className="p-1.5 rounded hover:bg-os-surface-hover"
        >
          <RotateCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
        <button
          onClick={() => window.open(url, '_blank')}
          className="p-1.5 rounded hover:bg-os-surface-hover"
          title="Open in new tab"
        >
          <ExternalLink size={16} />
        </button>

        {/* URL bar */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center">
          <div className="flex-1 flex items-center gap-2 px-2.5 py-1 bg-os-bg border border-os-border rounded text-sm focus-within:border-os-accent transition-colors">
            <Globe size={14} className="text-os-text-muted shrink-0" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 bg-transparent text-os-text outline-none"
              spellCheck={false}
            />
          </div>
        </form>

        <button
          onClick={() => navigate('https://example.com')}
          className="p-1.5 rounded hover:bg-os-surface-hover"
          title="Home"
        >
          <Home size={16} />
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-os-bg z-10">
            <div className="flex flex-col items-center gap-3">
              <RotateCw size={32} className="text-os-accent animate-spin" />
              <span className="text-sm text-os-text-secondary">Loading {url}...</span>
            </div>
          </div>
        )}
        {hasError ? (
          <div className="flex flex-col items-center justify-center h-full bg-os-bg gap-4 p-8">
            <Globe size={48} className="text-os-text-muted opacity-30" />
            <div className="text-center">
              <p className="text-os-text font-medium mb-1">Cannot display this page</p>
              <p className="text-sm text-os-text-secondary mb-4">
                This website may restrict iframe embedding for security reasons.
              </p>
              <button
                onClick={() => window.open(url, '_blank')}
                className="flex items-center gap-2 px-4 py-2 bg-os-accent hover:bg-os-accent-hover rounded text-sm text-white transition-colors mx-auto"
              >
                <ExternalLink size={14} />
                Open in new tab
              </button>
            </div>
          </div>
        ) : (
          <iframe
            src={url}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false)
              setHasError(true)
            }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            title="Browser"
          />
        )}
      </div>
    </div>
  )
}
