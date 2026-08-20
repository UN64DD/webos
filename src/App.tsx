import { useEffect, useState } from 'react'
import { applicationRegistry } from './core/applications/registry'
import { os } from './core/os/api'
import { Desktop } from './components/desktop/Desktop'

import {
  FolderOpen,
  Terminal,
  FileText,
  Globe,
  Settings,
} from 'lucide-react'

import { FileManagerApp } from './apps/file-manager/FileManagerApp'
import { TextEditorApp } from './apps/text-editor/TextEditorApp'
import { TerminalApp } from './apps/terminal/TerminalApp'
import { BrowserApp } from './apps/browser/BrowserApp'
import { SettingsApp } from './apps/settings/SettingsApp'

const iconSize = 32

function registerApps() {
  applicationRegistry.register({
    id: 'file-manager',
    name: 'Files',
    icon: <FolderOpen size={iconSize} className="text-yellow-400" />,
    component: FileManagerApp,
    defaultWidth: 750,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
  })

  applicationRegistry.register({
    id: 'terminal',
    name: 'Terminal',
    icon: <Terminal size={iconSize} className="text-green-400" />,
    component: TerminalApp,
    defaultWidth: 680,
    defaultHeight: 450,
    minWidth: 400,
    minHeight: 250,
  })

  applicationRegistry.register({
    id: 'text-editor',
    name: 'Text Editor',
    icon: <FileText size={iconSize} className="text-blue-400" />,
    component: TextEditorApp,
    defaultWidth: 650,
    defaultHeight: 480,
    minWidth: 350,
    minHeight: 250,
  })

  applicationRegistry.register({
    id: 'browser',
    name: 'Browser',
    icon: <Globe size={iconSize} className="text-cyan-400" />,
    component: BrowserApp,
    defaultWidth: 900,
    defaultHeight: 600,
    minWidth: 500,
    minHeight: 350,
  })

  applicationRegistry.register({
    id: 'settings',
    name: 'Settings',
    icon: <Settings size={iconSize} className="text-os-text-secondary" />,
    component: SettingsApp,
    defaultWidth: 650,
    defaultHeight: 450,
    minWidth: 500,
    minHeight: 350,
  })
}

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      registerApps()
      await os.filesystem.initializeFilesystem()
      setReady(true)
    }
    init()
  }, [])

  if (!ready) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-os-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-os-accent to-purple-500 animate-pulse" />
          <span className="text-sm text-os-text-secondary">Starting WebOS...</span>
        </div>
      </div>
    )
  }

  return <Desktop />
}
