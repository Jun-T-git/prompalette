# @prompalette/api

PromPalette API Server - Hono REST API

## 🚀 Quick Start

```bash
# Install dependencies (from root)
pnpm install

# Run development server
pnpm --filter @prompalette/api dev

# Build for production
pnpm --filter @prompalette/api build

# Start production server
pnpm --filter @prompalette/api start

# Run tests
pnpm --filter @prompalette/api test
```

## 📁 Project Structure

```
src/
├── index.ts           # Main server entry point
├── routes/            # API route handlers
│   ├── health.ts     # Health check endpoints
│   ├── prompts.ts    # Prompt CRUD operations
│   └── *.test.ts     # Route tests
```

## 🔌 API Endpoints

### Health Check
- `GET /api/v1/health` - Server health status

### Prompts
- `GET /api/v1/prompts` - List all prompts
- `GET /api/v1/prompts/:id` - Get specific prompt
- `POST /api/v1/prompts` - Create new prompt
- `PUT /api/v1/prompts/:id` - Update prompt
- `DELETE /api/v1/prompts/:id` - Delete prompt
- `POST /api/v1/prompts/:id/usage` - Increment usage count

### Query Parameters
- `?status=active` - Filter by status (draft, active, archived)
- `?visibility=private` - Filter by visibility (private, public, shared)
- `?tagId=tag-1` - Filter by tag ID
- `?workspaceId=workspace-1` - Filter by workspace ID

## 🧪 Testing

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## 🔧 Configuration

### Environment Variables
- `NODE_ENV` - Environment (development, production, test)
- `PORT` - Server port (default: 8080)
- `CORS_ORIGINS` - Comma-separated CORS origins (default: localhost:3000,localhost:5173)
- `LOG_LEVEL` - Log level (fatal, error, warn, info, debug, trace)

### Production Deployment
```bash
# Set production environment
export NODE_ENV=production
export PORT=3000
export CORS_ORIGINS=https://app.prompalette.com
export LOG_LEVEL=warn

# Start server
pnpm start
```

## 📦 Dependencies

- **Hono**: Fast web framework for edge runtime
- **@prompalette/core**: Business logic and validation
- **Pino**: High-performance JSON logger
- **Zod**: Runtime type validation
- **hono/cors**: Built-in CORS middleware
- **hono/logger**: Built-in request logging middleware

## 🏗️ Architecture

### Storage Layer
- `InMemoryPromptStorage`: Development/testing storage
- Designed for easy database integration (PostgreSQL, MongoDB, etc.)
- Interface-based design for storage abstraction

### Logging
- Structured JSON logging with Pino
- Development: Pretty-printed logs
- Production: JSON format for log aggregation
- Configurable log levels

### Environment Management
- Type-safe environment validation with Zod
- Separate configurations for dev/prod
- CORS origins configurable per environment