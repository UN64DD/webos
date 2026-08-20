import { useState, useEffect, useCallback, useRef } from 'react'
import {
  FolderOpen,
  FileText,
  ChevronRight,
  Home,
  FolderPlus,
  FilePlus,
  Trash2,
  Pencil,
  ArrowUp,
  LayoutGrid,
  List,
  Search,
  X,
  Loader2,
} from 'lucide-react'
import { os } from '../../core/os/api'
import type { FileNode } from '../../types'

interface DirectoryState {
  currentPath: string
  currentFolderId: string | null
  nodes: FileNode[]
  breadcrumbs: { name: string; id: string | null }[]
}

const INITIAL_DIR_STATE: DirectoryState = {
  currentPath: '/home/user',
  currentFolderId: null,
  nodes: [],
  breadcrumbs: [],
}

export function FileManagerApp(props: { windowId: string }) {
  void props.windowId
  const [dir, setDir] = useState<DirectoryState>(INITIAL_DIR_STATE)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node?: FileNode } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FileNode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const mountedRef = useRef(false)

  const loadDirectory = useCallback(async (path: string) => {
    setIsLoading(true)
    try {
      const node = await os.filesystem.resolvePath(path)
      if (!node || node.type !== 'folder') {
        setIsLoading(false)
        return
      }
      const items = await os.filesystem.listDirectory(node.id)

      const crumbs: { name: string; id: string | null }[] = []
      let current: FileNode | undefined = node
      while (current) {
        crumbs.unshift({ name: current.name, id: current.parentId })
        if (current.parentId) {
          current = await os.filesystem.getNodeById(current.parentId)
        } else {
          break
        }
      }
      crumbs.unshift({ name: '~', id: null })
      setDir({ currentPath: path, currentFolderId: node.id, nodes: items, breadcrumbs: crumbs })
    } catch {
      os.notifications.create({ title: 'Error', message: `Cannot open ${path}`, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true
    void loadDirectory('/home/user')
  }, [loadDirectory])

  useEffect(() => {
    if (!searchQuery.trim()) return
    const timer = setTimeout(async () => {
      const results = await os.filesystem.searchNodes(searchQuery)
      setSearchResults(results.slice(0, 20))
    }, 200)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const displayedNodes = searchQuery.trim() ? searchResults : dir.nodes

  const navigateTo = (node: FileNode) => {
    if (node.type === 'folder') {
      if (dir.currentPath === '~') {
        loadDirectory(`~/${node.name}`)
      } else {
        loadDirectory(`${dir.currentPath}/${node.name}`)
      }
    } else if (node.name.endsWith('.txt') || node.mimeType === 'text/plain') {
      os.windows.open('text-editor', { title: node.name, path: node.id })
    }
  }

  const handleCreateFolder = async () => {
    if (!dir.currentFolderId) return
    try {
      await os.filesystem.createFolder('New Folder', dir.currentFolderId)
      await loadDirectory(dir.currentPath)
      os.notifications.create({ title: 'Folder created', message: 'New folder was created', type: 'success' })
    } catch (e) {
      os.notifications.create({ title: 'Error', message: String(e), type: 'error' })
    }
  }

  const handleCreateFile = async () => {
    if (!dir.currentFolderId) return
    try {
      await os.filesystem.createFile('untitled.txt', dir.currentFolderId, '')
      await loadDirectory(dir.currentPath)
      os.notifications.create({ title: 'File created', message: 'New file was created', type: 'success' })
    } catch (e) {
      os.notifications.create({ title: 'Error', message: String(e), type: 'error' })
    }
  }

  const handleDelete = async (node: FileNode) => {
    try {
      await os.filesystem.deleteNode(node.id)
      await loadDirectory(dir.currentPath)
      os.notifications.create({ title: 'Deleted', message: `"${node.name}" was deleted`, type: 'info' })
    } catch (e) {
      os.notifications.create({ title: 'Error', message: String(e), type: 'error' })
    }
  }

  const handleRenameStart = (node: FileNode) => {
    setRenamingId(node.id)
    setRenameValue(node.name)
    setContextMenu(null)
  }

  const handleRenameConfirm = async (node: FileNode) => {
    if (renameValue.trim() && renameValue !== node.name) {
      try {
        await os.filesystem.renameNode(node.id, renameValue.trim())
        await loadDirectory(dir.currentPath)
      } catch (e) {
        os.notifications.create({ title: 'Error', message: String(e), type: 'error' })
      }
    }
    setRenamingId(null)
  }

  const goToParent = () => {
    if (dir.breadcrumbs.length > 1) {
      const parentPathParts = dir.currentPath.split('/').slice(0, -1)
      const parentPath = parentPathParts.length <= 1 ? '/' : parentPathParts.join('/')
      loadDirectory(parentPath === '/home' ? '~' : parentPath)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, node?: FileNode) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, node })
  }

  return (
    <div
      className="flex flex-col h-full bg-os-bg"
      onContextMenu={(e) => handleContextMenu(e)}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-os-border bg-os-surface">
        <button
          onClick={goToParent}
          disabled={dir.breadcrumbs.length <= 1}
          className="p-1.5 rounded hover:bg-os-surface-hover disabled:opacity-30"
        >
          <ArrowUp size={16} />
        </button>
        <div className="flex-1 flex items-center gap-1 px-2 py-1 bg-os-bg rounded border border-os-border text-sm overflow-x-auto">
          {dir.breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1 whitespace-nowrap">
              {i > 0 && <ChevronRight size={12} className="text-os-text-muted" />}
              <button
                onClick={() => {
                  if (crumb.id === null) loadDirectory('~')
                  else {
                    const pathParts = dir.currentPath.split('/')
                    const targetPath = i === 0 ? '~' : pathParts.slice(0, i + 1).join('/')
                    loadDirectory(targetPath)
                  }
                }}
                className="hover:text-os-accent transition-colors"
              >
                {crumb.name}
              </button>
            </span>
          ))}
          {isLoading && <Loader2 size={12} className="text-os-accent animate-spin shrink-0" />}
        </div>
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className="p-1.5 rounded hover:bg-os-surface-hover"
        >
          {viewMode === 'grid' ? <List size={16} /> : <LayoutGrid size={16} />}
        </button>
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-os-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 pr-6 py-1 bg-os-bg border border-os-border rounded text-sm w-40 focus:outline-none focus:border-os-accent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 hover:bg-os-surface-hover rounded"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Toolbar actions */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-os-border bg-os-surface">
        <button
          onClick={handleCreateFolder}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-os-surface-hover text-os-text-secondary"
        >
          <FolderPlus size={14} />
          New Folder
        </button>
        <button
          onClick={handleCreateFile}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-os-surface-hover text-os-text-secondary"
        >
          <FilePlus size={14} />
          New File
        </button>
      </div>

      {/* File listing */}
      <div key={dir.currentPath} className="flex-1 overflow-auto p-3 animate-list-fade">
        {searchQuery.trim() && (
          <div className="text-xs text-os-text-muted mb-2">
            Search results for &quot;{searchQuery}&quot;
          </div>
        )}
        {displayedNodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-os-text-muted">
            <FolderOpen size={48} className="mb-2 opacity-30" />
            <span className="text-sm">This folder is empty</span>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-2">
            {displayedNodes.map((node) => (
              <div
                key={node.id}
                className={`flex flex-col items-center gap-1 p-2 rounded cursor-pointer transition-colors ${
                  selectedNode === node.id
                    ? 'bg-os-accent-dim border border-os-accent/30'
                    : 'hover:bg-os-surface-hover border border-transparent'
                }`}
                onClick={() => setSelectedNode(node.id)}
                onDoubleClick={() => navigateTo(node)}
                onContextMenu={(e) => handleContextMenu(e, node)}
              >
                {node.type === 'folder' ? (
                  <FolderOpen size={36} className="text-os-accent" />
                ) : (
                  <FileText size={36} className="text-os-text-secondary" />
                )}
                {renamingId === node.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRenameConfirm(node)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameConfirm(node)
                      if (e.key === 'Escape') setRenamingId(null)
                    }}
                    className="w-full text-xs text-center bg-os-bg border border-os-accent rounded px-1 py-0.5 outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-xs text-center truncate w-full leading-tight">
                    {node.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0.5">
            {displayedNodes.map((node) => (
              <div
                key={node.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                  selectedNode === node.id
                    ? 'bg-os-accent-dim border border-os-accent/30'
                    : 'hover:bg-os-surface-hover border border-transparent'
                }`}
                onClick={() => setSelectedNode(node.id)}
                onDoubleClick={() => navigateTo(node)}
                onContextMenu={(e) => handleContextMenu(e, node)}
              >
                {node.type === 'folder' ? (
                  <FolderOpen size={16} className="text-os-accent shrink-0" />
                ) : (
                  <FileText size={16} className="text-os-text-secondary shrink-0" />
                )}
                {renamingId === node.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRenameConfirm(node)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameConfirm(node)
                      if (e.key === 'Escape') setRenamingId(null)
                    }}
                    className="flex-1 text-sm bg-os-bg border border-os-accent rounded px-2 py-0.5 outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-sm truncate">{node.name}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-os-border bg-os-surface text-xs text-os-text-muted">
        <span>{dir.nodes.length} items</span>
        <span>{dir.currentPath}</span>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-[9999] bg-os-surface border border-os-border rounded-lg shadow-xl py-1 min-w-[160px] animate-fade-in"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {contextMenu.node ? (
              <>
                <button
                  onClick={() => {
                    if (contextMenu.node) navigateTo(contextMenu.node)
                    setContextMenu(null)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-os-surface-hover"
                >
                  <FolderOpen size={14} /> Open
                </button>
                <button
                  onClick={() => {
                    if (contextMenu.node) handleRenameStart(contextMenu.node)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-os-surface-hover"
                >
                  <Pencil size={14} /> Rename
                </button>
                <div className="h-px bg-os-border my-1" />
                <button
                  onClick={() => {
                    if (contextMenu.node) handleDelete(contextMenu.node)
                    setContextMenu(null)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-os-surface-hover text-os-error"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    handleCreateFolder()
                    setContextMenu(null)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-os-surface-hover"
                >
                  <FolderPlus size={14} /> New Folder
                </button>
                <button
                  onClick={() => {
                    handleCreateFile()
                    setContextMenu(null)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-os-surface-hover"
                >
                  <FilePlus size={14} /> New File
                </button>
                <div className="h-px bg-os-border my-1" />
                <button
                  onClick={() => {
                    loadDirectory(dir.currentPath)
                    setContextMenu(null)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-os-surface-hover"
                >
                  <Home size={14} /> Refresh
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
