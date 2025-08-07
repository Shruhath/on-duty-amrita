#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up DutyON Environment Variables...\n');

// Check if .env.local already exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!');
  console.log('Please backup your current .env.local file and run this script again.\n');
  process.exit(1);
}

// Create .env.local with template
const envTemplate = `# Firebase Configuration
# Get these values from your Firebase Console: https://console.firebase.google.com/
# Project Settings > General > Your apps

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Instructions:
# 1. Replace all "your_*" values with your actual Firebase configuration
# 2. Save the file
# 3. Restart your development server
`;

try {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env.local file created successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Open .env.local file');
  console.log('2. Replace all "your_*" values with your Firebase configuration');
  console.log('3. Save the file');
  console.log('4. Run "npm run dev" to start the development server');
  console.log('\n🔗 Get your Firebase config from: https://console.firebase.google.com/');
} catch (error) {
  console.error('❌ Error creating .env.local file:', error.message);
  process.exit(1);
} 