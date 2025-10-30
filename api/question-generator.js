// Vercel Serverless Function
// Load local .env when running this file directly for local testing
require('dotenv').config();

// Core logic from lib/question-generator.js
const { handleQuestionGeneration } = require('../lib/question-generator');

// Vercel's serverless Node.js runtime provides standard IncomingMessage and ServerResponse
// We can pass them directly to the lib function
module.exports = handleQuestionGeneration;
