#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create .env.local files for both client and server if they don't exist
const clientEnvPath = path.join(__dirname, 'client', '.env.local');
const serverEnvPath = path.join(__dirname, 'server', '.env');

// Client environment
if (!fs.existsSync(clientEnvPath)) {
  const clientEnvContent = `# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5174
`;
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  console.log('✅ Created client/.env.local');
} else {
  console.log('ℹ️  client/.env.local already exists');
}

// Server environment
if (!fs.existsSync(serverEnvPath)) {
  const serverEnvContent = `# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5174
NODE_ENV=development
CLIENT_URL=http://localhost:3000
`;
  fs.writeFileSync(serverEnvPath, serverEnvContent);
  console.log('✅ Created server/.env');
  console.log(
    '⚠️  Please update GEMINI_API_KEY in server/.env with your actual API key',
  );
} else {
  console.log('ℹ️  server/.env already exists');
}

console.log('\n🚀 Environment setup complete!');
console.log('\nNext steps:');
console.log(
  '1. Get your Gemini API key from https://makersuite.google.com/app/apikey',
);
console.log('2. Update GEMINI_API_KEY in server/.env');
console.log('3. Run "npm run dev" in both client/ and server/ directories');
