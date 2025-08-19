# CodeFusion

✨ **The Unified Dev Workflow Platform**

An open-source platform that connects code review, API configuration, UI generation, and one-click deployment — built for full-stack teams.

🚀 Features:

- 📝 Lightweight CR/PR Management
- ⚡ One-Click Deploy to Remote Servers
- 🔗 Visual API Configuration (Frontend & Backend)
- 🧱 Auto-Generate React/Vue Components
- 📦 Designed for extensibility (plugins, CLI, API)

🎯 Vision: Make full-stack development collaborative, consistent, and frictionless.

## Quick Start

### 1. Fork and clone the repository

First, fork this repository to your GitHub account, then clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/codefusion.git
cd codefusion
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up authentication

Run the automatic setup script:

```bash
pnpm setup:auth
```

Or set up manually:

1. Copy the environment variables template:

   ```bash
   cp env.example .env
   ```

2. Configure OAuth applications:
   - [GitHub OAuth Setup](https://github.com/settings/developers)
   - [GitLab OAuth Setup](https://gitlab.com/-/profile/applications)

3. Update OAuth configuration in `.env` file

4. Initialize the database:
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

### 4. Start the development server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Authentication Configuration

For detailed authentication setup instructions, see [AUTH_SETUP.md](./AUTH_SETUP.md).

### Supported authentication methods

- ✅ GitHub OAuth
- ✅ GitLab OAuth

### Database commands

```bash
# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push

# Open database management interface
pnpm db:studio

# Reset database
pnpm db:reset
```

## Development

### Available scripts

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Code linting
pnpm lint

# Type checking
pnpm type-check

# Format code
pnpm format

# Run tests
pnpm test
```

## Tech Stack

- **Framework**: Next.js 14
- **Authentication**: NextAuth.js
- **Database**: SQLite + Prisma
- **UI**: Radix UI + Tailwind CSS
- **State Management**: React Query
- **AI**: OpenAI, Anthropic, DeepSeek

## Project Structure

```
codefusion/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── auth/          # Authentication API routes
│   ├── favicon.ico        # Website icon
│   ├── fonts/             # Font files
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── login/             # Login page
│   ├── main/              # Main application pages
│   ├── not-found.tsx      # 404 page
│   └── page.tsx           # Root page
├── components/            # React components
│   ├── provider/          # Context providers
│   ├── ui/                # UI component library
│   └── user-menu.tsx      # User menu component
├── hooks/                 # Custom Hooks
│   ├── use-mobile.tsx     # Mobile detection Hook
│   ├── use-scroll.ts      # Scroll Hook
│   └── use-toast.ts       # Toast notification Hook
├── lib/                   # Utility libraries
│   ├── auth/              # Authentication related
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # Database connection
│   ├── env.ts             # Environment variables
│   └── utils.ts           # Utility functions
├── prisma/                # Database related
│   ├── dev.db             # SQLite database file
│   └── schema.prisma      # Prisma model definitions
├── public/                # Public static files
├── scripts/               # Script files
│   └── setup-auth.sh      # Authentication setup script
├── @types/                # TypeScript type definitions
├── .eslintrc.json         # ESLint configuration
├── .gitignore             # Git ignore file
├── .prettierignore        # Prettier ignore file
├── .prettierrc.js         # Prettier configuration
├── components.json        # shadcn/ui configuration
├── env.example            # Environment variables template
├── next.config.mjs        # Next.js configuration
├── package.json           # Project configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Upcoming Features

- **v1.1.0** - Platform page foundation and basic functionality
- **v1.2.0** - Frontend project automated deployment integration
- **v1.3.0** - Node.js project automated deployment integration
- **v1.4.0** - Code collaboration management (PR/CR/MR)
- **v1.5.0** - Unified frontend-backend API configuration
- **v1.6.0** - AI-powered component auto-generation

## Contributing

We welcome Issue submissions and Pull Requests!

### Development Guide

1. Fork the project
2. Clone your forked repository (`git clone https://github.com/YOUR_USERNAME/codefusion.git`)
3. Create a feature branch (`git checkout -b feature/AmazingFeature`)
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

### Code Standards

- Use TypeScript for development
- Follow ESLint and Prettier configurations
- Write clear commit messages
- Add necessary test cases

## License

MIT License

## Changelog

### v0.1.0

- 🎉 Initial version release
- 🔐 Integrated GitHub and GitLab OAuth authentication
- 🎨 Modern UI design based on shadcn/ui
- 📱 Responsive design and theme switching
- 🗄️ SQLite local database support
- 🔧 Complete development toolchain configuration
- 🤖 AI code generation features (in development)

---

## 🏷️ Tags

#fullstack #devops #deployment #code-review #api-design #lowcode #component-generator #nextjs #opensource
