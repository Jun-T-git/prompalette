# @prompalette/web

PromPalette Web Application - Next.js 14 App Router

## 🚀 Quick Start

```bash
# Install dependencies (from root)
pnpm install

# Run development server
pnpm --filter @prompalette/web dev

# Build for production
pnpm --filter @prompalette/web build

# Run tests
pnpm --filter @prompalette/web test
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utility functions
└── test/                  # Test configuration
```

## 🧪 Testing

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## 🎨 Styling

- Uses Tailwind CSS
- Imports shared UI components from `@prompalette/ui`
- Supports dark/light theme via CSS variables

## 🔧 Configuration

- `next.config.mjs`: Next.js configuration
- `tailwind.config.ts`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `vitest.config.ts`: Test configuration

## 📦 Dependencies

- **Next.js 14**: React framework with App Router
- **@prompalette/core**: Business logic
- **@prompalette/ui**: Shared UI components
- **@prompalette/api-client**: API communication