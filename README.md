# Littlefish Foundation Platform

A decentralized collaboration platform for the Littlefish Foundation, enabling community coordination through Wooperatives, Action documentation, and a dynamic marketplace ecosystem with Cardano blockchain integration.

![Littlefish Foundation Platform](/generated-icon.png)

## Features

- **Wooperatives Management**: Create and join collaborative groups
- **Action Documentation**: Record and share verified impact activities
- **Marketplace**: Buy and sell impact actions with blockchain verification
- **Cardano Integration**: Connect Cardano wallets for authentication and transactions
- **Handle Name Support**: Full support for ADA Handle names with `$handle` format

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Traditional username/password + Cardano wallet
- **Blockchain**: Cardano mainnet integration with wallet connectors
- **UI Framework**: TailwindCSS with shadcn/ui components

## Prerequisites

Before running the application, make sure you have the following installed:

- Node.js 18+ and npm
- PostgreSQL 12+
- Git

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/littlefish_db

# Session Secret
SESSION_SECRET=your_session_secret_here

# Blockfrost API Key (Cardano)
BLOCKFROST_API_KEY=your_blockfrost_mainnet_api_key
```

You can obtain a Blockfrost API key by signing up at [blockfrost.io](https://blockfrost.io).

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/littlefish-platform.git
cd littlefish-platform
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
# Create the database
createdb littlefish_db

# Push the schema to the database
npm run db:push
```

## Running the Application

Start the development server:

```bash
npm run dev
```

This will start both the Express backend server and the Vite development server. The application will be available at `http://localhost:5000`.

## Development Workflow

The application uses a full-stack TypeScript approach:

- **Backend**: Located in the `server/` directory
- **Frontend**: Located in the `client/` directory
- **Shared**: Types and schemas in the `shared/` directory

### Key Directories and Files

- `shared/schema.ts`: Database schema and TypeScript types
- `server/routes.ts`: API endpoints
- `server/storage.ts`: Data access layer
- `client/src/App.tsx`: Main application component
- `client/src/pages/`: Page components
- `client/src/components/`: Reusable UI components
- `client/src/hooks/`: Custom React hooks

## Database Management

The project uses Drizzle ORM for database operations. Schema is defined in `shared/schema.ts`.

To make changes to the database schema:

1. Modify the schema in `shared/schema.ts`
2. Run `npm run db:push` to update the database

## Wallet Integration

The platform integrates with Cardano wallets like Nami, Eternl, Flint, and others. To set up a real wallet connection:

1. Install a compatible wallet extension in your browser
2. Ensure you have the Blockfrost API key set in your environment variables
3. Connect using the wallet integration in the UI

## Cardano Handle Name Support

The platform supports Cardano Handle Names (policy ID: `f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a`).

When connecting a wallet with a handle name:
- The handle is displayed with a `$` prefix (e.g., `$climate`)
- The handle is shown prominently in the wallet UI
- The full wallet address is still accessible

## Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run preview`: Preview the production build
- `npm run db:push`: Push schema changes to the database

## Demo Mode

For demonstration purposes, the application includes:

- Simulated wallet connections (no real wallet required)
- Random handle name generation
- Mock blockchain transactions
- Seeded example data

## License

[MIT License](LICENSE)

## Contact

For questions or feedback about this project, please contact [Littlefish Foundation](https://littlefish.foundation).