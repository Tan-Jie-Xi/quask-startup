# Quask - Interactive Quiz and Learning Platform

## Overview
Quask is a web-based quiz and learning platform with AI-powered features including:
- Question generation
- Answer evaluation  
- Fact checking
- Text extraction from PDFs and images (OCR)

**Current State**: Project is fully set up and running on port 5000

## Recent Changes (October 28, 2025)
- Reorganized messy folder structure - moved all files from `Quask github ver 28102025/tan-jie-xi.github.io-main/` to root directory
- Created `package.json` with required dependencies
- Installed Node.js 20 and npm packages (formidable, pdf-parse, tesseract.js)
- Set up server workflow to run on port 5000
- Created `.gitignore` for Node.js projects
- Created `firebase-config.js` to centralize Firebase configuration and fix profile picture loading
- Added DEEPSEEK_API_KEY to environment secrets for AI features
- Fixed quiz-library.html to handle missing FirebaseDataManager gracefully (uses localStorage for quiz storage)

## Project Structure
```
/
├── api/                    # Backend API handlers
│   ├── answer-evaluation.js
│   ├── fact-check.js
│   ├── question-generator.js
│   └── text-extraction.js
├── assets/                 # Images and icons
├── server.js              # Main Node.js server (entry point)
├── script.js              # Frontend JavaScript with Firebase
├── index.html             # Landing page
├── dashboard.html         # Main dashboard
├── quiz-mode.html         # Quiz interface
└── ... (other HTML/CSS files)
```

## Technology Stack
- **Backend**: Node.js with HTTP server
- **Frontend**: HTML, CSS, vanilla JavaScript
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Dependencies**:
  - `formidable` - File upload handling
  - `pdf-parse` - PDF text extraction
  - `tesseract.js` - OCR for images

## Running the Project
The server automatically runs via the configured workflow:
- Command: `node server.js`
- Port: 5000
- Access the site through the preview panel

## API Endpoints
- `/api/fact-check` - Verify facts using AI
- `/api/generate-question` - Generate quiz questions
- `/api/evaluate-answer` - Evaluate user answers
- `/api/extract-text` - Extract text from uploaded files (PDF/images)

## Firebase Configuration
Firebase is configured in `script.js` for:
- User authentication (email/password, Google sign-in)
- File storage for user uploads
- Profile management

## Development Notes
- Server binds to 0.0.0.0:5000 for Replit compatibility
- Cache control set to `no-cache` for immediate updates
- CORS headers configured for Replit domains
- Rate limiting implemented on file upload endpoints (10 requests/minute)
