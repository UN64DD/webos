import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../database/db'
import { filesystemService } from '../core/filesystem/filesystem'
import { shellExecute } from '../core/terminal/shell'

beforeEach(async () => {
  await db.files.clear()
  await filesystemService.initializeFilesystem()
})

describe('Terminal commands', () => {
  const cwd = '/home/user'

  it('ls lists directory contents', async () => {
    const result = await shellExecute('ls', cwd)
    expect(result.output).toBeDefined()
    expect(result.output).toContain('Documents')
    expect(result.output).toContain('Desktop')
  })

  it('cd changes directory', async () => {
    const result = await shellExecute('cd Documents', cwd)
    expect(result.newCwd).toBe('/home/user/Documents')
  })

  it('cd to ~ returns home', async () => {
    const result = await shellExecute('cd ~', cwd)
    expect(result.newCwd).toBe('/home/user')
  })

  it('mkdir creates directory', async () => {
    const result = await shellExecute('mkdir testdir', cwd)
    expect(result.isError).toBeFalsy()
    const items = await filesystemService.listDirectoryByPath('/home/user')
    expect(items.some((i) => i.name === 'testdir')).toBe(true)
  })

  it('touch creates file', async () => {
    const result = await shellExecute('touch hello.txt', cwd)
    expect(result.isError).toBeFalsy()
    const items = await filesystemService.listDirectoryByPath('/home/user')
    expect(items.some((i) => i.name === 'hello.txt')).toBe(true)
  })

  it('cat reads file', async () => {
    await shellExecute('touch test.txt', cwd)
    await shellExecute('echo "Hello WebOS" > test.txt', cwd)
    const result = await shellExecute('cat test.txt', cwd)
    expect(result.output).toBe('Hello WebOS')
  })

  it('echo writes to file', async () => {
    const result = await shellExecute('echo "test content" > output.txt', cwd)
    expect(result.isError).toBeFalsy()
    const catResult = await shellExecute('cat output.txt', cwd)
    expect(catResult.output).toBe('test content')
  })

  it('rm removes file', async () => {
    await shellExecute('touch deletable.txt', cwd)
    const rmResult = await shellExecute('rm deletable.txt', cwd)
    expect(rmResult.isError).toBeFalsy()
    const catResult = await shellExecute('cat deletable.txt', cwd)
    expect(catResult.isError).toBe(true)
  })

  it('pwd shows current directory', async () => {
    const result = await shellExecute('pwd', cwd)
    expect(result.output).toBe(cwd)
  })

  it('whoami returns user', async () => {
    const result = await shellExecute('whoami', cwd)
    expect(result.output).toBe('user')
  })

  it('date returns current date', async () => {
    const result = await shellExecute('date', cwd)
    expect(result.output).toBeDefined()
    expect(result.output!.length).toBeGreaterThan(0)
  })

  it('clear returns clear flag', async () => {
    const result = await shellExecute('clear', cwd)
    expect(result.clear).toBe(true)
  })

  it('invalid command returns error', async () => {
    const result = await shellExecute('invalidcmd', cwd)
    expect(result.isError).toBe(true)
    expect(result.output).toContain('command not found')
  })

  it('help lists commands', async () => {
    const result = await shellExecute('help', cwd)
    expect(result.output).toContain('Available commands')
    expect(result.output).toContain('ls')
    expect(result.output).toContain('cd')
  })
})
