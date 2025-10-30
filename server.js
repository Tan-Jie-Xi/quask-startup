// Local Development Server
// Use this for testing in VS Code
// For Vercel deployment, this file is not used

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { handleFactCheck } = require('./lib/fact-check');
const { handleQuestionGeneration } = require('./lib/question-generator');
const { handleAnswerEvaluation } = require('./lib/answer-evaluation');
const { handleTextExtraction } = require('./lib/text-extraction');

// Load environment variables from .env file for local development
require('dotenv').config();

// Check that DeepSeek API key is available and give a masked log for easier debugging
const _deepseekKey = process.env.DEEPSEEK_API_KEY;
if (!_deepseekKey || !_deepseekKey.startsWith('sk-') || _deepseekKey.length < 20) {
    console.warn('\n⚠️  DEEPSEEK_API_KEY is not set or looks invalid. AI features will run in demo mode.');
} else {
    console.log(`\n🔒 DEEPSEEK_API_KEY loaded: ${_deepseekKey.slice(0,6)}... (masked)`);
}

const PORT = process.env.PORT || 5000;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function serveStaticFile(req, res, filePath) {
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache'
            });
            res.end(content, 'utf-8');
        }
    });
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    // Handle API endpoints
    if (pathname === '/api/fact-check') {
        handleFactCheck(req, res);
        return;
    }

    if (pathname === '/api/generate-question' || pathname === '/api/question-generator') {
        handleQuestionGeneration(req, res);
        return;
    }

    if (pathname === '/api/evaluate-answer' || pathname === '/api/answer-evaluation') {
        handleAnswerEvaluation(req, res);
        return;
    }

    if (pathname === '/api/extract-text' || pathname === '/api/text-extraction') {
        handleTextExtraction(req, res);
        return;
    }

    // Local-only health endpoint mapped to api/_env.js (helps verify env vars locally)
    if (pathname === '/api/_env') {
        try {
            const envHandler = require('./api/_env');
            envHandler(req, res);
        } catch (err) {
            console.error('Failed to load env health handler:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to load env handler' }));
        }
        return;
    }

    // Handle static files
    if (pathname === '/') {
        pathname = '/index.html';
    }

    const filePath = path.join(__dirname, pathname);
    serveStaticFile(req, res, filePath);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Local development server running at http://localhost:${PORT}`);
    console.log(`📝 Open your browser to http://localhost:${PORT} to test the app`);
    console.log(`\n⚠️  Make sure you have a .env file with your DEEPSEEK_API_KEY`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
