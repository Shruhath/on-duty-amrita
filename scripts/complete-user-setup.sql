-- Complete User Setup Documentation
-- This script documents the complete setup process for the OD Manager system

-- Step 1: Create Firebase Project
-- 1. Go to Firebase Console (https://console.firebase.google.com)
-- 2. Create a new project
-- 3. Enable Authentication (Email/Password)
-- 4. Enable Firestore Database
-- 5. Copy configuration to environment variables

-- Step 2: Set Environment Variables
-- NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
-- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
-- NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
-- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
-- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
-- NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

-- Step 3: Create Admin User
-- Use the /setup page to create your first admin user
-- This user will have full access to the system

-- Step 4: Upload Student Data
-- Use the admin panel to upload CSV with format:
-- Roll Number, Name
-- Example: CB.SC.U4CSE24124, John Doe

-- Step 5: Assign Coordinators
-- Use the admin panel to assign student coordinators
-- for Gokulashtami events (Procession, Campus Decoration, Float, Culturals)

-- Step 6: Configure Firestore Security Rules
-- Copy the rules from the debug page to Firebase Console

-- Note: This is a documentation file for the setup process
-- Actual implementation is done through the web interface
