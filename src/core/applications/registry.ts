import type { OSApplication } from '../../types'

class ApplicationRegistry {
  private apps: Map<string, OSApplication> = new Map()

  register(app: OSApplication): void {
    this.apps.set(app.id, app)
  }

  get(id: string): OSApplication | undefined {
    return this.apps.get(id)
  }

  getAll(): OSApplication[] {
    return Array.from(this.apps.values())
  }

  getByName(name: string): OSApplication | undefined {
    return Array.from(this.apps.values()).find(
      (app) => app.name.toLowerCase() === name.toLowerCase()
    )
  }
}

export const applicationRegistry = new ApplicationRegistry()
