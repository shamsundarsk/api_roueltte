# Contributing to Mashup Maker

Thank you for your interest in contributing to Mashup Maker! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Submitting Changes](#submitting-changes)
- [Adding New APIs](#adding-new-apis)
- [Adding New Features](#adding-new-features)

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Prioritize the community's best interests

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling or insulting remarks
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/YOUR_USERNAME/mashup-maker.git
cd mashup-maker
```

3. Add the upstream repository:
```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/mashup-maker.git
```

### Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Set Up Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your configuration

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env with your configuration
```

### Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features (e.g., `feature/add-python-backend`)
- `fix/` - Bug fixes (e.g., `fix/zip-export-error`)
- `docs/` - Documentation updates (e.g., `docs/api-endpoints`)
- `refactor/` - Code refactoring (e.g., `refactor/code-generator`)
- `test/` - Test additions or fixes (e.g., `test/api-selector`)

### Creating a Branch

```bash
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in small, logical commits
2. Write clear commit messages (see below)
3. Test your changes thoroughly
4. Update documentation as needed

### Commit Messages

Follow the conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(generator): add Python backend template support

- Add Python/FastAPI template generation
- Update CodeGenerator to support multiple backend frameworks
- Add tests for Python template generation

Closes #123
```

```
fix(exporter): handle special characters in ZIP filenames

- Sanitize filenames to remove invalid characters
- Add validation for filename length
- Update tests to cover edge cases

Fixes #456
```

### Keeping Your Fork Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode in `tsconfig.json`
- Avoid using `any` type; use proper types or `unknown`
- Use interfaces for object shapes
- Use type aliases for unions and complex types

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Backend
cd backend
npm run lint        # Check for issues
npm run format      # Auto-format code

# Frontend
cd frontend
npm run lint
npm run format
```

### Naming Conventions

- **Files**: Use PascalCase for classes (`APIRegistry.ts`), camelCase for utilities (`errorLogger.ts`)
- **Classes**: PascalCase (`class APISelector`)
- **Functions**: camelCase (`function generateIdea()`)
- **Constants**: UPPER_SNAKE_CASE (`const MAX_RETRIES = 3`)
- **Interfaces**: PascalCase with descriptive names (`interface APIMetadata`)
- **Types**: PascalCase (`type AuthType = 'none' | 'apikey' | 'oauth'`)

### Documentation

Add JSDoc comments for all public functions and classes:

```typescript
/**
 * Selects three unique APIs from different categories
 * 
 * @param count - Number of APIs to select (default: 3)
 * @param options - Optional selection criteria
 * @returns Array of selected API metadata
 * @throws {Error} If insufficient APIs are available
 * 
 * @example
 * const selector = new APISelector(registry);
 * const apis = selector.selectAPIs(3, { corsOnly: true });
 */
selectAPIs(count: number = 3, options?: SelectionOptions): APIMetadata[] {
  // Implementation
}
```

### Error Handling

- Use custom error classes from `backend/src/errors/CustomErrors.ts`
- Always provide meaningful error messages
- Log errors using the error logger utility
- Handle errors gracefully without crashing the application

```typescript
import { InvalidAPIError } from '../errors/CustomErrors';
import { logger } from '../utils/errorLogger';

try {
  // Operation
} catch (error) {
  logger.logError(error, { context: 'operation-name' });
  throw new InvalidAPIError('Descriptive error message');
}
```

## Testing Guidelines

### Test Structure

- Place tests in `__tests__` directories
- Name test files with `.test.ts` suffix
- Group related tests using `describe` blocks
- Use descriptive test names with `it` or `test`

### Unit Tests

Write unit tests for all new functionality:

```typescript
describe('APISelector', () => {
  let selector: APISelector;
  let registry: APIRegistry;

  beforeEach(() => {
    registry = new APIRegistry();
    selector = new APISelector(registry);
  });

  it('should select exactly 3 APIs', () => {
    const apis = selector.selectAPIs(3);
    expect(apis).toHaveLength(3);
  });

  it('should select APIs from different categories', () => {
    const apis = selector.selectAPIs(3);
    const categories = apis.map(api => api.category);
    const uniqueCategories = new Set(categories);
    expect(uniqueCategories.size).toBe(3);
  });
});
```

### Property-Based Tests

Use fast-check for property-based testing:

```typescript
import fc from 'fast-check';

// Feature: mashup-maker, Property 1: API Selection Constraints
it('should always select unique APIs from different categories', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 3, max: 10 }),
      (numCategories) => {
        // Generate test data
        const registry = createRegistryWithCategories(numCategories);
        const selector = new APISelector(registry);
        
        // Execute
        const apis = selector.selectAPIs(3);
        
        // Verify properties
        expect(apis).toHaveLength(3);
        const categories = new Set(apis.map(api => api.category));
        expect(categories.size).toBe(3);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Coverage

- Aim for 80%+ code coverage for core business logic
- Test happy paths and error cases
- Test edge cases (empty inputs, boundary values, etc.)
- Don't test external libraries or framework code

### Running Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- APISelector.test.ts

# Run with coverage
npm test -- --coverage
```

## Submitting Changes

### Before Submitting

1. **Run tests**: Ensure all tests pass
```bash
cd backend && npm test
```

2. **Run linter**: Fix any linting issues
```bash
npm run lint
npm run format
```

3. **Update documentation**: Update README.md or other docs if needed

4. **Test manually**: Run the application and test your changes

### Creating a Pull Request

1. Push your branch to your fork:
```bash
git push origin feature/your-feature-name
```

2. Go to GitHub and create a Pull Request from your fork to the main repository

3. Fill out the PR template with:
   - Clear description of changes
   - Related issue numbers (e.g., "Closes #123")
   - Screenshots (if UI changes)
   - Testing steps

4. Wait for review and address feedback

### PR Review Process

- Maintainers will review your PR within a few days
- Address any requested changes
- Once approved, a maintainer will merge your PR
- Your contribution will be included in the next release!

## Adding New APIs

To add a new API to the registry:

1. **Research the API**:
   - Verify it's publicly accessible
   - Check CORS compatibility
   - Review authentication requirements
   - Test sample endpoints

2. **Add to registry**:

Edit `backend/data/api-registry.json`:

```json
{
  "id": "unique-api-id",
  "name": "API Display Name",
  "description": "Brief description of API functionality",
  "category": "appropriate-category",
  "baseUrl": "https://api.example.com",
  "sampleEndpoint": "/v1/endpoint",
  "authType": "none",
  "corsCompatible": true,
  "documentationUrl": "https://docs.example.com",
  "mockData": {
    "example": "Sample response data"
  }
}
```

3. **Test the API**:
   - Generate a mashup that includes your API
   - Verify the generated code is correct
   - Test the download functionality

4. **Update tests** if needed

5. **Submit PR** with your addition

### API Quality Guidelines

- **Stability**: Choose APIs that are actively maintained
- **Documentation**: API should have clear documentation
- **Rate Limits**: Consider APIs with reasonable rate limits
- **Free Tier**: Prefer APIs with free tiers for testing
- **CORS**: CORS-compatible APIs are preferred for frontend use

## Adding New Features

### Feature Development Process

1. **Discuss first**: Open an issue to discuss the feature before implementing
2. **Design**: Consider the architecture and impact on existing code
3. **Implement**: Follow coding standards and write tests
4. **Document**: Update README and add JSDoc comments
5. **Test**: Thoroughly test the feature
6. **Submit**: Create a PR with clear description

### Feature Checklist

- [ ] Feature discussed in an issue
- [ ] Code follows project standards
- [ ] Unit tests added
- [ ] Property-based tests added (if applicable)
- [ ] Documentation updated
- [ ] Manual testing completed
- [ ] No breaking changes (or clearly documented)
- [ ] Backward compatible (or migration guide provided)

### Architecture Considerations

When adding features, consider:

- **Modularity**: Keep components independent and reusable
- **Testability**: Write code that's easy to test
- **Performance**: Avoid blocking operations, use async/await
- **Error Handling**: Handle errors gracefully
- **Extensibility**: Design for future enhancements
- **Documentation**: Document complex logic and design decisions

## Questions?

If you have questions or need help:

1. Check existing documentation (README.md, this file)
2. Search existing issues on GitHub
3. Open a new issue with the "question" label
4. Reach out to maintainers

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes
- Project documentation

Thank you for contributing to Mashup Maker! 🎉
