import { useState, useEffect, useCallback, useRef } from 'react'
import { Save, FileText } from 'lucide-react'
import { os } from '../../core/os/api'
import type { FileNode, AppProps } from '../../types'

export function TextEditorApp({ windowId, filePath }: AppProps) {
  const [content, setContent] = useState('')
  const [file, setFile] = useState<FileNode | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [fileName, setFileName] = useState('untitled.txt')
  const loadedRef = useRef<string | null>(null)

  const loadFile = useCallback(async (fileId: string) => {
    const node = await os.filesystem.readFile(fileId)
    if (node && node.type === 'file') {
      setFile(node)
      setContent(node.content ?? '')
      setFileName(node.name)
      setIsDirty(false)
      os.windows.updateWindowTitle(windowId, `${node.name} - Text Editor`)
    }
  }, [windowId])

  useEffect(() => {
    if (filePath && filePath !== loadedRef.current) {
      loadedRef.current = filePath
      void loadFile(filePath)
    }
  }, [filePath, loadFile])

  const handleSave = async () => {
    if (!file) return
    try {
      await os.filesystem.writeFile(file.id, content)
      setIsDirty(false)
      os.notifications.create({
        title: 'File saved',
        message: `${file.name} was saved successfully.`,
        type: 'success',
      })
    } catch (e) {
      os.notifications.create({
        title: 'Save failed',
        message: String(e),
        type: 'error',
      })
    }
  }

  const handleSaveAs = async () => {
    try {
      const homeUser = await os.filesystem.resolvePath('/home/user/Documents')
      if (!homeUser) return
      const newFile = await os.filesystem.createFile(
        fileName || 'untitled.txt',
        homeUser.id,
        content
      )
      setFile(newFile)
      setIsDirty(false)
      os.windows.updateWindowTitle(windowId, `${newFile.name} - Text Editor`)
      os.notifications.create({
        title: 'File saved',
        message: `${newFile.name} was saved.`,
        type: 'success',
      })
    } catch (e) {
      os.notifications.create({
        title: 'Save failed',
        message: String(e),
        type: 'error',
      })
    }
  }

  const handleNewFile = () => {
    setFile(null)
    setContent('')
    setFileName('untitled.txt')
    setIsDirty(false)
    os.windows.updateWindowTitle(windowId, 'Text Editor')
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (file) handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <div className="flex flex-col h-full bg-os-bg">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-os-border bg-os-surface">
        <button
          onClick={handleNewFile}
          className="px-2 py-1 text-xs rounded hover:bg-os-surface-hover text-os-text-secondary"
        >
          New
        </button>
        <button
          onClick={file ? handleSave : handleSaveAs}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-os-surface-hover text-os-text-secondary"
        >
          <Save size={14} /> Save
        </button>
        <button
          onClick={handleSaveAs}
          className="px-2 py-1 text-xs rounded hover:bg-os-surface-hover text-os-text-secondary"
        >
          Save As
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 text-xs text-os-text-muted">
          <FileText size={14} />
          <span>{fileName}</span>
          {isDirty && <span className="text-os-accent">●</span>}
        </div>
      </div>

      {/* Editor */}
      <textarea
        className="flex-1 w-full bg-transparent p-4 font-mono text-sm text-os-text resize-none focus:outline-none leading-relaxed"
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          setIsDirty(true)
        }}
        placeholder="Start typing..."
        spellCheck={false}
      />
    </div>
  )
}
