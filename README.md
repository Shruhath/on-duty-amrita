# DutyON - On Duty Leave Management System

A comprehensive On Duty leave management system for educational institutions with NFC integration, role-based access control, and automated Excel export functionality.

## Overview

DutyON is a modern web application designed to streamline the management of On Duty (OD) leave requests and attendance tracking in educational institutions. Built with Next.js, Firebase, and TypeScript, it provides a robust solution for administrators, teachers, coordinators, and students.

## Environment Setup

### 1. Create Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase configuration:

```bash
cp .env.example .env.local
```

### 2. Required Environment Variables

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Copy the configuration values

## Features

- 🔐 **Role-based Authentication** (Admin, Teacher, Coordinator, Student)
- 📱 **NFC Integration** for quick attendance tracking
- 📊 **Excel Export** functionality for coordinator lists
- 🎯 **Real-time Database** with Firestore
- 📋 **On Duty Management** with slot-based tracking
- 🔍 **Search & Filter** capabilities
- 🛡️ **Security Best Practices** with environment variables
- 📱 **Responsive Design** for all devices

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shruhath/on-duty-amrita.git
   cd on-duty-amrita
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   npm run setup
   # Then edit .env.local with your Firebase config
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Firebase (Authentication, Firestore)
- **Deployment**: Any platform supporting Next.js
- **Additional**: XLSX for Excel export, NFC Web API

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
