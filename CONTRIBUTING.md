# Contributing to Competitive Deal Radar

Thank you for considering contributing to Competitive Deal Radar! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by its Code of Conduct. Please be respectful and considerate of others.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (e.g., sample data or screenshots)
- **Describe the behavior you observed and what you expected**
- **Include details about your configuration and environment**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **Include any relevant examples or mockups**

### Pull Requests

- Fill in the required template
- Follow the TypeScript and React coding style
- Include appropriate test cases
- Update documentation as needed
- End all files with a newline

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/competitive-deal-radar.git
   cd competitive-deal-radar
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. Make your changes and commit them:
   ```bash
   git commit -m "Description of your changes"
   ```

6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

7. Create a Pull Request from your fork to the main repository

## Coding Guidelines

### TypeScript

- Use TypeScript for all new code
- Define proper interfaces for props and state
- Avoid using `any` type
- Use proper type narrowing with type guards

### React

- Use functional components with hooks
- Keep components small and focused
- Use proper prop naming conventions
- Follow React best practices

### Styling

- Use Tailwind CSS for styling
- Follow the existing design system
- Ensure responsive design works on all screen sizes

## Testing

- Write tests for new features
- Ensure all tests pass before submitting a PR
- Aim for good test coverage

## Documentation

- Update documentation for any changed functionality
- Document new features
- Use JSDoc comments for functions and components

## Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests after the first line

## License

By contributing to Competitive Deal Radar, you agree that your contributions will be licensed under the project's MIT license.