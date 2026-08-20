import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../database/db'
import { filesystemService } from '../core/filesystem/filesystem'

beforeEach(async () => {
  await db.files.clear()
  await filesystemService.initializeFilesystem()
})

describe('Filesystem', () => {
  it('initializes with default directories', async () => {
    const userFiles = await filesystemService.listDirectoryByPath('/home/user')
    const names = userFiles.map((f) => f.name)
    expect(names).toContain('Desktop')
    expect(names).toContain('Documents')
    expect(names).toContain('Downloads')
    expect(names).toContain('Pictures')
    expect(names).toContain('Projects')
  })

  it('creates a file', async () => {
    const user = await filesystemService.resolvePath('/home/user/Documents')
    expect(user).toBeDefined()
    const file = await filesystemService.createFile('test.txt', user!.id, 'hello')
    expect(file.name).toBe('test.txt')
    expect(file.type).toBe('file')
    expect(file.content).toBe('hello')
  })

  it('reads a file', async () => {
    const user = await filesystemService.resolvePath('/home/user/Documents')
    const file = await filesystemService.createFile('test.txt', user!.id, 'content here')
    const read = await filesystemService.readFile(file.id)
    expect(read).toBeDefined()
    expect(read!.content).toBe('content here')
  })

  it('writes to a file', async () => {
    const user = await filesystemService.resolvePath('/home/user/Documents')
    const file = await filesystemService.createFile('test.txt', user!.id, 'old')
    await filesystemService.writeFile(file.id, 'new content')
    const read = await filesystemService.readFile(file.id)
    expect(read!.content).toBe('new content')
  })

  it('deletes a file', async () => {
    const user = await filesystemService.resolvePath('/home/user/Documents')
    const file = await filesystemService.createFile('delete-me.txt', user!.id)
    await filesystemService.deleteNode(file.id)
    const read = await filesystemService.readFile(file.id)
    expect(read).toBeUndefined()
  })

  it('creates a folder', async () => {
    const user = await filesystemService.resolvePath('/home/user/Documents')
    const folder = await filesystemService.createFolder('NewFolder', user!.id)
    expect(folder.name).toBe('NewFolder')
    expect(folder.type).toBe('folder')
  })

  it('lists directory contents', async () => {
    const user = await filesystemService.resolvePath('/home/user/Documents')
    await filesystemService.createFile('a.txt', user!.id)
    await filesystemService.createFolder('b', user!.id)
    const items = await filesystemService.listDirectory(user!.id)
    expect(items.length).toBe(2)
    expect(items[0].type).toBe('folder')
    expect(items[1].type).toBe('file')
  })

  it('renames a file', async () => {
    const user = await filesystemService.resolvePath('/home/user/Documents')
    const file = await filesystemService.createFile('old.txt', user!.id)
    await filesystemService.renameNode(file.id, 'new.txt')
    const read = await filesystemService.readFile(file.id)
    expect(read!.name).toBe('new.txt')
  })

  it('resolves paths correctly', async () => {
    const node = await filesystemService.resolvePath('/home/user/Desktop')
    expect(node).toBeDefined()
    expect(node!.name).toBe('Desktop')
  })

  it('returns undefined for non-existent paths', async () => {
    const node = await filesystemService.resolvePath('/home/user/nonexistent')
    expect(node).toBeUndefined()
  })

  it('prevents duplicate file names', async () => {
    const user = await filesystemService.resolvePath('/home/user/Documents')
    await filesystemService.createFile('test.txt', user!.id)
    await expect(
      filesystemService.createFile('test.txt', user!.id)
    ).rejects.toThrow('already exists')
  })

  it('searches files', async () => {
    const user = await filesystemService.resolvePath('/home/user/Documents')
    await filesystemService.createFile('searchable.txt', user!.id)
    const results = await filesystemService.searchNodes('search')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results.some((r) => r.name === 'searchable.txt')).toBe(true)
  })
})
