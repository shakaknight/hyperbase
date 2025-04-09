const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration - adjust these as needed
const JWT_SECRET = 'local_development_jwt_secret';
const POSTGRES_URI = 'postgres://postgres:postgres@localhost:5432/hyperbase';
const EVENT_BUS_URL = 'nats://localhost:4222';

// Services to start
const services = [
  {
    name: 'auth-service',
    directory: path.join(__dirname, '..', 'auth-service'),
    env: {
      PORT: '3001',
      POSTGRES_URI,
      EVENT_BUS_URL,
      JWT_SECRET
    }
  },
  {
    name: 'vector-db',
    directory: path.join(__dirname, '..', 'vector-db'),
    env: {
      PORT: '3005',
      POSTGRES_URI,
      EVENT_BUS_URL
    }
  },
  {
    name: 'api-gateway',
    directory: path.join(__dirname, '..', 'api-gateway'),
    env: {
      PORT: '8000',
      EVENT_BUS_URL
    }
  }
];

// Running processes
const processes = {};

// Function to start a service
function startService(service) {
  console.log(`Starting ${service.name}...`);
  
  // Check if package.json exists
  const packageJsonPath = path.join(service.directory, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error(`Package.json not found for ${service.name}. Skipping.`);
    return;
  }
  
  // Create environment variables for the process
  const env = {
    ...process.env,
    ...service.env
  };
  
  // Start the service with npm run dev
  const proc = spawn('npm', ['run', 'dev'], {
    cwd: service.directory,
    env,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  // Store the process
  processes[service.name] = proc;
  
  // Handle output
  proc.stdout.on('data', (data) => {
    console.log(`[${service.name}] ${data.toString().trim()}`);
  });
  
  proc.stderr.on('data', (data) => {
    console.error(`[${service.name}] ${data.toString().trim()}`);
  });
  
  // Handle process exit
  proc.on('exit', (code, signal) => {
    if (code !== 0) {
      console.error(`${service.name} exited with code ${code} and signal ${signal}`);
    }
    delete processes[service.name];
    
    // Restart the service after a delay
    console.log(`Restarting ${service.name} in 5 seconds...`);
    setTimeout(() => startService(service), 5000);
  });
}

// Handle script termination
function cleanup() {
  console.log('\nShutting down all services...');
  Object.keys(processes).forEach((name) => {
    processes[name].kill();
  });
  process.exit(0);
}

// Handle signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

console.log('Starting HyperBase services for local development...');
console.log('Press Ctrl+C to stop all services\n');

// Start all services
services.forEach(startService);

// Keep the script running
process.stdin.resume(); 