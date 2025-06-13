# CLAUDE.md - AI Assistant Guidelines

## 🎯 Three Golden Rules

### 1. Plan First, Code Second

```
✅ Understand → Design → Consider edge cases → Then code
❌ "Let's try this and see"
```

Feel free to edit and use @tmp-docs/workspace-claude.md for organizing, planning, and remembering.

### 2. Test-Driven Development (TDD)

```typescript
// ALWAYS this order:
// 1. Write test
it('should save prompt', async () => {
  const saved = await storage.save({ content: 'test' });
  expect(saved.id).toBeDefined();
});

// 2. Then implement
async save(prompt) {
  // implementation
}
```

### 3. Keep Quality High

```
Before any code suggestion:
✅ Tests pass
✅ Type Safe, No TypeScript errors
✅ Linting clean
✅ Properly formatted
```

## 📋 Quick Checklist

```markdown
□ Requirements understood?
□ Solution planned?
□ Tests written first?
□ Error handling included?
□ Documentation updated?
```

## Required Post-Work Checklist

No errors or warnings when

#### 1. Type Check

```
pnpm typecheck
```

#### 2. Build

```
pnpm build
```

#### 3. Lint

```
pnpm lint
```

#### 4. Test

```
pnpm test
```

## 💻 Code Standards

### Structure

```
components/PromptEditor/
├── PromptEditor.tsx      # Component
├── PromptEditor.test.tsx # Tests (required!)
└── index.ts              # Exports
```

### Always Handle Errors

```typescript
try {
  const result = await api.save(prompt);
  return { success: true, data: result };
} catch (error) {
  return { success: false, error: error.message };
}
```

### No Magic Values

```typescript
// ❌ BAD
if (prompt.length > 1000) {
}

// ✅ GOOD
const MAX_LENGTH = 1000;
if (prompt.length > MAX_LENGTH) {
}
```

## 🚫 Don'ts

- No untested code
- No unhandled promises
- No console.log in production
- No direct DOM manipulation in React
- No any types in TypeScript

## 📝 Remember

**Think → Test → Code → Document**

Quality > Speed. Always.
