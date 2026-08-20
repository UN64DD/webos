import type { ReactNode } from 'react'

export interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  parentId: string | null
  content?: string
  mimeType?: string
  createdAt: number
  modifiedAt: number
}

export interface WindowState {
  id: string
  appId: string
  title: string
  icon: ReactNode
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  isMinimized: boolean
  isMaximized: boolean
  isFocused: boolean
  minWidth?: number
  minHeight?: number
}

export interface AppProps {
  windowId: string
  filePath?: string
}

export interface OSApplication {
  id: string
  name: string
  icon: ReactNode
  component: React.ComponentType<AppProps>
  defaultWidth: number
  defaultHeight: number
  minWidth?: number
  minHeight?: number
}

export interface DesktopIcon {
  id: string
  appId: string
  x: number
  y: number
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  timestamp: number
  read: boolean
}

export interface WallpaperOption {
  id: string
  name: string
  type: 'gradient' | 'solid'
  value: string
}

export interface ContextMenuItem {
  label: string
  icon?: ReactNode
  action: () => void
  separator?: boolean
  disabled?: boolean
}

export interface FilesystemAPI {
  readFile(id: string): Promise<FileNode | undefined>
  readFileByPath(path: string): Promise<FileNode | undefined>
  writeFile(id: string, content: string): Promise<void>
  createFile(name: string, parentId: string, content?: string, mimeType?: string): Promise<FileNode>
  createFolder(name: string, parentId: string): Promise<FileNode>
  deleteNode(id: string): Promise<void>
  renameNode(id: string, newName: string): Promise<void>
  moveNode(id: string, newParentId: string): Promise<void>
  listDirectory(parentId: string | null): Promise<FileNode[]>
  listDirectoryByPath(path: string): Promise<FileNode[]>
  searchNodes(query: string): Promise<FileNode[]>
  getNodeById(id: string): Promise<FileNode | undefined>
  resolvePath(path: string): Promise<FileNode | undefined>
  getParentPath(nodeId: string): Promise<string>
  initializeFilesystem(): Promise<void>
  getStorageUsage(): Promise<{ used: number; total: number }>
}

export interface WindowManagerAPI {
  open(appId: string, options?: { title?: string; path?: string }): string | null
  close(windowId: string): void
  minimize(windowId: string): void
  maximize(windowId: string): void
  focus(windowId: string): void
  updateWindowTitle(windowId: string, title: string): void
  getWindows(): WindowState[]
  getFocusedWindow(): WindowState | null
}

export interface NotificationAPI {
  create(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void
  dismiss(id: string): void
  clearAll(): void
}

export interface SettingsAPI {
  getTheme(): 'dark' | 'light'
  setTheme(theme: 'dark' | 'light'): void
  getWallpaper(): WallpaperOption
  setWallpaper(wallpaper: WallpaperOption): void
  resetAll(): Promise<void>
}

export interface WebOSAPI {
  filesystem: FilesystemAPI
  windows: WindowManagerAPI
  notifications: NotificationAPI
  settings: SettingsAPI
}
