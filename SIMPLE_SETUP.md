# Simple Setup Guide for HyperBase

This guide provides a simplified approach to running HyperBase locally without requiring advanced extensions like pgvector or NATS.

## Prerequisites

You only need:
1. **Node.js** (version 18 or higher)
2. **PostgreSQL** (any recent version)

## Installation Steps

### 1. Install PostgreSQL

#### macOS:
```bash
brew install postgresql
brew services start postgresql
```

#### Windows:
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql
sudo systemctl start postgresql
```

### 2. Create the Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE hyperbase;

# Exit PostgreSQL
\q
```

### 3. Install Dependencies

```bash
cd hyperbase
npm install
npm run install:all
```

## Running HyperBase

We'll use the simplified version that doesn't require NATS or pgvector:

```bash
npm run dev:no-nats
```

This will start:
- Auth Service on port 3001
- Vector DB Service on port 3005 (simplified version without pgvector)
- API Gateway on port 8000

## Testing the Setup

### 1. Create a User

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"securepassword", "fullName":"Test User"}'
```

### 2. Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"securepassword"}'
```

This will return a JWT token that you'll need for authenticated requests.

### 3. Create a Vector Collection

```bash
curl -X POST http://localhost:8000/vector/collections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"my-collection", "dimensions":3, "description":"Test collection"}'
```

### 4. Add a Vector

```bash
curl -X POST http://localhost:8000/vector/collections/COLLECTION_ID/vectors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"vector":[0.1, 0.2, 0.3], "metadata":{"text":"This is a test"}}'
```

## Limitations of Simplified Setup

1. **Limited Vector Search**: The simplified vector database doesn't support real similarity search, only filtering by metadata
2. **No Event Bus**: Services don't communicate with each other through events
3. **No Realtime Updates**: Without NATS, the realtime functionality is unavailable
4. **Limited Storage**: The storage service is not included in the simplified setup

This simplified setup is intended for basic development and testing only. For production use, we recommend using the full setup with Docker Compose.

## Troubleshooting

### Database Connection Issues

- Verify your PostgreSQL is running: `pg_isready`
- Check the connection string in the environment variables
- Make sure you've created the database: `psql -U postgres -l | grep hyperbase`

### Service Startup Issues

- Check the logs for specific errors
- Ensure the required ports (3001, 3005, 8000) are available
- Make sure all dependencies are installed 