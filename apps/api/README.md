# @prompalette/api

REST API server built with Hono and file-based storage.

## Development

```bash
# Install dependencies
pnpm install

# Copy environment configuration
cp .env.example .env.local

# Start development server
pnpm dev

# Run tests
pnpm test
```

## Architecture

- **Framework**: Hono v3
- **Storage**: File-based JSON storage
- **Authentication**: API key based
- **Validation**: Zod schemas from @prompalette/core

## API Endpoints

- `GET /api/v1/health` - Health check
- `GET /api/v1/prompts` - List prompts
- `POST /api/v1/prompts` - Create prompt
- `PUT /api/v1/prompts/:id` - Update prompt
- `DELETE /api/v1/prompts/:id` - Delete prompt