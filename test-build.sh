#!/bin/bash

echo "🧪 Testing Tauri build with proper code signing..."

cd apps/native

# Test 1: Build without signing (should work)
echo "📦 Test 1: Building without code signing..."
APPLE_CODESIGN_IDENTITY="-" pnpm tauri build --target universal-apple-darwin --bundles dmg

# Find the built DMG
DMG_PATH=$(find src-tauri/target -name "*.dmg" -type f | grep -v "rw\." | head -1)

if [ -f "$DMG_PATH" ]; then
    echo "✅ DMG created: $DMG_PATH"
    
    # Mount and check
    echo "🔍 Checking app bundle..."
    hdiutil attach "$DMG_PATH" -nobrowse
    
    # Check signature
    codesign -dv --verbose=4 "/Volumes/prompalette/prompalette.app" 2>&1
    
    # Verify
    codesign -v "/Volumes/prompalette/prompalette.app" 2>&1 || echo "⚠️ Signature verification failed"
    
    # Unmount
    hdiutil detach "/Volumes/prompalette"
else
    echo "❌ DMG not found"
fi

echo "📋 Test complete"