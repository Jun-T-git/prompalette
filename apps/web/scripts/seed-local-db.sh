#!/bin/bash

# Reset local Supabase database with development data
# This script should ONLY be used in local development environments

set -e

echo "🌱 Resetting local Supabase database with development data..."

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: supabase/config.toml not found. Please run this script from the web app root directory."
    exit 1
fi

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if local Supabase is running
if ! supabase status &> /dev/null; then
    echo "❌ Error: Local Supabase is not running. Please start it first:"
    echo "   supabase start"
    exit 1
fi

# Confirm we're in development
echo "⚠️  This will reset all data in your LOCAL Supabase database."
echo "   Environment check:"
echo "   - Node environment: ${NODE_ENV:-development}"
DB_URL=$(supabase status | grep 'DB URL' | awk '{print $3}')
echo "   - Database: $DB_URL"

read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled by user"
    exit 1
fi

# Reset the database (local only) - this will automatically run seed-development.sql
echo "🏃 Resetting local database with seed data..."
if supabase db reset --local; then
    echo "✅ Database reset and seeded successfully!"
    echo ""
    echo "🎉 Local database is ready with:"
    echo "   - 10 test users (including stub-user)"
    echo "   - 100 sample prompts"
    echo "   - Realistic data for testing"
    echo ""
    echo "🔗 Access your local Supabase dashboard at:"
    STUDIO_URL=$(supabase status | grep 'Studio URL' | awk '{print $3}')
    echo "   $STUDIO_URL"
else
    echo "❌ Error resetting database"
    exit 1
fi