#!/bin/bash

echo "🔐 Tauri Update Signing Key Generator"
echo "===================================="
echo ""

# Check if tauri CLI is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Cargo not found. Please install Rust first:"
    echo "   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

# Install tauri-cli if not already installed
if ! cargo install --list | grep -q "tauri-cli"; then
    echo "📦 Installing tauri-cli..."
    cargo install tauri-cli
fi

# Change to native app directory
cd apps/native

# Check if keys already exist
if [ -f "~/.tauri/prompalette.key" ] && [ -f "~/.tauri/prompalette.key.pub" ]; then
    echo "⚠️  Keys already exist at:"
    echo "   Private: ~/.tauri/prompalette.key"
    echo "   Public:  ~/.tauri/prompalette.key.pub"
    echo ""
    read -p "Generate new keys? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing keys."
        exit 0
    fi
fi

# Generate new keys
echo ""
echo "🔑 Generating new Tauri signing keys..."
echo ""

# Create .tauri directory if it doesn't exist
mkdir -p ~/.tauri

# Generate keys with tauri
pnpm tauri signer generate -w ~/.tauri/prompalette.key

echo ""
echo "✅ Keys generated successfully!"
echo ""
echo "📁 Key locations:"
echo "   Private key: ~/.tauri/prompalette.key"
echo "   Public key:  ~/.tauri/prompalette.key.pub"
echo ""
echo "🔐 Next steps:"
echo ""
echo "1. Set a password for your private key (remember this!):"
echo "   export TAURI_KEY_PASSWORD='your-secure-password'"
echo ""
echo "2. Get the private key for GitHub Secrets:"
echo "   cat ~/.tauri/prompalette.key"
echo ""
echo "3. Get the public key for tauri.conf.json:"
echo "   cat ~/.tauri/prompalette.key.pub"
echo ""
echo "4. Add to GitHub Secrets:"
echo "   - TAURI_PRIVATE_KEY: (content of private key)"
echo "   - TAURI_KEY_PASSWORD: (your password)"
echo ""
echo "5. Update tauri.conf.json with public key:"
echo "   \"updater\": {"
echo "     \"pubkey\": \"(content of public key)\""
echo "   }"
echo ""
echo "⚠️  IMPORTANT: Keep your private key secure and never commit it!"