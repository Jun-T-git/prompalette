# PromPalette Native App

Desktop application built with Tauri, React, and TypeScript for macOS.

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev                    # Development environment
pnpm dev:staging           # Staging environment

# Build for production
pnpm build
pnpm tauri:build:dev       # Development build
pnpm tauri:build:staging   # Staging build
pnpm tauri:build:production # Production build
```

### Environment Separation

The app supports independent installations for different environments:

- **Development**: `PromPalette Dev` - Data stored in `PromPalette-Dev/` directory
- **Staging**: `PromPalette Staging` - Data stored in `PromPalette-Staging/` directory  
- **Production**: `PromPalette` - Data stored in `PromPalette/` directory

Each environment uses separate:
- App identifiers (`com.prompalette.app.dev`, etc.)
- Database files (`prompalette-dev.db`, etc.)
- Data directories
- Window titles for visual identification

Control via `APP_ENV` environment variable: `development`, `staging`, `production`.

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