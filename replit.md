# Overview

Quask is an AI-powered educational platform that provides question generation, fact-checking, and quiz management tools for students and educators. The application features a clean, responsive web interface built with vanilla HTML, CSS, and JavaScript, offering interactive learning experiences through automated quiz creation, content verification, and progress tracking capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Pure HTML/CSS/JavaScript**: No frameworks used, leveraging modern web standards and ES6 modules for clean, maintainable code
- **Component-based Pages**: Modular HTML pages for each feature (dashboard, quiz generator, fact checker, profile management) with consistent navigation patterns
- **Responsive Design**: Mobile-first CSS approach using flexbox layouts and modern styling techniques
- **Firebase Client SDK**: Direct integration with Firebase services through CDN imports for authentication and data management
- **Hamburger Navigation**: Collapsible sidebar menu system for mobile-responsive navigation across all authenticated pages

## Backend Architecture
- **Custom Node.js HTTP Server**: Built-in HTTP server handling both static file serving and RESTful API endpoints
- **Modular API Structure**: Separate endpoint handlers in `/api` directory for fact-checking, question generation, answer evaluation, and text extraction
- **CORS-enabled**: Cross-origin resource sharing configured for seamless client-server communication
- **Static File Server**: Custom MIME type handling for various file formats (HTML, CSS, JS, images, PDFs)
- **File Upload Processing**: Formidable integration for handling file uploads with security validation

## Authentication System
- **Firebase Authentication**: Email/password and Google OAuth authentication flows with persistent session management
- **User Profile Management**: Comprehensive avatar uploads, display names, and profile customization workflows
- **Protected Routes**: Client-side authentication state management across page navigation with automatic redirects
- **Multi-step Onboarding**: Profile setup workflow for new users including avatar and username configuration

## Core Features
- **AI Question Generator**: Automated quiz question creation with support for Malaysian education formats (Primary 1-6, Form 1-5)
- **AI Smart Marking**: Intelligent answer evaluation using DeepSeek AI that accepts conceptually correct responses regardless of exact wording
- **Fact Checker**: Content verification system using AI analysis APIs for educational content validation
- **Quiz Library**: Comprehensive storage and management system for generated quizzes with enhanced filtering and search capabilities
- **Quiz Mode**: Interactive quiz-taking experience with real-time answer evaluation and immediate feedback
- **Progress Tracker**: User performance analytics and learning progress monitoring with detailed statistics
- **Text Extraction**: Advanced OCR capabilities for extracting text from images and PDFs using AI vision models

## Data Architecture
- **Firebase Firestore**: Primary NoSQL database for storing user profiles, quiz data, application state, and learning progress
- **Firebase Storage**: Cloud storage solution for profile pictures, uploaded content, and file attachments
- **Client-side State Management**: Browser localStorage for temporary data, user preferences, and session persistence
- **Batch Operations**: Firebase batch writes for efficient data operations and atomic updates

## Security & Performance
- **Rate Limiting**: Built-in request throttling to prevent API abuse (10 requests per minute per IP)
- **File Validation**: Magic number validation for uploaded files with support for JPEG, PNG, GIF, WebP, and PDF formats
- **File Size Limits**: 10MB maximum file size for uploads with proper error handling
- **Input Sanitization**: Server-side validation for all API endpoints with proper error responses

# External Dependencies

## Authentication & Storage Services
- **Firebase Authentication**: User registration, login, Google OAuth integration, and session management
- **Firebase Firestore**: NoSQL database for storing user data, quizzes, progress tracking, and application state
- **Firebase Storage**: Cloud storage for profile pictures, file uploads, and content attachments

## AI & Processing Services
- **DeepSeek AI API**: Advanced language model for question generation, answer evaluation, and fact-checking capabilities
- **DeepSeek Vision API**: OCR and image analysis for text extraction from uploaded images and PDFs
- **PDF Processing**: pdf-parse library for extracting text content from PDF documents

## File Processing Libraries
- **Formidable**: Multipart form data parsing for secure file upload handling
- **pdf-parse**: PDF text extraction with support for complex document structures