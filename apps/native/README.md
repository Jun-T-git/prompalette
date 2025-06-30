# PromPalette Native App

Desktop application built with Tauri, React, and TypeScript for macOS.

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Rust + Tauri
- **Database**: SQLite
- **State Management**: Zustand

## Key Features

- Local-first prompt storage
- Fuzzy search with scoring
- Keyboard shortcuts and navigation
- Pin system for favorite prompts
- Tag-based organization
- Optional title support

## Distribution

The build process creates a DMG installer for macOS with universal support (Intel + Apple Silicon).