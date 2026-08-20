import { filesystemService } from '../filesystem/filesystem'

export interface ShellResult {
  output?: string
  newCwd?: string
  isError?: boolean
  clear?: boolean
}

async function resolveCwd(cwd: string, path: string): Promise<string> {
  if (path === '~' || path.startsWith('~/')) {
    const rest = path.slice(1)
    return '/home/user' + rest
  }
  if (path.startsWith('/')) return path
  if (path === '..') {
    const parts = cwd.split('/')
    parts.pop()
    return parts.length <= 1 ? '/' : parts.join('/')
  }
  if (path === '.') return cwd
  if (cwd === '/') return '/' + path
  return cwd + '/' + path
}

const commands: Record<string, (args: string[], cwd: string) => Promise<ShellResult>> = {
  help: async () => ({
    output: [
      'Available commands:',
      '  help          Show this help message',
      '  clear         Clear the terminal',
      '  pwd           Print working directory',
      '  ls [path]     List directory contents',
      '  cd <path>     Change directory',
      '  mkdir <name>  Create a directory',
      '  touch <name>  Create a file',
      '  cat <file>    Display file contents',
      '  echo <text>   Print text or redirect to file',
      '  rm <path>     Remove file or empty directory',
      '  rmdir <path>  Remove empty directory',
      '  whoami        Print current user',
      '  date          Print current date/time',
      '  uname         Print system info',
      '  history       Show command history',
      '  tree [path]   Show directory tree',
    ].join('\n'),
  }),

  clear: async () => ({ clear: true }),

  pwd: async (_args, cwd) => ({ output: cwd }),

  ls: async (args, cwd) => {
    const targetPath = args[0] ? await resolveCwd(cwd, args[0]) : cwd
    try {
      const node = await filesystemService.resolvePath(targetPath)
      if (!node) return { output: `ls: cannot access '${args[0] || targetPath}': No such file or directory`, isError: true }
      if (node.type === 'file') return { output: node.name }
      const items = await filesystemService.listDirectory(node.id)
      if (items.length === 0) return { output: '' }
      const names = items.map((item) =>
        item.type === 'folder' ? `\x1b[34m${item.name}/\x1b[0m` : item.name
      )
      return { output: names.join('  ') }
    } catch {
      return { output: `ls: cannot access '${args[0]}': No such file or directory`, isError: true }
    }
  },

  cd: async (args, cwd) => {
    if (args.length === 0 || args[0] === '~') {
      return { output: '', newCwd: '/home/user' }
    }
    const targetPath = await resolveCwd(cwd, args[0])
    try {
      const node = await filesystemService.resolvePath(targetPath)
      if (!node) return { output: `cd: no such file or directory: ${args[0]}`, isError: true }
      if (node.type !== 'folder') return { output: `cd: not a directory: ${args[0]}`, isError: true }
      return { output: '', newCwd: targetPath }
    } catch {
      return { output: `cd: no such file or directory: ${args[0]}`, isError: true }
    }
  },

  mkdir: async (args, cwd) => {
    if (args.length === 0) return { output: 'mkdir: missing operand', isError: true }
    const name = args[0]
    try {
      const parentNode = await filesystemService.resolvePath(cwd)
      if (!parentNode) return { output: `mkdir: cannot create directory '${name}'`, isError: true }
      await filesystemService.createFolder(name, parentNode.id)
      return { output: '' }
    } catch (e) {
      return { output: `mkdir: ${String(e)}`, isError: true }
    }
  },

  touch: async (args, cwd) => {
    if (args.length === 0) return { output: 'touch: missing file operand', isError: true }
    const name = args[0]
    try {
      const parentNode = await filesystemService.resolvePath(cwd)
      if (!parentNode) return { output: `touch: cannot create file '${name}'`, isError: true }
      await filesystemService.createFile(name, parentNode.id, '')
      return { output: '' }
    } catch (e) {
      return { output: `touch: ${String(e)}`, isError: true }
    }
  },

  cat: async (args, cwd) => {
    if (args.length === 0) return { output: 'cat: missing file operand', isError: true }
    const filePath = await resolveCwd(cwd, args[0])
    try {
      const node = await filesystemService.resolvePath(filePath)
      if (!node) return { output: `cat: ${args[0]}: No such file or directory`, isError: true }
      if (node.type === 'folder') return { output: `cat: ${args[0]}: Is a directory`, isError: true }
      return { output: node.content ?? '' }
    } catch {
      return { output: `cat: ${args[0]}: No such file or directory`, isError: true }
    }
  },

  echo: async (args, cwd) => {
    const full = args.join(' ')
    const redirectMatch = full.match(/^(.+?)\s*>\s*(.+)$/)
    if (redirectMatch) {
      const text = redirectMatch[1].replace(/^["']|["']$/g, '')
      const filePath = await resolveCwd(cwd, redirectMatch[2].trim())
      try {
        const parentParts = filePath.split('/')
        const fileName = parentParts.pop()!
        const parentPath = parentParts.join('/') || '/'
        const parentNode = await filesystemService.resolvePath(parentPath)
        if (!parentNode) return { output: `echo: cannot write to '${filePath}'`, isError: true }

        const existing = await filesystemService.resolvePath(filePath)
        if (existing) {
          await filesystemService.writeFile(existing.id, text)
        } else {
          await filesystemService.createFile(fileName, parentNode.id, text)
        }
        return { output: '' }
      } catch (e) {
        return { output: `echo: ${String(e)}`, isError: true }
      }
    }
    return { output: full.replace(/^["']|["']$/g, '') }
  },

  rm: async (args, cwd) => {
    if (args.length === 0) return { output: 'rm: missing operand', isError: true }
    const targetPath = await resolveCwd(cwd, args[0])
    try {
      const node = await filesystemService.resolvePath(targetPath)
      if (!node) return { output: `rm: cannot remove '${args[0]}': No such file or directory`, isError: true }
      if (node.type === 'folder' && args[0] !== '-r') {
        return { output: `rm: cannot remove '${args[0]}': Is a directory (use rm -r)`, isError: true }
      }
      await filesystemService.deleteNode(node.id)
      return { output: '' }
    } catch (e) {
      return { output: `rm: ${String(e)}`, isError: true }
    }
  },

  rmdir: async (args, cwd) => {
    if (args.length === 0) return { output: 'rmdir: missing operand', isError: true }
    const targetPath = await resolveCwd(cwd, args[0])
    try {
      const node = await filesystemService.resolvePath(targetPath)
      if (!node) return { output: `rmdir: failed to remove '${args[0]}': No such file or directory`, isError: true }
      if (node.type !== 'folder') return { output: `rmdir: failed to remove '${args[0]}': Not a directory`, isError: true }
      const children = await filesystemService.listDirectory(node.id)
      if (children.length > 0) {
        return { output: `rmdir: failed to remove '${args[0]}': Directory not empty`, isError: true }
      }
      await filesystemService.deleteNode(node.id)
      return { output: '' }
    } catch (e) {
      return { output: `rmdir: ${String(e)}`, isError: true }
    }
  },

  whoami: async () => ({ output: 'user' }),

  date: async () => ({ output: new Date().toString() }),

  uname: async () => ({ output: 'WebOS 1.0.0 Browser Runtime' }),

  history: async () => ({ output: '(command history is per-session)' }),

  tree: async (args, cwd) => {
    const targetPath = args[0] ? await resolveCwd(cwd, args[0]) : cwd
    try {
      const node = await filesystemService.resolvePath(targetPath)
      if (!node || node.type !== 'folder') {
        return { output: `tree: '${args[0] || targetPath}': No such directory`, isError: true }
      }

      const lines: string[] = [node.name]
      async function buildTree(folderId: string, prefix: string): Promise<void> {
        const items = await filesystemService.listDirectory(folderId)
        for (let i = 0; i < items.length; i++) {
          const isLast = i === items.length - 1
          const connector = isLast ? '└── ' : '├── '
          const childPrefix = isLast ? '    ' : '│   '
          lines.push(`${prefix}${connector}${items[i].name}`)
          if (items[i].type === 'folder') {
            await buildTree(items[i].id, prefix + childPrefix)
          }
        }
      }
      await buildTree(node.id, '')
      return { output: lines.join('\n') }
    } catch (e) {
      return { output: `tree: ${String(e)}`, isError: true }
    }
  },
}

export async function shellExecute(
  commandStr: string,
  cwd: string
): Promise<ShellResult> {
  const parts = commandStr.trim().split(/\s+/)
  const cmd = parts[0]
  const args = parts.slice(1)

  const handler = commands[cmd]
  if (!handler) {
    return {
      output: `${cmd}: command not found. Type "help" for available commands.`,
      isError: true,
    }
  }

  return handler(args, cwd)
}
