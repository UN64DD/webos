import { nanoid } from 'nanoid'
import { db } from '../../database/db'
import type { FileNode, FilesystemAPI } from '../../types'

const HOME_ID = 'home'
const USER_ID = 'user'

const DEFAULT_FOLDERS = ['Desktop', 'Documents', 'Downloads', 'Pictures', 'Projects']

// In-memory cache for path resolution — cleared on mutations
const nodeCache = new Map<string, FileNode>()
const childCache = new Map<string | null, FileNode[]>()

function invalidateCache() {
  nodeCache.clear()
  childCache.clear()
}

function cacheNode(node: FileNode) {
  nodeCache.set(node.id, node)
}

function cacheChildren(parentId: string | null, children: FileNode[]) {
  childCache.set(parentId, children)
}

async function initializeFilesystem(): Promise<void> {
  const existing = await db.files.get(HOME_ID)
  if (existing) return

  await db.files.bulkAdd([
    {
      id: HOME_ID,
      name: 'home',
      type: 'folder',
      parentId: null,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    },
    {
      id: USER_ID,
      name: 'user',
      type: 'folder',
      parentId: HOME_ID,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    },
    ...DEFAULT_FOLDERS.map((name) => ({
      id: nanoid(),
      name,
      type: 'folder' as const,
      parentId: USER_ID,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    })),
  ])
  invalidateCache()
}

async function readFile(id: string): Promise<FileNode | undefined> {
  const cached = nodeCache.get(id)
  if (cached) return cached
  const node = await db.files.get(id)
  if (node) cacheNode(node)
  return node
}

async function readFileByPath(path: string): Promise<FileNode | undefined> {
  const node = await resolvePath(path)
  if (!node || node.type !== 'file') return undefined
  return node
}

async function writeFile(id: string, content: string): Promise<void> {
  const node = await readFile(id)
  if (!node || node.type !== 'file') {
    throw new Error('Cannot write to a folder or non-existent node')
  }
  await db.files.update(id, { content, modifiedAt: Date.now() })
  nodeCache.delete(id)
  invalidateCache()
}

async function createFile(
  name: string,
  parentId: string,
  content = '',
  mimeType = 'text/plain'
): Promise<FileNode> {
  const siblings = await db.files.where('parentId').equals(parentId).toArray()
  if (siblings.some((s) => s.name === name && s.type === 'file')) {
    throw new Error(`File "${name}" already exists`)
  }

  const now = Date.now()
  const file: FileNode = {
    id: nanoid(),
    name,
    type: 'file',
    parentId,
    content,
    mimeType,
    createdAt: now,
    modifiedAt: now,
  }
  await db.files.add(file)
  invalidateCache()
  return file
}

async function createFolder(name: string, parentId: string): Promise<FileNode> {
  const siblings = await db.files.where('parentId').equals(parentId).toArray()
  if (siblings.some((s) => s.name === name && s.type === 'folder')) {
    throw new Error(`Folder "${name}" already exists`)
  }

  const now = Date.now()
  const folder: FileNode = {
    id: nanoid(),
    name,
    type: 'folder',
    parentId,
    createdAt: now,
    modifiedAt: now,
  }
  await db.files.add(folder)
  invalidateCache()
  return folder
}

async function deleteNode(id: string): Promise<void> {
  if (id === HOME_ID || id === USER_ID) {
    throw new Error('Cannot delete system directories')
  }
  const children = await db.files.where('parentId').equals(id).toArray()
  for (const child of children) {
    await deleteNode(child.id)
  }
  await db.files.delete(id)
  invalidateCache()
}

async function renameNode(id: string, newName: string): Promise<void> {
  const node = await readFile(id)
  if (!node) throw new Error('Node not found')
  if (id === HOME_ID || id === USER_ID) {
    throw new Error('Cannot rename system directories')
  }

  if (node.parentId) {
    const siblings = await db.files.where('parentId').equals(node.parentId).toArray()
    if (siblings.some((s) => s.name === newName && s.id !== id)) {
      throw new Error(`"${newName}" already exists in this directory`)
    }
  }

  await db.files.update(id, { name: newName, modifiedAt: Date.now() })
  invalidateCache()
}

