# Contributing to PromPalette

First off, thank you for considering contributing to PromPalette! 🎉

It's people like you that make PromPalette such a great tool for the AI community. This document provides guidelines for contributing to the PromPalette project. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Pull Requests](#pull-requests)
- [Development Process](#development-process)
  - [Setting Up Your Environment](#setting-up-your-environment)
  - [Project Structure](#project-structure)
  - [Running Tests](#running-tests)
  - [Code Style](#code-style)
- [Commit Guidelines](#commit-guidelines)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by the [PromPalette Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@prompalette.dev](mailto:conduct@prompalette.dev).

## I Have a Question

> **Note:** Please don't file an issue to ask a question. You'll get faster results by using the resources below.

Before you ask a question, it is best to search for existing [Issues](https://github.com/username/prompalette/issues) that might help you. In case you have found a suitable issue and still need clarification, you can write your question in this issue. It is also advisable to search the internet for answers first.

If you then still feel the need to ask a question and need clarification, we recommend the following:

- Join our [Discord server](https://discord.gg/xxxxx)
- Ask in the `#help` channel
- Provide as much context as you can about what you're running into

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- Git
- Rust (v1.70 or higher) - for native app development
- A code editor (we recommend VS Code)

### Fork & Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/prompalette.git
   cd prompalette
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/username/prompalette.git
   ```
4. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for PromPalette. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

#### Before Submitting A Bug Report

- **Check the [FAQ](docs/FAQ.md)** for a list of common questions and problems.
- **Check the [debugging guide](docs/DEBUGGING.md)** for tips on debugging.
- **Perform a [cursory search](https://github.com/username/prompalette/issues)** to see if the problem has already been reported.

#### How Do I Submit A (Good) Bug Report?

Bugs are tracked as [GitHub issues](https://github.com/username/prompalette/issues). Create an issue and provide the following information:

- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the exact steps which reproduce the problem** in as many details as possible.
- **Provide specific examples to demonstrate the steps**.
- **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
- **Explain which behavior you expected to see instead and why.**
- **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem.
- **Include your environment details:**
  - OS: [e.g., macOS 13.0, Windows 11, Ubuntu 22.04]
  - PromPalette version
  - Browser (if using extension): [e.g., Chrome 119, Firefox 120]

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for PromPalette, including completely new features and minor improvements to existing functionality.

#### Before Submitting An Enhancement Suggestion

- **Check the [roadmap](ROADMAP.md)** to see if the feature is already planned.
- **Perform a [cursory search](https://github.com/username/prompalette/issues)** to see if the enhancement has already been suggested.

#### How Do I Submit A (Good) Enhancement Suggestion?

Enhancement suggestions are tracked as [GitHub issues](https://github.com/username/prompalette/issues). Create an issue and provide the following information:

- **Use a clear and descriptive title** for the issue to identify the suggestion.
- **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
- **Provide specific examples to demonstrate the steps** or provide mockups.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
- **Explain why this enhancement would be useful** to most PromPalette users.

### Your First Code Contribution

Unsure where to begin contributing to PromPalette? You can start by looking through these `beginner` and `help-wanted` issues:

- [Beginner issues](https://github.com/username/prompalette/labels/good%20first%20issue) - issues which should only require a few lines of code, and a test or two.
- [Help wanted issues](https://github.com/username/prompalette/labels/help%20wanted) - issues which should be a bit more involved than `beginner` issues.

### Pull Requests

The process described here has several goals:

- Maintain PromPalette's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible PromPalette
- Enable a sustainable system for PromPalette's maintainers to review contributions

Please follow these steps to have your contribution considered by the maintainers:

1. Follow all instructions in [the template](PULL_REQUEST_TEMPLATE.md)
2. Follow the [styleguides](#code-style)
3. After you submit your pull request, verify that all [status checks](https://help.github.com/articles/about-status-checks/) are passing

## Development Process

### Setting Up Your Environment

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development servers:**

   ```bash
   # Start all apps in development mode
   pnpm dev

   # Or start specific apps
   pnpm native:dev     # Desktop app
   pnpm extension:dev  # Browser extension
   pnpm api:dev        # API server
   pnpm web:dev        # Web interface
   ```

### Project Structure

```
prompalette/
├── apps/                    # Applications
│   ├── native/             # Desktop app (Tauri + React)
│   ├── extension/          # Browser extension
│   ├── api/                # Cloud API (Hono)
│   └── web/                # Web interface (Next.js)
├── packages/               # Shared packages
│   ├── core/              # Core business logic
│   ├── ui/                # Shared UI components
│   └── api-client/        # API client library
├── docs/                   # Documentation
└── tools/                  # Development tools
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for a specific app
pnpm --filter native test
pnpm --filter extension test

# Run E2E tests
pnpm test:e2e

# Check test coverage
pnpm test:coverage
```

### Code Style

We use automated tools to maintain consistent code style:

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for pre-commit hooks

#### Before committing:

```bash
# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Type check
pnpm typecheck
```

#### Style Guidelines:

1. **TypeScript:**

   - Use explicit types where helpful
   - Avoid `any` type
   - Prefer interfaces over type aliases for object shapes
   - Use enums for constants

2. **React:**

   - Use functional components with hooks
   - Keep components small and focused
   - Use proper prop typing
   - Follow React naming conventions

3. **General:**
   - Write self-documenting code
   - Add comments for complex logic
   - Keep functions small and single-purpose
   - Use meaningful variable names

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This leads to more readable messages that are easy to follow when looking through the project history.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files

### Scope

The scope should be the name of the package affected:

- **native**: Desktop app
- **extension**: Browser extension
- **api**: API server
- **web**: Web interface
- **core**: Core package
- **ui**: UI components package

### Examples

```bash
# Feature
git commit -m "feat(native): add global hotkey support for Windows"

# Bug fix
git commit -m "fix(extension): resolve memory leak in content script"

# Documentation
git commit -m "docs: update installation instructions for Linux"

# Performance
git commit -m "perf(core): optimize prompt search algorithm"

# Breaking change
git commit -m "feat(api)!: change authentication method

BREAKING CHANGE: API now uses JWT tokens instead of API keys"
```

## Release Process

1. **Version Bumping:**

   ```bash
   pnpm changeset
   # Follow the prompts to describe your changes
   ```

2. **Creating a Release:**
   ```bash
   pnpm changeset version
   pnpm install  # Update lockfile
   git commit -m "chore: release"
   pnpm release
   ```

## Community

### Communication Channels

- **Discord**: [Join our server](https://discord.gg/xxxxx) for real-time chat
- **GitHub Discussions**: For longer form discussions about the project
- **Twitter**: [@prompalette](https://twitter.com/prompalette) for updates

### Recognition

Contributors who have made significant contributions may be invited to become maintainers. We value:

- Code contributions
- Documentation improvements
- Community support
- Bug reports and testing
- Design contributions
- Translation efforts

## Questions?

Don't hesitate to ask questions! The PromPalette community is here to help. You can:

- Ask in our [Discord server](https://discord.gg/xxxxx)
- Open a [GitHub Discussion](https://github.com/username/prompalette/discussions)
- Email us at [hello@prompalette.dev](mailto:hello@prompalette.dev)

Thank you for contributing to PromPalette! 🎨✨

---

<div align="center">
  <strong>Happy Coding!</strong>
  <br>
  Made with ❤️ by the PromPalette community
</div>
