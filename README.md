# PolicyTrackerAI

A web application for tracking and analyzing university AI/LLM policies using AI-driven research and analysis.

## Tech Stack

- **Backend**: Express.js (TypeScript)
- **Frontend**: React + Shadcn UI
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-4 via Portkey
- **Deployment**: Docker + Docker Compose

## Setup

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
4. Set up PostgreSQL database and update DATABASE_URL
5. Run database migrations:
   ```bash
   npm run db:push
   ```
6. Start development server:
   ```bash
   npm run dev
   ```

### Docker Setup

1. Copy `.env.example` to `.env` and configure required API keys
2. Run the application using Docker:
   ```bash
   ./docker-start.sh
   ```
3. Access the application at http://localhost:5000

## Project Structure

- `/client` - React frontend application
- `/server` - Express.js backend
- `/db` - Database schema and migrations
- `/migrations` - SQL migrations
- `/server/services` - Core services (AI, scraping)

## Development Status

See `plan.md` for detailed implementation status and roadmap.

## Features

- ✅ University policy tracking
- ✅ AI-powered policy analysis
- ✅ Web scraping for policy collection
- ✅ Policy comparison tools
- ✅ Analytics dashboard
- ✅ Docker containerization
- ❌ CI/CD pipeline (coming soon)

## License

MIT
