# 🔐 Apple Code Signing Setup Guide

This guide explains how to set up Apple Developer ID code signing for PromPalette production releases.

## Prerequisites

1. **Apple Developer Program Membership** ($99/year)
   - Enroll at: https://developer.apple.com/programs/
   - This provides access to Developer ID certificates

2. **Developer ID Application Certificate**
   - Used for distributing apps outside the Mac App Store
   - Required for Gatekeeper compatibility

## Step 1: Create Developer ID Certificate

1. Log in to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Certificates** → **+** (Create a certificate)
4. Select **Developer ID Application**
5. Follow the instructions to create a Certificate Signing Request (CSR)
6. Download the certificate (.cer file)

## Step 2: Export Certificate for CI/CD

1. **Import certificate to Keychain:**
   ```bash
   # Double-click the .cer file to import to Keychain Access
   ```

2. **Export as .p12 file:**
   ```bash
   # In Keychain Access:
   # 1. Find "Developer ID Application: [Your Name]"
   # 2. Right-click → Export
   # 3. Choose .p12 format
   # 4. Set a strong password
   ```

3. **Convert to base64:**
   ```bash
   base64 -i certificate.p12 -o certificate.base64
   ```

## Step 3: Configure GitHub Secrets

Add these secrets to your GitHub repository:

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `APPLE_CERTIFICATE_BASE64` | Base64-encoded .p12 certificate | Output of `base64 -i certificate.p12` |
| `APPLE_CERTIFICATE_PASSWORD` | Password for .p12 file | Password you set during export |
| `KEYCHAIN_PASSWORD` | Temporary keychain password | Generate a secure random password |
| `TAURI_PRIVATE_KEY` | Tauri updater private key | Generate with `tauri signer generate` |
| `TAURI_KEY_PASSWORD` | Tauri private key password | Password for Tauri private key |

### To add secrets:
1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each secret with its respective value

## Step 4: Generate Tauri Signing Keys (Optional)

For app updates and additional security:

```bash
# Install Tauri CLI if not already installed
cargo install tauri-cli

# Generate signing keys
tauri signer generate

# This creates:
# - Private key (keep secret)
# - Public key (include in app)
```

## Step 5: Verify Setup

1. **Test locally:**
   ```bash
   # Set environment variables
   export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAMID)"
   
   # Build with signing
   pnpm --filter apps/native tauri build --target universal-apple-darwin
   ```

2. **Verify signature:**
   ```bash
   codesign -v --verbose dist/PromPalette.app
   spctl -a -v dist/PromPalette.app
   ```

## Step 6: Notarization (Recommended)

For better user experience and security:

1. **Add notarization secrets:**
   - `APPLE_ID`: Your Apple ID email
   - `APPLE_APP_PASSWORD`: App-specific password
   - `APPLE_TEAM_ID`: Your team ID (10-character string)

2. **Configure in CI/CD:**
   ```yaml
   - name: Notarize app
     if: ${{ secrets.APPLE_ID }}
     run: |
       xcrun notarytool submit "dist/PromPalette.dmg" \
         --apple-id "${{ secrets.APPLE_ID }}" \
         --password "${{ secrets.APPLE_APP_PASSWORD }}" \
         --team-id "${{ secrets.APPLE_TEAM_ID }}" \
         --wait
   ```

## Troubleshooting

### Common Issues

1. **"Developer ID certificate not found"**
   - Ensure certificate is properly imported
   - Check certificate validity period
   - Verify team membership

2. **"Keychain access denied"**
   - Use `security unlock-keychain`
   - Set proper partition list permissions

3. **"App can't be opened because it's from an unidentified developer"**
   - App is not signed or notarized
   - Users need to right-click → Open

### Testing Gatekeeper Compatibility

```bash
# Download app on a different Mac
# Test if it opens without warnings
open PromPalette.dmg

# Check signature
spctl -a -v /Applications/PromPalette.app
```

## Security Best Practices

1. **Protect private keys:**
   - Never commit certificates or keys to version control
   - Use GitHub secrets for CI/CD
   - Rotate keys regularly

2. **Limit certificate access:**
   - Only grant access to necessary team members
   - Use separate certificates for development/production

3. **Monitor certificate expiry:**
   - Developer ID certificates expire after 5 years
   - Set calendar reminders for renewal

## Resources

- [Apple Code Signing Guide](https://developer.apple.com/library/archive/documentation/Security/Conceptual/CodeSigningGuide/)
- [Tauri Code Signing Documentation](https://tauri.app/v1/guides/distribution/sign-macos)
- [Notarization Guide](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)

---

**Note:** Code signing is essential for production macOS app distribution. Without it, users will see security warnings and may not be able to run the app.