# 🎨 PromPalette

<div align="center">
  <img src="https://raw.githubusercontent.com/username/prompalette/main/assets/logo.png" alt="PromPalette Logo" width="120" height="120">
  
  <h3 align="center">Your AI Prompts, Beautifully Organized</h3>
  
  <p align="center">
    The GitHub for Prompt Management - Save, organize, and share your AI prompts across all platforms
    <br />
    <a href="https://prompalette.dev/docs"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://prompalette.dev/demo">View Demo</a>
    ·
    <a href="https://github.com/username/prompalette/issues">Report Bug</a>
    ·
    <a href="https://github.com/username/prompalette/issues">Request Feature</a>
  </p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![GitHub Stars](https://img.shields.io/github/stars/username/prompalette)](https://github.com/username/prompalette/stargazers)
  [![Discord](https://img.shields.io/discord/xxxxx?label=Discord&logo=discord)](https://discord.gg/xxxxx)
  [![Downloads](https://img.shields.io/github/downloads/username/prompalette/total)](https://github.com/username/prompalette/releases)
  [![Contributors](https://img.shields.io/github/contributors/username/prompalette)](https://github.com/username/prompalette/graphs/contributors)
</div>

## ✨ Features

- 🚀 **Instant Access** - Launch with `⌘+⌘` (Mac) or `Ctrl+Ctrl` (Windows/Linux) from anywhere
- 🔌 **Cross-Platform** - Works with ChatGPT, Claude, Gemini, and any AI tool
- 💾 **Local-First** - Lightning fast with offline support, your data stays with you
- ☁️ **Cloud Sync** - Seamlessly sync across all your devices
- 🤝 **Easy Sharing** - Share prompts with a simple link
- 🎯 **Smart Organization** - Auto-tagging, workspaces, and intelligent search
- ⚡ **One-Click Save** - Browser extension for instant prompt capture
- 🔥 **Hot Reload** - See changes instantly without restart

## 🚀 Quick Start

### Install in 30 seconds

**macOS/Linux:**

```bash
curl -fsSL https://prompalette.dev/install.sh | sh
```

**Windows:**

```powershell
iwr -useb https://prompalette.dev/install.ps1 | iex
```

**Or download directly:**

- [Download for macOS](https://github.com/username/prompalette/releases/latest/download/PromPalette-mac.dmg)
- [Download for Windows](https://github.com/username/prompalette/releases/latest/download/PromPalette-win.exe)
- [Download for Linux](https://github.com/username/prompalette/releases/latest/download/PromPalette-linux.AppImage)

## 📸 Screenshots

<div align="center">
  <img src="https://raw.githubusercontent.com/username/prompalette/main/assets/screenshot-1.png" alt="Main Interface" width="600">
  <p><em>Clean and intuitive interface for managing your prompts</em></p>
  
  <img src="https://raw.githubusercontent.com/username/prompalette/main/assets/screenshot-2.png" alt="Quick Search" width="600">
  <p><em>Instantly search and execute prompts with global hotkey</em></p>
  
  <img src="https://raw.githubusercontent.com/username/prompalette/main/assets/screenshot-3.png" alt="Browser Extension" width="600">
  <p><em>Save prompts directly from ChatGPT, Claude, or any AI tool</em></p>
</div>

## 🎯 Use Cases

### For Developers 👨‍💻

- Store and organize coding prompts
- Quick access to debugging helpers
- Share team-specific prompts
- Version control for prompt iterations

### For Content Creators ✍️

- Manage writing templates
- Store character personalities
- Quick access to style guides
- Collaborate on creative prompts

### For Businesses 💼

- Standardize customer service responses
- Share company-wide prompt templates
- Maintain brand voice consistency
- Track prompt usage and effectiveness

### For Researchers 🔬

- Organize research methodologies
- Store complex query templates
- Share academic prompts
- Build on community knowledge

## 🛠 Installation Options

### 🖥 Desktop App (Recommended)

The desktop app provides the best experience with global hotkeys and local-first storage.

```bash
# Using package managers
# macOS (Homebrew)
brew install --cask prompalette

# Windows (Scoop)
scoop install prompalette

# Linux (Snap)
snap install prompalette
```

### 🌐 Browser Extension

Perfect for quick saves while browsing AI tools.

- [Chrome Web Store](https://chrome.google.com/webstore/detail/prompalette)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/prompalette)
- [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/prompalette)

### 📱 Mobile Apps (Coming Soon)

- iOS (TestFlight Beta)
- Android (Early Access)

## 💻 Development

### Prerequisites

- Node.js 18+
- pnpm 8+
- Rust 1.70+ (for native app)

### Setup

```bash
# Clone the repository
git clone https://github.com/username/prompalette.git
cd prompalette

# Install dependencies
pnpm install

# Start development
pnpm dev

# Run specific apps
pnpm native:dev    # Desktop app
pnpm extension:dev # Browser extension
pnpm api:dev       # Cloud API
pnpm web:dev       # Web interface
```

### Project Structure

```
prompalette/
├── apps/
│   ├── native/      # Desktop app (Tauri + React)
│   ├── extension/   # Browser extension
│   ├── api/         # Cloud sync API (Hono)
│   └── web/         # Web sharing interface (Next.js)
├── packages/
│   ├── core/        # Shared business logic
│   ├── ui/          # Shared UI components
│   └── api-client/  # API client library
└── docs/            # Documentation
```

### Building

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter native build
pnpm --filter extension build

# Create release
pnpm release
```

## 🤝 Contributing

We love contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Good First Issues

- [Help wanted](https://github.com/username/prompalette/labels/help%20wanted)
- [Good first issue](https://github.com/username/prompalette/labels/good%20first%20issue)

### Development Process

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test updates
- `chore:` Build process or auxiliary tool changes

## 🗺 Roadmap

### Phase 1: Foundation (Current)

- [x] Local-first desktop app
- [x] Basic prompt management
- [x] Browser extension
- [ ] Cloud sync
- [ ] Public sharing

### Phase 2: Collaboration

- [ ] Team workspaces
- [ ] Commenting system
- [ ] Version control
- [ ] Prompt marketplace

### Phase 3: Intelligence

- [ ] AI-powered organization
- [ ] Prompt optimization suggestions
- [ ] Usage analytics
- [ ] Smart templates

See the [open issues](https://github.com/username/prompalette/issues) for a full list of proposed features.

## 🏆 Sponsors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/sponsor1">
        <img src="https://github.com/sponsor1.png" width="60px" alt="Sponsor 1" />
        <br />
        <sub><b>Sponsor 1</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/sponsor2">
        <img src="https://github.com/sponsor2.png" width="60px" alt="Sponsor 2" />
        <br />
        <sub><b>Sponsor 2</b></sub>
      </a>
    </td>
  </tr>
</table>

[Become a sponsor](https://github.com/sponsors/username)

## 📊 Stats

![Alt](https://repobeats.axiom.co/api/embed/your-repo-id.svg "Repobeats analytics image")

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) - For the amazing native app framework
- [Hono](https://hono.dev/) - For the fast edge-first web framework
- [shadcn/ui](https://ui.shadcn.com/) - For beautiful UI components
- All our [contributors](https://github.com/username/prompalette/graphs/contributors)!

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

## 📞 Contact

- Project Link: [https://github.com/username/prompalette](https://github.com/username/prompalette)
- Discord: [Join our community](https://discord.gg/xxxxx)
- Twitter: [@prompalette](https://twitter.com/prompalette)
- Email: hello@prompalette.dev

---

<div align="center">
  Made with ❤️ by the PromPalette community
  <br />
  <a href="https://github.com/username/prompalette">⭐ Star us on GitHub!</a>
</div>
