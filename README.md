# HyperBase

A modern backend platform with SQL, NoSQL, and vector database capabilities.

## Features

- **SQL Operations**: Execute SQL queries and transactions directly
- **NoSQL Database**: Work with schemaless collections and documents
- **Vector Database**: Store and query embeddings for AI applications
- **Authentication**: User management with JWT-based authentication
- **Unified API**: Consistent API across different database types
- **Event-driven**: Services communicate via NATS event bus

## Architecture

HyperBase consists of several microservices:

- **API Gateway** (port 8000): Routes requests to the appropriate service
- **Auth Service** (port 3001): Handles user authentication and authorization
- **Database API** (port 3002): Provides SQL and NoSQL operations
- **Vector DB** (port 3005): Manages vector embeddings for AI applications

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v13 or higher)
- NATS Server (optional, for event-driven features)

## Getting Started

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hyperbase.git
   cd hyperbase
   ```

2. Install dependencies:
   ```bash
   npm install
   npm run install:all
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Create the PostgreSQL database:
   ```bash
   createdb hyperbase
   # Or use your preferred method to create a database
   ```

### Development

Run all services in development mode:
```bash
npm run dev
```

Run without NATS event bus:
```bash
npm run dev:no-nats
```

Run individual services:
```bash
npm run dev:gateway   # API Gateway
npm run dev:auth      # Auth Service
npm run dev:db        # Database API
npm run dev:vector    # Vector DB
```

### Production

For production deployments, use the start scripts:
```bash
npm start             # Start all services
npm run start:gateway # Start API Gateway only
# etc.
```

## API Documentation

### Authentication API

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive JWT token
- `GET /auth/me` - Get current user details

### Database API

- `POST /database/sql/query` - Execute SQL query
- `POST /database/sql/transaction` - Execute SQL transaction
- `GET /database/collections` - List NoSQL collections
- `POST /database/collections` - Create collection
- `GET /database/collections/:id` - Get collection
- `PUT /database/collections/:id` - Update collection
- `DELETE /database/collections/:id` - Delete collection
- `GET /database/collections/:id/documents` - Get documents
- `POST /database/collections/:id/documents` - Create document
- `GET /database/collections/:id/documents/:docId` - Get document
- `PUT /database/collections/:id/documents/:docId` - Update document
- `DELETE /database/collections/:id/documents/:docId` - Delete document

### Vector Database API

- `GET /vector/collections` - List vector collections
- `POST /vector/collections` - Create vector collection
- `GET /vector/collections/:id/vectors` - List vectors
- `POST /vector/collections/:id/vectors` - Add vector
- `POST /vector/collections/:id/search` - Search similar vectors

## License

[MIT](LICENSE) 