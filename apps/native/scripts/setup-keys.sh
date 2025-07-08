#!/bin/bash

# Tauri Code Signing Setup Script
# This script helps developers set up Tauri signing keys properly

set -e

echo "🔐 Tauri Code Signing Setup"
echo "=========================="
echo ""

KEYS_DIR="$(dirname "$0")/../src-tauri/keys"
PUBLIC_KEY_FILE="$KEYS_DIR/public.key"
PRIVATE_KEY_PATH="$HOME/.tauri/prompalette.key"
PUBLIC_KEY_PATH="$HOME/.tauri/prompalette.key.pub"

# Create keys directory
mkdir -p "$KEYS_DIR"

# Check if keys already exist
if [[ -f "$PRIVATE_KEY_PATH" ]] && [[ -f "$PUBLIC_KEY_PATH" ]]; then
    echo "✅ Tauri signing keys already exist"
    echo "   Private: $PRIVATE_KEY_PATH"
    echo "   Public:  $PUBLIC_KEY_PATH"
    echo ""
    
    # Copy public key to project
    if [[ -f "$PUBLIC_KEY_PATH" ]]; then
        cp "$PUBLIC_KEY_PATH" "$PUBLIC_KEY_FILE"
        echo "✅ Copied public key to project: $PUBLIC_KEY_FILE"
    fi
    
    echo ""
    echo "🔑 Next steps:"
    echo "1. Add the following to GitHub Secrets:"
    echo "   - TAURI_PRIVATE_KEY: (content of $PRIVATE_KEY_PATH)"
    echo "   - TAURI_KEY_PASSWORD: (password you set for the key)"
    echo ""
    echo "2. Test the setup:"
    echo "   pnpm build"
    echo ""
    exit 0
fi

# Generate new keys
echo "🔑 Generating new Tauri signing keys..."
echo ""

# Check if tauri CLI is available
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Please install pnpm first:"
    echo "   npm install -g pnpm"
    exit 1
fi

# Generate keys
cd "$(dirname "$0")/.."
if pnpm tauri signer generate -w "$PRIVATE_KEY_PATH"; then
    echo ""
    echo "✅ Keys generated successfully!"
    echo ""
    
    # Copy public key to project
    if [[ -f "$PUBLIC_KEY_PATH" ]]; then
        cp "$PUBLIC_KEY_PATH" "$PUBLIC_KEY_FILE"
        echo "✅ Copied public key to project: $PUBLIC_KEY_FILE"
    else
        echo "❌ Public key not found: $PUBLIC_KEY_PATH"
        exit 1
    fi
    
    echo ""
    echo "📁 Key locations:"
    echo "   Private key: $PRIVATE_KEY_PATH"
    echo "   Public key:  $PUBLIC_KEY_PATH"
    echo "   Project public key: $PUBLIC_KEY_FILE"
    echo ""
    echo "🔐 Next steps:"
    echo ""
    echo "1. Set a password for your private key (remember this!)"
    echo ""
    echo "2. Add to GitHub Secrets:"
    echo "   - TAURI_PRIVATE_KEY:"
    echo "     cat $PRIVATE_KEY_PATH"
    echo ""
    echo "   - TAURI_KEY_PASSWORD: (your password)"
    echo ""
    echo "3. Test the setup:"
    echo "   pnpm build"
    echo ""
    echo "⚠️  IMPORTANT: Keep your private key secure and never commit it!"
    echo ""
else
    echo "❌ Failed to generate Tauri signing keys"
    exit 1
fi