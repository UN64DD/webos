import Dexie, { type EntityTable } from 'dexie'
import type { FileNode } from '../types'

class WebOSDatabase extends Dexie {
  files!: EntityTable<FileNode, 'id'>

  constructor() {
    super('WebOS')
    this.version(1).stores({
      files: 'id, parentId, name, type',
    })
  }
}

export const db = new WebOSDatabase()
