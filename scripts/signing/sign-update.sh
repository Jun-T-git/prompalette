#!/bin/bash
# Tauri Auto-Update Signing Script - Ed25519 Implementation

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1" >&2; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1" >&2; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# Usage check
if [ $# -ne 3 ]; then
    echo "Usage: $0 <environment> <update_file> <version>"
    echo "Environment: staging|production"
    echo "Example: $0 production app.dmg 0.2.1"
    exit 1
fi

ENV="$1"
UPDATE_FILE="$2"
VERSION="$3"

# Validate inputs
if [[ ! "$ENV" =~ ^(staging|production)$ ]]; then
    log_error "Invalid environment: $ENV (must be staging or production)"
    exit 1
fi

if [ ! -f "$UPDATE_FILE" ]; then
    log_error "Update file not found: $UPDATE_FILE"
    exit 1
fi

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    log_error "Invalid version format: $VERSION (expected semver x.y.z)"
    exit 1
fi

# Check required environment variable
if [ "$ENV" = "staging" ]; then
    PRIVATE_KEY_VAR="STAGING_SIGNING_PRIVATE_KEY"
else
    PRIVATE_KEY_VAR="PRODUCTION_SIGNING_PRIVATE_KEY"
fi

if [ -z "${!PRIVATE_KEY_VAR:-}" ]; then
    log_error "$PRIVATE_KEY_VAR environment variable is required"
    exit 1
fi

log_info "Signing $ENV update: $(basename "$UPDATE_FILE") v$VERSION"

# Create secure temporary workspace
TEMP_DIR=$(mktemp -d)
cleanup() { 
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
}
trap cleanup EXIT

# Setup private key
PRIVATE_KEY="$TEMP_DIR/private.pem"
echo "${!PRIVATE_KEY_VAR}" | base64 -d > "$PRIVATE_KEY"
chmod 600 "$PRIVATE_KEY"

# Validate private key
if ! openssl pkey -in "$PRIVATE_KEY" -text -noout >/dev/null 2>&1; then
    log_error "Invalid Ed25519 private key"
    exit 1
fi

# Sign the update file  
SIGNATURE_FILE="$TEMP_DIR/signature.sig"

# Check OpenSSL version for Ed25519 support
OPENSSL_VERSION=$(openssl version | cut -d' ' -f2)
log_info "Using OpenSSL version: $OPENSSL_VERSION"

# Ed25519 signing - try pkeyutl first, then fallback methods
if openssl pkeyutl -sign -inkey "$PRIVATE_KEY" -in "$UPDATE_FILE" -out "$SIGNATURE_FILE" 2>/dev/null; then
    log_info "Signed using pkeyutl"
elif openssl pkeyutl -sign -inkey "$PRIVATE_KEY" -rawin -in "$UPDATE_FILE" -out "$SIGNATURE_FILE" 2>/dev/null; then
    log_info "Signed using pkeyutl with -rawin flag"
else
    log_error "Ed25519 signing failed. OpenSSL may not support Ed25519 with pkeyutl."
    log_error "OpenSSL version: $(openssl version)"
    log_error "Available algorithms: $(openssl list -public-key-algorithms | grep -i ed25519 || echo 'Ed25519 not found')"
    
    # Check if key is actually Ed25519
    KEY_INFO=$(openssl pkey -in "$PRIVATE_KEY" -text -noout 2>/dev/null | head -1)
    log_error "Key type: $KEY_INFO"
    exit 1
fi

# Convert signature to base64
SIGNATURE_B64="$TEMP_DIR/signature.base64"
base64 -i "$SIGNATURE_FILE" -o "$SIGNATURE_B64"
SIGNATURE=$(cat "$SIGNATURE_B64")

log_success "File signed successfully"

# Generate Tauri manifest
MANIFEST="$TEMP_DIR/latest.json"
FILENAME=$(basename "$UPDATE_FILE")

# Determine download URL
if [ "$ENV" = "staging" ]; then
    DOWNLOAD_URL="https://github.com/Jun-T-git/prompalette/releases/download/v${VERSION}-staging/${FILENAME}"
else
    DOWNLOAD_URL="https://github.com/Jun-T-git/prompalette/releases/download/v${VERSION}/${FILENAME}"
fi

# Create Tauri-compatible manifest
cat > "$MANIFEST" << EOF
{
  "version": "$VERSION",
  "platforms": {
    "darwin-x86_64": {
      "signature": "$SIGNATURE",
      "url": "$DOWNLOAD_URL"
    },
    "darwin-aarch64": {
      "signature": "$SIGNATURE",
      "url": "$DOWNLOAD_URL"
    }
  },
  "notes": "Update to version $VERSION",
  "pub_date": "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"
}
EOF

log_success "Tauri manifest generated"

# Upload to GitHub if GitHub CLI is available
if [ -n "${GITHUB_TOKEN:-}" ] && command -v gh >/dev/null 2>&1; then
    log_info "Uploading to GitHub Releases..."
    
    # Determine tags
    if [ "$ENV" = "staging" ]; then
        VERSION_TAG="v${VERSION}-staging"
        LATEST_TAG="latest-staging"
        PRERELEASE_FLAG="--prerelease"
    else
        VERSION_TAG="v${VERSION}"
        LATEST_TAG="latest"
        PRERELEASE_FLAG=""
    fi
    
    # Create versioned release with error handling
    if ! gh release create "$VERSION_TAG" --title "$VERSION_TAG" --notes "Release $VERSION_TAG" $PRERELEASE_FLAG 2>/dev/null; then
        log_info "Release $VERSION_TAG already exists, proceeding with upload"
    fi
    
    # Upload files to versioned release with retry
    if ! gh release upload "$VERSION_TAG" "$UPDATE_FILE" "$MANIFEST" --clobber; then
        log_error "Failed to upload to versioned release $VERSION_TAG"
        exit 1
    fi
    
    # Create/update latest tag (safe strategy)
    if gh release view "$LATEST_TAG" >/dev/null 2>&1; then
        # Update existing latest tag by uploading new manifest
        gh release upload "$LATEST_TAG" "$MANIFEST" --clobber
        log_info "Updated existing latest tag: $LATEST_TAG"
    else
        # Create new latest tag if it doesn't exist
        gh release create "$LATEST_TAG" --title "Latest $ENV" --notes "Latest $ENV release" $PRERELEASE_FLAG
        gh release upload "$LATEST_TAG" "$MANIFEST" --clobber
        log_info "Created new latest tag: $LATEST_TAG"
    fi
    
    log_success "Uploaded to GitHub: $VERSION_TAG and $LATEST_TAG"
else
    log_info "GitHub CLI not available - skipping upload"
    log_info "Manifest file: $MANIFEST"
fi

log_success "🎉 Signing process completed successfully!"