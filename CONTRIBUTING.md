# Contributing to Taqnihub Fullstack Starter Dashboard

Thank you for your interest in contributing to the Taqnihub Fullstack Starter Dashboard! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please:

- Be respectful and considerate in all interactions
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Accept constructive criticism gracefully

## How to Contribute

### Reporting Bugs

Before reporting a bug, please:

1. Search existing [issues](https://github.com/taqnihub/dashboard-starter/issues) to avoid duplicates
2. Check if the issue has been fixed in the latest version

When reporting a bug, include:

- Clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Environment details (OS, Node.js version, browser)
- Screenshots or error logs if applicable

### Suggesting Features

We welcome feature suggestions! Please:

1. Check existing issues and discussions for similar suggestions
2. Create a new issue with the `enhancement` label
3. Describe the feature and its use case
4. Explain why this feature would be valuable

### Pull Requests

#### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/dashboard-starter.git
   cd dashboard-starter
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up your environment:
   ```bash
   cp .env.example .env
   # Configure your DATABASE_URL
   ```
5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

#### Branch Naming Convention

Use descriptive branch names with prefixes:

| Prefix | Description | Example |
|--------|-------------|---------|
| `feature/` | New features | `feature/dark-mode-toggle` |
| `fix/` | Bug fixes | `fix/login-validation` |
| `docs/` | Documentation changes | `docs/api-reference` |
| `refactor/` | Code refactoring | `refactor/auth-logic` |
| `test/` | Test additions | `test/user-api` |
| `chore/` | Maintenance tasks | `chore/update-deps` |

#### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add password reset functionality
fix(api): correct user validation error handling
docs(readme): update installation instructions
refactor(components): simplify data table logic
```

#### Pull Request Process

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make your changes following the coding standards

3. Write or update tests if applicable

4. Ensure all tests pass:
   ```bash
   npm run test
   ```

5. Run linting:
   ```bash
   npm run lint
   ```

6. Commit your changes with a descriptive message

7. Push to your fork:
   ```bash
   git push origin feature/your-feature
   ```

8. Create a Pull Request with:
   - Clear title describing the change
   - Description of what was changed and why
   - Link to related issue(s) if applicable
   - Screenshots for UI changes

9. Address review feedback promptly

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type where possible
- Use meaningful variable and function names

### React/Next.js

- Use functional components with hooks
- Follow React best practices
- Use Server Components where appropriate
- Keep components focused and reusable

### Styling

- Use Tailwind CSS utility classes
- Follow the existing component patterns
- Maintain dark mode compatibility
- Ensure responsive design

### Database

- Write migrations for schema changes
- Use Prisma's type-safe queries
- Follow existing naming conventions
- Document complex relationships

### API Routes

- Follow RESTful conventions
- Include proper error handling
- Validate input with Zod schemas
- Return consistent response formats

## File Structure

When adding new features, follow the existing structure:

```
src/
├── app/
│   ├── api/[resource]/         # API routes
│   └── (dashboard)/[page]/     # Dashboard pages
├── components/
│   ├── ui/                     # Reusable UI components
│   └── dashboard/              # Dashboard-specific components
├── lib/
│   ├── validations/            # Zod schemas
│   └── [feature]/              # Feature-specific utilities
```

## Testing

- Write tests for new features
- Ensure existing tests pass
- Test edge cases and error conditions
- Include both unit and integration tests where appropriate

## Documentation

- Update documentation for new features
- Include JSDoc comments for complex functions
- Update the README if adding major features
- Add examples for API endpoints

## Getting Help

- Check the [documentation](docs/)
- Search existing [issues](https://github.com/taqnihub/dashboard-starter/issues)
- Ask in [discussions](https://github.com/taqnihub/dashboard-starter/discussions)
- Reach out to maintainers

## Recognition

Contributors will be recognized in:
- The project's README
- Release notes for significant contributions

Thank you for contributing to make this project better!
