# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1. **Do not** open a public issue
2. Open a private security advisory on GitHub (Settings → Security → Report a vulnerability)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond as quickly as possible and work with you to understand and resolve the issue.

## Security Features

### Automatic Updates

PromPalette uses Tauri's built-in updater with cryptographic signature verification:

- **Ed25519 Signatures**: All updates are cryptographically signed
- **Environment Validation**: Version compatibility checks per environment
- **Automatic Backups**: Data protection before updates

## Security Best Practices

When contributing to PromPalette:

- Never commit secrets, API keys, or passwords
- Use environment variables for sensitive configuration
- Validate all user inputs
- Keep dependencies updated

Thank you for helping keep PromPalette secure!