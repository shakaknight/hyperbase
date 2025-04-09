const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const dbName = 'hyperbase';
const dbUser = 'postgres';
const dbPassword = 'postgres';

console.log('Setting up HyperBase local development environment...');

// Check if PostgreSQL is installed
try {
  console.log('Checking PostgreSQL installation...');
  execSync('psql --version', { stdio: 'inherit' });
} catch (error) {
  console.error('PostgreSQL is not installed or not in PATH. Please install PostgreSQL first.');
  process.exit(1);
}

// Create database if it doesn't exist
try {
  console.log(`Creating database "${dbName}" if it doesn't exist...`);
  execSync(
    `psql -U ${dbUser} -c "SELECT 1 FROM pg_database WHERE datname = '${dbName}'" | grep -q 1 || psql -U ${dbUser} -c "CREATE DATABASE ${dbName}"`,
    { stdio: 'inherit' }
  );
} catch (error) {
  console.error(`Failed to create database: ${error.message}`);
  process.exit(1);
}

// Apply initialization SQL script
try {
  console.log('Applying initialization SQL script...');
  const initSqlPath = path.join(__dirname, '..', 'init-scripts', 'postgres', 'init.sql');
  const initSql = fs.readFileSync(initSqlPath, 'utf8');
  
  // Write to a temporary file to avoid command line length limitations
  const tempSqlPath = path.join(__dirname, 'temp-init.sql');
  fs.writeFileSync(tempSqlPath, initSql);
  
  execSync(`psql -U ${dbUser} -d ${dbName} -f ${tempSqlPath}`, { stdio: 'inherit' });
  
  // Clean up
  fs.unlinkSync(tempSqlPath);
} catch (error) {
  console.error(`Failed to apply initialization SQL script: ${error.message}`);
  process.exit(1);
}

// Start NATS server if it's not running
try {
  console.log('Checking if NATS server is already running...');
  const natsCheck = execSync('lsof -i:4222').toString();
  if (!natsCheck.includes('nats-server')) {
    console.log('NATS server not found. Please install and start NATS server separately.');
    console.log('You can install NATS server with:');
    console.log('  - Homebrew (macOS): brew install nats-server');
    console.log('  - npm: npm install -g nats-server');
    console.log('Then start it with: nats-server');
  } else {
    console.log('NATS server is already running');
  }
} catch (error) {
  console.log('NATS server not running. Please install and start NATS server separately.');
  console.log('You can install NATS server with:');
  console.log('  - Homebrew (macOS): brew install nats-server');
  console.log('  - npm: npm install -g nats-server');
  console.log('Then start it with: nats-server');
}

console.log('\nSetup completed!');
console.log('\nTo run HyperBase services:');
console.log('1. Start auth-service: cd auth-service && npm run dev');
console.log('2. Start vector-db: cd vector-db && npm run dev');
console.log('3. Start api-gateway: cd api-gateway && npm run dev');
console.log('\nMake sure to set the following environment variables for each service:');
console.log('POSTGRES_URI=postgres://postgres:postgres@localhost:5432/hyperbase');
console.log('EVENT_BUS_URL=nats://localhost:4222');
console.log('JWT_SECRET=your_jwt_secret_for_development'); 