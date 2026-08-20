# WebOS

A web-based operating system simulation built with React and TypeScript.

## Purpose

WebOS is a personal software engineering project exploring how the concepts and user experience of a desktop operating system can be recreated inside a web browser.

The project is **not intended to be a real operating system**. Instead, it aims to provide a browser-based desktop environment with its own applications, window management, virtual filesystem, terminal, and system services.

The project is also designed as a foundation for experimenting with more advanced technologies such as WebAssembly, browser-based process management, offline applications, and AI-powered system interaction.

## Project Goals

The main goals of WebOS are to:

* Explore desktop environment and window manager architecture.
* Build a reusable application system inside a web application.
* Implement a persistent virtual filesystem using IndexedDB.
* Create a browser-based terminal that interacts with the virtual filesystem.
* Practice scalable frontend architecture with React and TypeScript.
* Explore browser capabilities such as Web Workers, PWA, and WebAssembly.
* Eventually experiment with an AI assistant that can interact with the WebOS environment through controlled APIs.

## Planned Features

### MVP

* Desktop environment
* Window manager
* Taskbar
* Start menu
* Application launcher
* File manager
* Virtual filesystem
* Text editor
* Terminal
* Browser application
* Settings
* Notifications
* Persistent local storage

### Future Development

```text
v1 — Desktop Environment
v2 — Virtual Filesystem
v3 — Process Manager
v4 — PWA / Offline Support
v5 — WebAssembly Applications
v6 — Plugin System
v7 — AI OS Assistant
```

## Architecture

The project is designed around a layered architecture:

```text
┌───────────────────────────────┐
│         User Interface        │
│ Desktop / Windows / Taskbar   │
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│        Applications           │
│ Files / Terminal / Editor     │
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│           WebOS API           │
│ Filesystem / Windows / Apps   │
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│        Core Services          │
│ Window Manager / Filesystem   │
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│          Persistence          │
│          IndexedDB            │
└───────────────────────────────┘
```

The separation between applications and core OS services is intentional. It should allow new applications and capabilities to be added without rewriting the underlying system.

## Technology

* React
* TypeScript
* Vite
* Tailwind CSS
* Zustand
* Dexie.js
* IndexedDB
* Lucide React

## Status

🚧 **Currently under development**

The project is being developed incrementally, starting with the desktop environment and window management system before moving toward the virtual filesystem and applications.

## Why Build This?

Instead of building another conventional CRUD application, this project is intended to explore a more systems-oriented approach to web development.

It combines:

* Frontend engineering
* State management
* UI architecture
* Data persistence
* Application lifecycle management
* Filesystem concepts
* Command-line interfaces
* Browser APIs
* WebAssembly
* AI integration

The long-term goal is to see how far a modern web application can go toward providing an operating-system-like environment while remaining entirely within the browser.

## License

This project is currently intended as a personal learning and portfolio project.
