// Add dotenv bootstrap so this file uses the same .env as the rest of the project (fact checker)
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const https = require('https');

function handleQuestionGeneration(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-cache');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { prompt, questionType } = JSON.parse(body);
            
            if (!prompt) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Prompt is required' }));
                return;
            }

            const result = await generateQuestionWithAPI(prompt);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
            
        } catch (error) {
            console.error('Error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error', demo: true }));
        }
    });
}

async function generateQuestionWithAPI(prompt) {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        // Log presence of the key (don't print the key itself)
        console.log('DEEPSEEK_API_KEY present:', !!apiKey);

        // Accept any non-empty key (with a minimal length) instead of requiring an 'sk-' prefix
        if (!apiKey || apiKey.length < 10) {
            console.log('Using demo response for question generation due to missing/invalid DEEPSEEK_API_KEY');
            resolve({ demo: true, content: null });
            return;
        }

        const requestBody = JSON.stringify({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "You are a helpful assistant that generates educational questions. You must respond with ONLY valid JSON format. Do not include any text before or after the JSON. Do not use markdown formatting or code blocks." },
                { role: "user", content: prompt + "\n\nIMPORTANT: Respond with ONLY the JSON object, no additional text or formatting." }
            ],
            max_tokens: 500,
            temperature: 0.5,
            stream: false
        });

        const options = {
            hostname: 'api.deepseek.com',
            port: 443,
            path: '/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Content-Length': Buffer.byteLength(requestBody)
            }
        };

        const req = https.request(options, (apiRes) => {
            // Log status and headers for debugging intermittent auth/network issues
            console.log('DeepSeek API response status:', apiRes.statusCode);
            console.log('DeepSeek API response headers:', apiRes.headers);

            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });
            
            apiRes.on('end', () => {
                try {
                    // If the API returned a non-2xx status, log and fallback to demo mode
                    if (!apiRes.statusCode || apiRes.statusCode < 200 || apiRes.statusCode >= 300) {
                        console.error('DeepSeek API returned non-2xx status:', apiRes.statusCode);
                        console.error('DeepSeek API response body:', data);
                        // Don't reject to avoid surfacing internal errors to users; gracefully fallback
                        resolve({ demo: true, content: null });
                        return;
                    }

                    // Try to parse JSON response body
                    let response;
                    try {
                        response = JSON.parse(data);
                    } catch (parseErr) {
                        console.error('Failed to parse DeepSeek API JSON body:', parseErr);
                        console.error('Raw body:', data);
                        resolve({ demo: true, content: null });
                        return;
                    }

                    if (response.error) {
                        console.error('DeepSeek API error object:', response.error);
                        resolve({ demo: true, content: null });
                        return;
                    }
                    
                    // Defensive access to expected content
                    const content =
                        response &&
                        response.choices &&
                        Array.isArray(response.choices) &&
                        response.choices[0] &&
                        response.choices[0].message &&
                        response.choices[0].message.content;

                    if (!content) {
                        console.warn('DeepSeek API response missing expected content. Full response:', response);
                        resolve({ demo: true, content: null });
                        return;
                    }

                    try {
                        let cleanContent = content.trim();
                        
                        if (cleanContent.startsWith('```json')) {
                            cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                        } else if (cleanContent.startsWith('```')) {
                            cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
                        }
                        
                        const parsedContent = JSON.parse(cleanContent);
                        resolve({ demo: false, content: JSON.stringify(parsedContent) });
                    } catch (jsonParseError) {
                        console.warn('AI response is not valid JSON, falling back to demo mode. Content:', content);
                        resolve({ demo: true, content: null });
                    }
                    
                } catch (parseError) {
                    // Catch-all: fallback to demo mode
                    console.error('Unexpected error handling DeepSeek response:', parseError);
                    resolve({ demo: true, content: null });
                }
            });
        });

        req.on('error', (error) => {
            console.error('Network error when calling DeepSeek API:', error);
            // Network errors are handled gracefully by returning demo mode instead of rejecting
            resolve({ demo: true, content: null });
        });

        req.write(requestBody);
        req.end();
    });
}

module.exports = { handleQuestionGeneration };