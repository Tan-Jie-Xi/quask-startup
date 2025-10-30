// Vercel Serverless Function
// Core logic from lib/text-extraction.js - completely unchanged
const { handleTextExtraction } = require('../lib/text-extraction');

// Vercel's serverless Node.js runtime provides standard IncomingMessage and ServerResponse
// We can pass them directly to the lib function
module.exports = handleTextExtraction;