async function moveNode(id: string, newParentId: string): Promise<void> {
  const node = await readFile(id)
  if (!node) throw new Error('Node not found')
  if (id === HOME_ID || id === USER_ID) {
    throw new Error('Cannot move system directories')
  }
  if (id === newParentId) throw new Error('Cannot move a folder into itself')

  const targetChildren = await db.files.where('parentId').equals(newParentId).toArray()
  if (targetChildren.some((s) => s.name === node.name)) {
    throw new Error(`"${node.name}" already exists in the target directory`)
  }

  await db.files.update(id, { parentId: newParentId, modifiedAt: Date.now() })
  invalidateCache()
}

async function listDirectory(parentId: string | null): Promise<FileNode[]> {
  const cached = childCache.get(parentId)
  if (cached) return cached
  const nodes = await db.files.where('parentId').equals(parentId as never).toArray()
  const sorted = nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  cacheChildren(parentId, sorted)
  return sorted
}

async function listDirectoryByPath(path: string): Promise<FileNode[]> {
  const node = await resolvePath(path)
  if (!node || node.type !== 'folder') {
    throw new Error(`Directory not found: ${path}`)
  }
  return listDirectory(node.id)
}

async function searchNodes(query: string): Promise<FileNode[]> {
  const lower = query.toLowerCase()
  const all = await db.files.toArray()
  return all.filter((n) => n.name.toLowerCase().includes(lower))
}

async function getNodeById(id: string): Promise<FileNode | undefined> {
  const cached = nodeCache.get(id)
  if (cached) return cached
  const node = await db.files.get(id)
  if (node) cacheNode(node)
  return node
}

async function resolvePath(path: string): Promise<FileNode | undefined> {
  const parts = path.split('/').filter(Boolean)
  // eslint-disable-next-line no-useless-assignment
  let currentId: string | null = null

  if (parts[0] === 'home') {
    const home = await readFile(HOME_ID)
    if (!home) return undefined
    currentId = home.id
    parts.shift()
  } else if (parts[0] === '~') {
    currentId = USER_ID
    parts.shift()
  } else {
    currentId = null
  }

  for (const part of parts) {
    if (part === '..') {
      const current = await readFile(currentId!)
      if (current) currentId = current.parentId
      continue
    }
    if (part === '.') continue

    const children = await listDirectory(currentId)
    const found = children.find((c) => c.name === part)
    if (!found) return undefined
    currentId = found.id
  }

  return readFile(currentId!)
}

async function getParentPath(nodeId: string): Promise<string> {
  const node = await db.files.get(nodeId)
  if (!node) return '/'
  if (!node.parentId) return '/'

  const parts: string[] = []
  let current: FileNode | undefined = node

  while (current && current.parentId) {
    parts.unshift(current.name)
    current = await db.files.get(current.parentId)
  }

  if (current && current.id === HOME_ID) {
    parts.unshift('home')
  } else if (current && current.id === USER_ID) {
    parts.unshift('~')
  }

  return '/' + parts.join('/')
}

async function getStorageUsage(): Promise<{ used: number; total: number }> {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate()
    return { used: estimate.usage ?? 0, total: estimate.quota ?? 0 }
  }
  return { used: 0, total: 0 }
}

export const filesystemService: FilesystemAPI = {
  readFile,
  readFileByPath,
  writeFile,
  createFile,
  createFolder,
  deleteNode,
  renameNode,
  moveNode,
  listDirectory,
  listDirectoryByPath,
  searchNodes,
  getNodeById,
  resolvePath,
  getParentPath,
  initializeFilesystem,
  getStorageUsage,
}
