# Running HyperBase Locally Without Docker

This guide explains how to set up and run HyperBase on your local machine without using Docker.

## Prerequisites

1. **Node.js**: Version 18 or higher
2. **PostgreSQL**: Version 15 recommended
3. **NATS Server**: For the event bus

## Installation Steps

### 1. Install PostgreSQL

#### macOS:
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql-15
sudo systemctl start postgresql
```

#### Windows:
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Install NATS Server

#### macOS:
```bash
brew install nats-server
```

#### Using npm (all platforms):
```bash
npm install -g nats-server
```

#### Or download from [NATS official website](https://nats.io/download/)

### 3. Install HyperBase Dependencies

Clone this repository and install dependencies:

```bash
git clone https://github.com/your-org/hyperbase.git
cd hyperbase
npm install
npm run install:all
```

## Setting Up the Environment

Run the setup script to create the database and required extensions:

```bash
npm run setup
```

This script will:
1. Check if PostgreSQL is installed
2. Create a database named `hyperbase` if it doesn't exist
3. Apply the necessary PostgreSQL extensions and schemas
4. Check if NATS server is running

## Running HyperBase

Start all services with a single command:

```bash
npm run dev
```

This will start:
- Auth Service (port 3001)
- Vector DB Service (port 3005)
- API Gateway (port 8000)

Each service will run with the necessary environment variables:
- `POSTGRES_URI`: Connection string for PostgreSQL
- `EVENT_BUS_URL`: URL for the NATS server
- `JWT_SECRET`: Secret for JWT token generation/verification

## Running Services Individually

If you prefer to run services individually for development:

### Auth Service:
```bash
cd auth-service
POSTGRES_URI="postgres://postgres:postgres@localhost:5432/hyperbase" EVENT_BUS_URL="nats://localhost:4222" JWT_SECRET="your_jwt_secret" npm run dev
```

### Vector DB Service:
```bash
cd vector-db
POSTGRES_URI="postgres://postgres:postgres@localhost:5432/hyperbase" EVENT_BUS_URL="nats://localhost:4222" npm run dev
```

### API Gateway:
```bash
cd api-gateway
EVENT_BUS_URL="nats://localhost:4222" npm run dev
```

## Testing the Setup

After starting the services, you can test your setup by creating a user:

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"securepassword", "fullName":"Test User"}'
```

## Troubleshooting

### Database Connection Issues

- Check if PostgreSQL is running: `ps aux | grep postgres`
- Verify connection details in the environment variables

### NATS Connection Issues

- Check if NATS server is running: `lsof -i:4222`
- Start NATS manually: `nats-server`

### Service Starting Problems

- Check logs for each service
- Verify that required ports are not in use
- Ensure all dependencies are installed 