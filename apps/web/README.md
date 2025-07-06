# @prompalette/web

Web application for PromPalette - A powerful prompt management tool for AI enthusiasts.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server (uses mock database)
pnpm dev

# Run tests
pnpm test
```

For full database functionality, see [Database Setup Guide](./docs/DATABASE_SETUP.md).

## Development

### Prerequisites
- Node.js 18+ and pnpm
- Optional: Supabase account for real database

### Scripts
```bash
pnpm dev          # Start development server
pnpm build        # Build for production  
pnpm start        # Start production server
pnpm test         # Run test suite
pnpm test:watch   # Run tests in watch mode
pnpm lint         # Run linter
pnpm typecheck    # Run TypeScript checks
```

### Database Setup
The application supports three database modes via `DATABASE_MODE` environment variable:

1. **Test Mode** (`DATABASE_MODE=test`): Always uses mock client for testing
2. **Development Mode** (`DATABASE_MODE=development`): Optional real Supabase connection with mock fallback
3. **Production Mode** (`DATABASE_MODE=production`): Requires real database, fails fast if missing

For detailed setup instructions, see [Database Setup Guide](./docs/DATABASE_SETUP.md).

## Architecture

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL + Auth + Real-time)
- **Styling**: Tailwind CSS + Custom Design System
- **Components**: Shared components from @prompalette/ui
- **Testing**: Vitest + Testing Library
- **Type Safety**: TypeScript throughout

## Key Features

- 🚀 **Prompt Management**: Create, edit, and organize AI prompts
- 🔐 **Authentication**: OAuth (Google, GitHub) + Email/Password
- 🌍 **Sharing**: Private/Public prompt sharing
- 🔍 **Search**: Full-text search with tagging
- 📱 **Responsive**: Mobile-first design
- 🔄 **Sync**: Desktop app integration

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make changes with tests
4. Run `pnpm lint && pnpm test`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.