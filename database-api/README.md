# HyperBase Database API

A versatile database API that supports both SQL and NoSQL operations.

## Features

- SQL operations via PostgreSQL
- NoSQL document operations
- Collection management
- Real-time event publishing via NATS
- Health check endpoint

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - `PORT`: Port for the API server (default: 3000)
   - `DB_URL`: PostgreSQL connection string
   - `NATS_URL`: NATS server URL

## Running the API

```
npm start
```

For development with auto-reload:
```
npm run dev
```

## API Endpoints

### Health Check
- `GET /health`: Check API health

### SQL Operations
- `POST /sql/query`: Execute SQL query
- `POST /sql/transaction`: Execute SQL transaction

### NoSQL Operations
- `GET /collections`: List all collections
- `POST /collections`: Create a new collection
- `GET /collections/:id`: Get collection by ID
- `DELETE /collections/:id`: Delete collection by ID
- `GET /collections/:id/documents`: List documents in collection
- `POST /collections/:id/documents`: Create a document in collection
- `GET /collections/:id/documents/:docId`: Get document by ID
- `PUT /collections/:id/documents/:docId`: Update document by ID
- `DELETE /collections/:id/documents/:docId`: Delete document by ID

## License

MIT 