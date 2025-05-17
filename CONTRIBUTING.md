# Contributing to UrbanPulse

Thank you for your interest in contributing to UrbanPulse! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report:
- Check the issue tracker to see if the problem has already been reported
- Collect information about the bug (steps to reproduce, expected behavior, etc.)

When submitting a bug report, please include:
- A clear and descriptive title
- Detailed steps to reproduce the issue
- Expected behavior vs. actual behavior
- Screenshots if applicable
- Your environment (OS, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:
- A clear and descriptive title
- A detailed description of the proposed functionality
- Any relevant examples or mockups
- Why this enhancement would be useful to most users

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure your changes don't break existing functionality
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

1. Clone your fork of the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see README.md)
4. Start the development server: `npm run dev`

## Coding Guidelines

### JavaScript/TypeScript

- Follow the ESLint configuration in the project
- Use TypeScript for type safety
- Write meaningful variable and function names
- Add comments for complex logic

### React Components

- Use functional components with hooks
- Keep components small and focused on a single responsibility
- Use the appropriate component structure:
  - UI components in `src/components/ui`
  - Feature components in `src/components`
  - Page components in `src/app`

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow the project's design system
- Ensure responsive design works on all screen sizes

## Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests after the first line

## Documentation

- Update the README.md with details of changes to the interface
- Update the documentation when changing core functionality
- Comment your code, particularly for complex logic

## Review Process

All submissions require review. We use GitHub pull requests for this purpose.

1. A maintainer will review your PR
2. Changes may be requested before a PR can be merged
3. Once approved, your PR will be merged

## Additional Notes

### Issue and Pull Request Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements or additions to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed

Thank you for contributing to UrbanPulse!
