# HyperBase Client SDK

HyperBase Client SDK provides a unified interface for interacting with all HyperBase services. It simplifies authentication, database operations, file storage, and vector embeddings in a single, easy-to-use package.

## Installation

### JavaScript/TypeScript

```bash
npm install @hyperbase/client
# or
yarn add @hyperbase/client
# or
pnpm add @hyperbase/client
```

### Python

```bash
pip install hyperbase-client
# or
poetry add hyperbase-client
```

### Go

```bash
go get github.com/hyperbase/client-go
```

## Quick Start

```javascript
import { createClient } from '@hyperbase/client';

// Initialize the client
const hyperbase = createClient({
  url: 'https://api.yourdomain.com',
  apiKey: 'your-api-key' // Optional, can also use email/password auth
});

// Authentication
async function signUp() {
  const { user, error } = await hyperbase.auth.signUp({
    email: 'user@example.com',
    password: 'securepassword',
    data: {
      fullName: 'John Doe'
    }
  });
  
  if (error) {
    console.error('Error signing up:', error.message);
    return;
  }
  
  console.log('User signed up:', user);
}

async function signIn() {
  const { user, error } = await hyperbase.auth.signIn({
    email: 'user@example.com',
    password: 'securepassword'
  });
  
  if (error) {
    console.error('Error signing in:', error.message);
    return;
  }
  
  console.log('User signed in:', user);
}

// SQL Database Operations
async function sqlExample() {
  // Create a table
  await hyperbase.database.sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  // Insert data
  const { data, error } = await hyperbase.database.sql`
    INSERT INTO products (name, price)
    VALUES ('Product 1', 19.99), ('Product 2', 29.99)
    RETURNING *
  `;
  
  // Query data
  const { data: products } = await hyperbase.database.sql`
    SELECT * FROM products ORDER BY price DESC
  `;
  
  console.log('Products:', products);
}

// NoSQL Database Operations
async function noSqlExample() {
  // Get the collection
  const users = hyperbase.database.collection('users');
  
  // Insert a document
  const { id } = await users.insert({
    name: 'Alice',
    age: 28,
    interests: ['reading', 'hiking'],
    metadata: {
      lastLogin: new Date()
    }
  });
  
  // Query documents
  const youngUsers = await users
    .where('age', '<', 30)
    .where('interests', 'array-contains', 'hiking')
    .limit(10)
    .get();
  
  console.log('Young users who like hiking:', youngUsers);
  
  // Real-time subscription
  const unsubscribe = users
    .where('age', '<', 30)
    .subscribe((snapshot) => {
      console.log('Users updated:', snapshot.docs);
    });
  
  // Later: unsubscribe()
}

// File Storage
async function storageExample() {
  // Upload a file
  const { path } = await hyperbase.storage
    .bucket('profile-pictures')
    .upload('avatar.png', file, {
      contentType: 'image/png',
      metadata: {
        userId: '123'
      }
    });
  
  // Get a file URL
  const url = hyperbase.storage
    .bucket('profile-pictures')
    .getPublicUrl(path);
  
  console.log('File URL:', url);
}

// Vector Database
async function vectorExample() {
  // Create a collection
  await hyperbase.vector.createCollection({
    name: 'documents',
    dimensions: 1536 // OpenAI embeddings
  });
  
  // Insert a vector
  const { id } = await hyperbase.vector
    .collection('documents')
    .insert({
      vector: [...], // 1536-dimensional vector
      metadata: {
        text: 'This is a sample document',
        source: 'example.com'
      }
    });
  
  // Search for similar vectors
  const results = await hyperbase.vector
    .collection('documents')
    .search({
      vector: [...], // Query vector
      k: 10, // Return top 10 matches
      filter: { source: 'example.com' } // Optional filter
    });
  
  console.log('Similar documents:', results);
}

// Functions
async function functionsExample() {
  // Call a serverless function
  const { data, error } = await hyperbase.functions.invoke('process-image', {
    url: 'https://example.com/image.jpg',
    options: {
      resize: true,
      width: 800
    }
  });
  
  console.log('Function result:', data);
}
```

## TypeScript Support

The HyperBase Client SDK is written in TypeScript and provides full type definitions for all its APIs.

```typescript
import { createClient, User, Product } from '@hyperbase/client';

// Type-safe database operations
interface Product {
  id: number;
  name: string;
  price: number;
  created_at: string;
}

const { data } = await hyperbase.database.sql<Product[]>`
  SELECT * FROM products
`;

// Type-safe vector operations
interface DocumentMetadata {
  text: string;
  source: string;
  category?: string;
}

const results = await hyperbase.vector
  .collection<DocumentMetadata>('documents')
  .search({
    vector: [...],
    k: 10
  });
```

## Error Handling

All HyperBase Client SDK methods return a consistent result format with data and error properties.

```javascript
const { data, error } = await hyperbase.database.sql`
  SELECT * FROM products
`;

if (error) {
  console.error('Error fetching products:', error.message);
  // Handle the error appropriately
  return;
}

// Continue with the data
console.log('Products:', data);
```

## Advanced Authentication

### Multi-Factor Authentication

```javascript
// Enable MFA
const { secret, otpauth } = await hyperbase.auth.mfa.enable();

// Show QR code to user (otpauth can be converted to QR code)
showQRCode(otpauth);

// Verify MFA setup with code from authenticator app
await hyperbase.auth.mfa.verify('123456');

// Sign in with MFA
const { user, error } = await hyperbase.auth.signIn({
  email: 'user@example.com',
  password: 'securepassword',
  mfaCode: '123456'
});
```

### Social Authentication

```javascript
// Sign in with Google
const { user, error } = await hyperbase.auth.signInWithProvider('google');

// Link existing account with GitHub
await hyperbase.auth.linkWithProvider('github');
```

## Best Practices

1. **Handle Authentication State Changes**: 
   ```javascript
   hyperbase.auth.onAuthStateChange((event, session) => {
     if (event === 'SIGNED_IN') {
       // User signed in
     } else if (event === 'SIGNED_OUT') {
       // User signed out
     } else if (event === 'TOKEN_REFRESHED') {
       // Session token was refreshed
     }
   });
   ```

2. **Use Transactions**: 
   ```javascript
   await hyperbase.database.transaction(async (tx) => {
     await tx.sql`UPDATE accounts SET balance = balance - 100 WHERE id = 1`;
     await tx.sql`UPDATE accounts SET balance = balance + 100 WHERE id = 2`;
   });
   ```

3. **Batch Operations**: 
   ```javascript
   await hyperbase.vector.collection('documents').bulkInsert([
     { vector: [...], metadata: { text: 'Document 1' } },
     { vector: [...], metadata: { text: 'Document 2' } },
     // ...more vectors
   ]);
   ```

## Complete Documentation

For detailed API reference and advanced usage, visit the [HyperBase Documentation](https://docs.hyperbase.dev). 