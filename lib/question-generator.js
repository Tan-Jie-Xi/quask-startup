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
        // Try several common env var names so we pick whatever is set in Vercel
        const keyNames = ['DEEPSEEK_API_KEY', 'DEEPSEEK_KEY', 'OPENAI_API_KEY', 'API_KEY'];
        let apiKey = null;
        let usedKeyName = null;
        for (const name of keyNames) {
            if (process.env[name]) {
                apiKey = process.env[name];
                usedKeyName = name;
                break;
            }
        }

        // small helper to mask a key for logs (don't print secrets)
        const maskKey = (k) => {
            if (!k) return '';
            if (k.length <= 8) return '****';
            return `${k.slice(0,4)}****${k.slice(-4)}`;
        };

        console.log('DeepSeek key present:', !!apiKey, usedKeyName ? `(from ${usedKeyName} ${maskKey(apiKey)})` : '');

        // minimal length check
        if (!apiKey || apiKey.length < 10) {
            console.log('Using demo response for question generation due to missing/invalid API key');
            resolve({ demo: true, content: null, error: 'no_key' });
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
                'Accept': 'application/json',
                'User-Agent': 'Quask/1.0',
                'Authorization': `Bearer ${apiKey}`,
                'Content-Length': Buffer.byteLength(requestBody)
            }
        };

        const req = https.request(options, (apiRes) => {
            // Log status and headers for debugging intermittent auth/network issues
            console.log('DeepSeek API response status:', apiRes.statusCode);
            console.log('DeepSeek API response headers:', apiRes.headers && Object.keys(apiRes.headers));

            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });
            
            apiRes.on('end', () => {
                try {
                    // If the API returned a non-2xx status, log and fallback to demo mode (include status code)
                    if (!apiRes.statusCode || apiRes.statusCode < 200 || apiRes.statusCode >= 300) {
                        console.error('DeepSeek API returned non-2xx status:', apiRes.statusCode);
                        console.error('DeepSeek API response body (truncated):', (data || '').slice(0, 200));
                        resolve({ demo: true, content: null, error: `status_${apiRes.statusCode}` });
                        return;
                    }

                    // Try to parse JSON response body
                    let response;
                    try {
                        response = JSON.parse(data);
                    } catch (parseErr) {
                        console.error('Failed to parse DeepSeek API JSON body:', parseErr);
                        console.error('Raw body (truncated):', (data || '').slice(0, 200));
                        resolve({ demo: true, content: null, error: 'invalid_json' });
                        return;
                    }

                    if (response.error) {
                        console.error('DeepSeek API error object:', response.error);
                        resolve({ demo: true, content: null, error: 'api_error' });
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
                        console.warn('DeepSeek API response missing expected content. Full response (truncated):', JSON.stringify(response).slice(0, 500));
                        resolve({ demo: true, content: null, error: 'no_content' });
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
                        console.warn('AI response is not valid JSON, falling back to demo mode. Content (truncated):', (content || '').slice(0,200));
                        resolve({ demo: true, content: null, error: 'bad_json_from_ai' });
                    }
                    
                } catch (parseError) {
                    // Catch-all: fallback to demo mode
                    console.error('Unexpected error handling DeepSeek response:', parseError);
                    resolve({ demo: true, content: null, error: 'unexpected' });
                }
            });
        });

        req.on('error', (error) => {
            console.error('Network error when calling DeepSeek API:', error && error.message);
            // Network errors are handled gracefully by returning demo mode instead of rejecting
            resolve({ demo: true, content: null, error: 'network_error' });
        });

        req.write(requestBody);
        req.end();
    });
}

module.exports = { handleQuestionGeneration };