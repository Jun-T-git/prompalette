# Contributing to PromPalette

Thank you for considering contributing to PromPalette!

## Table of Contents

- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
- [Development Process](#development-process)
  - [Setting Up Your Environment](#setting-up-your-environment)
  - [Project Structure](#project-structure)
  - [Running Tests](#running-tests)
  - [Code Style](#code-style)
- [Commit Guidelines](#commit-guidelines)


## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v20 or higher)
- pnpm (v8 or higher)
- Git
- Rust (v1.77 or higher) - for native app development
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
   git remote add upstream https://github.com/Jun-T-git/prompalette.git
   ```
4. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for PromPalette. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

#### Before Submitting A Bug Report

- **Perform a [cursory search](https://github.com/Jun-T-git/prompalette/issues)** to see if the problem has already been reported.
- **Check if the issue is already fixed** in the latest version.

#### How Do I Submit A (Good) Bug Report?

Bugs are tracked as [GitHub issues](https://github.com/Jun-T-git/prompalette/issues). Create an issue and provide the following information:

- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the exact steps which reproduce the problem** in as many details as possible.
- **Provide specific examples to demonstrate the steps**.
- **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
- **Explain which behavior you expected to see instead and why.**
- **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem.
- **Include your environment details:**
  - OS: [e.g., macOS 13.0, Windows 11, Ubuntu 22.04]
  - PromPalette version

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for PromPalette, including completely new features and minor improvements to existing functionality.

#### Before Submitting An Enhancement Suggestion

- **Perform a [cursory search](https://github.com/Jun-T-git/prompalette/issues)** to see if the enhancement has already been suggested.

#### How Do I Submit A (Good) Enhancement Suggestion?

Enhancement suggestions are tracked as [GitHub issues](https://github.com/Jun-T-git/prompalette/issues). Create an issue and provide the following information:

- **Use a clear and descriptive title** for the issue to identify the suggestion.
- **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
- **Provide specific examples to demonstrate the steps** or provide mockups.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
- **Explain why this enhancement would be useful** to most PromPalette users.


### Pull Requests

The process described here has several goals:

- Maintain PromPalette's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible PromPalette
- Enable a sustainable system for PromPalette's maintainers to review contributions

Please follow these steps to have your contribution considered by the maintainers:

1. Follow the [code style guidelines](#code-style)
2. Write clear commit messages following our [commit guidelines](#commit-guidelines)
3. After you submit your pull request, verify that all status checks are passing

## Development Process

### Setting Up Your Environment

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start development servers:**

   ```bash
   # Start all apps in development mode
   pnpm dev

   # Or start specific apps
   cd apps/native && pnpm dev  # Desktop app
   cd apps/api && pnpm dev     # API server
   cd apps/web && pnpm dev     # Web interface
   ```

### Project Structure

```
prompalette/
├── apps/                    # Applications
│   ├── native/             # Desktop app (Tauri + React)
│   ├── api/                # REST API (Hono)
│   └── web/                # Web interface (Next.js)
├── packages/               # Shared packages
│   ├── core/              # Core business logic
│   ├── ui/                # Shared UI components
│   └── api-client/        # API client library
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for a specific app
pnpm --filter native test
pnpm --filter api test
pnpm --filter web test
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

## Questions?

If you have questions, please:

- Open a [GitHub Issue](https://github.com/Jun-T-git/prompalette/issues) with the "question" label
- Check existing issues for similar questions

Thank you for contributing to PromPalette!
