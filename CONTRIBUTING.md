# Contributing to PolicyTrackerAI

## Development Setup

### Local Development

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Set up PostgreSQL database
5. Run migrations: `npm run db:push`

### Docker Development

1. Install Docker and Docker Compose
2. Copy `.env.example` to `.env` and configure
3. Run `./docker-start.sh` to start the application
4. Access the app at http://localhost:5000

## Project Structure

- `/client` - React frontend
- `/server` - Express.js backend
- `/db` - Database schema
- `/migrations` - SQL migrations

## Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Run tests (when implemented)
4. Submit PR

## Docker Guidelines

- Use `docker-compose up --build` when updating dependencies
- Access logs: `docker-compose logs -f app`
- Database migrations: `docker-compose exec app npm run db:push`
- Shell access: `docker-compose exec app sh`

## Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages

## Current Focus Areas

1. CI/CD Implementation

   - Set up GitHub Actions
   - Configure automated testing
   - Implement deployment pipeline

2. Production Deployment

   - Configure cloud services
   - Set up monitoring
   - Implement logging

3. Testing Infrastructure

   - Add unit tests
   - Integration tests
   - E2E tests

4. Documentation
   - API documentation
   - Deployment guides
   - Contributing guidelines

## Database Migrations

- Create migrations in `/migrations`
- Use `npm run db:push` to apply changes
- Document schema changes

## AI Service Development

- Enhance policy analysis
- Improve source verification
- Add cross-referencing
- Document prompts

## Documentation

- Update README.md for new features
- Document API endpoints
- Keep plan.md updated
