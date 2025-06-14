# @prompalette/api

PromPalette API Server - Lightweight Hono REST API with file-based storage

## 🚀 Quick Start

```bash
# Install dependencies (from root)
pnpm install

# Copy environment configuration
cp .env.example .env.local

# Generate secure API key for development
openssl rand -hex 32

# Set the API key in .env.local
echo "DEMO_API_KEY=prm_your_generated_key_here" >> .env.local

# Run development server
pnpm --filter @prompalette/api dev

# Run tests
pnpm --filter @prompalette/api test
```

## 📁 Project Structure

```
src/
├── index.ts              # Main server entry point
├── config/              # Configuration and environment
│   ├── env.ts           # Environment validation
│   ├── errors.ts        # Error codes and handling
│   └── logger.ts        # Pino logger configuration
├── middleware/          # Hono middleware
│   └── auth.ts          # Authentication and request ID middleware
├── routes/              # API route handlers
│   ├── health.ts        # Health check endpoints
│   └── prompts.ts       # Prompt CRUD operations
├── services/            # Business logic services
│   ├── auth.ts          # Authentication service
│   └── fileStorage.ts   # File-based JSON storage
└── *.test.ts           # Test files
```

## 🔌 API Endpoints

All endpoints require authentication with API key in Authorization header:
```
Authorization: Bearer prm_your_api_key_here
```

### Health Check
- `GET /api/v1/health` - Server health status (no auth required)

### Prompts
- `GET /api/v1/prompts` - List all prompts with filtering
- `GET /api/v1/prompts/:id` - Get specific prompt by ID
- `POST /api/v1/prompts` - Create new prompt
- `PUT /api/v1/prompts/:id` - Update existing prompt
- `DELETE /api/v1/prompts/:id` - Delete prompt
- `POST /api/v1/prompts/:id/usage` - Increment usage count

### Query Parameters
- `?status=active` - Filter by status (draft, active, archived)
- `?visibility=private` - Filter by visibility (private, public, shared)
- `?tagId=tag-1` - Filter by tag ID
- `?workspaceId=workspace-1` - Filter by workspace ID

### Example Request
```bash
curl -H "Authorization: Bearer prm_demo_key_for_development_only" \
     -H "Content-Type: application/json" \
     -d '{"title":"My Prompt","content":"Hello {{name}}!","workspaceId":"wsp_demo"}' \
     http://localhost:8080/api/v1/prompts
```

## 🧪 Testing

```bash
# Run tests once
pnpm test

# Run tests in watch mode  
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## 🔧 Configuration

### Environment Variables
Create `.env.local` file with:

```env
# Required: API key for development/testing
DEMO_API_KEY=prm_your_generated_key_here

# Optional: Server configuration
NODE_ENV=development
PORT=8080
LOG_LEVEL=info
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Optional: Storage configuration
DATABASE_PATH=./data/prompts.json
```

### Generate Secure API Key
```bash
# Generate 64-character hex key
openssl rand -hex 32

# Or use Node.js
node -e "console.log('prm_' + require('crypto').randomBytes(32).toString('hex'))"
```

### Production Deployment
```bash
# Set production environment
export NODE_ENV=production
export PORT=3000
export CORS_ORIGINS=https://app.prompalette.com
export LOG_LEVEL=warn
export DEMO_API_KEY=prm_your_production_key_here

# Start server
pnpm start
```

## 🔐 Security Features

- **API Key Authentication**: SHA-256 hashed keys with bearer token format
- **Request ID Tracking**: Unique ID for each request for debugging
- **Audit Logging**: Complete access logs for compliance
- **Security Headers**: CSP, HSTS, and other security headers
- **Input Validation**: Zod schema validation for all inputs
- **Error Handling**: Sanitized error responses without sensitive data

## 📦 Dependencies

- **Hono v3.12.8**: Fast web framework for edge runtime
- **@prompalette/core**: Shared types and validation schemas
- **Pino**: High-performance JSON logger  
- **Zod**: Runtime type validation
- **Node.js built-ins**: fs, crypto, path for file operations

## 🏗️ Architecture

### Storage Layer
- **FileStorage**: JSON file-based persistence for development
- **Atomic Operations**: Safe concurrent access with file locking
- **Sample Data**: Pre-seeded demo prompts in development mode
- **Audit Trail**: Complete access logging for security compliance

### Authentication
- **API Key Based**: Simple bearer token authentication
- **User Management**: Basic user and workspace concepts
- **Permission System**: Read/write/admin permission levels
- **Development Mode**: Auto-seeded demo user and API key

### Logging & Monitoring
- **Structured Logging**: JSON format with Pino for production
- **Request Tracing**: Unique request IDs for debugging
- **Security Events**: Authentication failures and access patterns
- **Performance Metrics**: Response times and error rates

### Error Handling
- **Standardized Responses**: Consistent error format across API
- **Request Context**: Error responses include request ID for tracing
- **Input Validation**: Detailed validation error messages
- **Security**: No sensitive information leaked in error responses

## 🚀 Development

### Local Development
```bash
# Start development server with hot reload
pnpm dev

# View logs in pretty format
tail -f logs/development.log | pnpm exec pino-pretty

# Test API endpoints
curl -H "Authorization: Bearer prm_demo_key_for_development_only" \
     http://localhost:8080/api/v1/health
```

### Adding New Endpoints
1. Create route handler in `src/routes/`
2. Add authentication middleware if needed
3. Implement corresponding tests
4. Update this README with endpoint documentation

### Database Schema
The file storage uses this JSON structure:
```json
{
  "users": { "userId": { "id", "email", "name", "workspaces", "permissions" } },
  "apiKeys": { "keyHash": { "id", "keyHash", "userId", "name", "permissions" } },
  "prompts": { "promptId": { "id", "title", "content", "workspaceId", "..." } },
  "auditLogs": [{ "id", "promptId", "userId", "action", "timestamp", "..." }]
}
```

## 📋 TODO / Future Improvements

- [ ] Database migration from file storage to PostgreSQL/SQLite
- [ ] Rate limiting per API key
- [ ] Workspace-based access control
- [ ] Prompt versioning and history
- [ ] Search and full-text indexing
- [ ] Batch operations for prompts
- [ ] API documentation with OpenAPI/Swagger
- [ ] Docker containerization
- [ ] Metrics and monitoring dashboard