// Vercel Serverless Function
// Load local .env when running this file directly for local testing
require('dotenv').config();

// Core logic from lib/fact-check.js
const { handleFactCheck } = require('../lib/fact-check');

// Vercel's serverless Node.js runtime provides standard IncomingMessage and ServerResponse
// We can pass them directly to the lib function
module.exports = handleFactCheck;
