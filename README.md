# WebOS

A browser-based operating system simulation built with React, TypeScript, and modern web technologies.

## Features

- **Desktop Environment** — Full-screen wallpaper, draggable desktop icons, right-click context menu
- **Window Manager** — Drag, resize, minimize, maximize, close, and focus windows with proper z-index management
- **Taskbar** — Running application indicators, system tray with clock, battery, and network status
- **Start Menu** — Application launcher with search filtering, settings access
- **File Manager** — Browse, create, rename, delete files and folders with grid/list view toggle
- **Text Editor** — Edit and save text files with dirty state indicator and keyboard shortcuts (Ctrl+S)
- **Terminal** — Simulated shell with filesystem commands (ls, cd, mkdir, touch, cat, echo, rm, tree, etc.)
- **Browser** — iframe-based web browser with address bar, navigation, and fallback for restricted sites
- **Settings** — Theme switching (dark/light), wallpaper selection, storage info, system reset
- **Notification System** — Toast notifications with success, info, warning, and error types
- **Virtual Filesystem** — IndexedDB-backed persistent filesystem shared across all applications
- **OS API Layer** — Centralized service layer for filesystem, windows, notifications, and settings

## Screenshots

<!-- Add screenshots here -->

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint
npm run lint
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Persistence | Dexie.js (IndexedDB) |
| Icons | Lucide React |

## Architecture

```
src/
├── apps/                    # Application components
│   ├── browser/
│   ├── file-manager/
│   ├── settings/
│   ├── terminal/
│   └── text-editor/
├── components/              # Shared UI components
│   ├── desktop/
│   ├── taskbar/
│   ├── window/
│   ├── start-menu/
│   ├── notifications/
│   └── ui/
├── core/                    # Core OS services (no React dependency)
│   ├── applications/        # Application registry
│   ├── filesystem/          # Virtual filesystem service
│   ├── os/                  # OS API layer
│   ├── terminal/            # Shell parser and command registry
│   └── window-manager/      # Window management service
├── stores/                  # Zustand state stores
├── database/                # Dexie/IndexedDB configuration
├── types/                   # TypeScript type definitions
└── __tests__/               # Unit tests
```

### Design Principles

- **Layered Architecture** — UI → Application Layer → OS API → Core Services → Persistence
- **Separation of Concerns** — Filesystem logic is independent of React. Terminal commands are independent of Terminal UI.
- **Modular Applications** — New apps can be added by registering in the application registry without rewriting core systems.
- **Centralized State** — Separate Zustand stores for windows, desktop, settings, notifications, and filesystem.

## Project Structure

```
WebOS
├── Desktop
│   ├── Wallpaper
│   ├── Desktop Icons (draggable, persisted)
│   └── Windows
├── Window Manager
│   ├── Drag / Resize
│   ├── Minimize / Maximize / Close
│   ├── Focus Management
│   └── Z-Index Stacking
├── Taskbar
│   ├── Start Button
│   ├── Running App Indicators
│   ├── System Tray (network, battery, clock)
│   └── Notification Area
├── Start Menu
│   ├── Application List
│   ├── Search
│   ├── Settings
│   └── Power
├── Applications
│   ├── File Manager
│   ├── Terminal
│   ├── Text Editor
│   ├── Browser
│   └── Settings
├── Notification System
└── Virtual Filesystem (IndexedDB)
```

## Persistence

After page refresh, WebOS preserves:
- Virtual filesystem (files and folders)
- Settings (theme, wallpaper)
- Desktop icon positions

## Future Roadmap

- **v1** — Desktop environment
- **v2** — Virtual filesystem
- **v3** — Process manager
- **v4** — PWA/offline support
- **v5** — WebAssembly applications
- **v6** — Plugin system
- **v7** — AI OS assistant

## License

MIT
