# 📊 Database Setup Guide

This guide helps you set up the database for PromPalette web application development.

## Quick Start (Development)

For rapid MVP development, you can start without configuring a real database. The application will use a mock client with console warnings.

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Start development (uses mock database)
pnpm dev
```

You'll see warnings like:
```
🔶 Using mock Supabase client - configure real database for full functionality
```

## Full Database Setup (Recommended)

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Sign in
3. Click "New Project"
4. Fill in project details:
   - **Name**: `prompalette-dev` (or your preference)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to you

### 2. Get Configuration Values

After project creation:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Update Environment Variables

Edit `.env.local`:

```bash
# Replace with your actual values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Set database mode
DATABASE_MODE=development
```

### 4. Database Schema Setup

**Note**: Automated migration scripts are planned for the next development phase. For now, database schema will be created automatically when you first use real database operations.

For manual setup (advanced users):
```sql
-- You can run these manually in Supabase SQL editor if needed
-- See src/lib/database/schema.ts for table definitions
```

## Database Schema

The application uses the following main tables:

### Users
- User authentication and profile information
- Linked to Supabase Auth users

### Prompts  
- Core prompt data with content and metadata
- Row Level Security (RLS) for privacy controls

### Tags
- Categorization system for prompts

### Prompt Tags
- Many-to-many relationship between prompts and tags

## Development Modes

### Test Mode
```bash
DATABASE_MODE=test
```
- Always uses mock client
- Perfect for unit testing
- No external dependencies

### Development Mode  
```bash
DATABASE_MODE=development
```
- Uses real database if configured
- Falls back to mock client with warnings
- Ideal for feature development

### Production Mode
```bash
DATABASE_MODE=production
```
- Requires real database configuration
- Fails fast if configuration missing
- Use for staging/production deployments

## Row Level Security (RLS)

The database implements RLS policies for:

- **Private Prompts**: Only accessible by creator
- **Public Prompts**: Readable by everyone
- **User Data**: Only accessible by the user

These policies are automatically applied and enforced at the database level.

## Troubleshooting

### "Database configuration missing" Error

**Cause**: Missing or invalid Supabase configuration in production mode.

**Solution**:
1. Verify `.env.local` has correct values
2. Check Supabase project is active
3. Confirm API keys are valid

### Mock Client Warnings

**Cause**: Running in development mode without real database.

**Solution**: Follow the "Full Database Setup" steps above, or ignore if intentional.

### Connection Timeout

**Cause**: Network issues or invalid Supabase URL.

**Solution**:
1. Check internet connectivity
2. Verify Supabase project URL
3. Confirm project is not paused (free tier limitation)

## Next Steps

1. **Authentication Setup**: Configure Supabase Auth providers (Google, GitHub)
2. **Data Migration**: Import existing prompts (from desktop app)
3. **Backup Strategy**: Set up automated backups for production

## Security Notes

- **Never commit** `.env.local` to version control
- **Service role key** has admin privileges - keep secure
- **Anon key** is safe for client-side use (has limited permissions)
- RLS policies provide data isolation between users

For questions, check the main project documentation or create an issue.