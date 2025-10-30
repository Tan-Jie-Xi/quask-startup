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
    return new Promise((resolve) => {
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

        const maskKey = (k) => {
            if (!k) return '';
            if (k.length <= 8) return '****';
            return `${k.slice(0,4)}****${k.slice(-4)}`;
        };

        console.log('DeepSeek key present:', !!apiKey, usedKeyName ? `(from ${usedKeyName} ${maskKey(apiKey)})` : '');

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

        // Helper to perform a single HTTPS POST and return { statusCode, body }
        const doRequest = (path, headers) => {
            return new Promise((resReq) => {
                const options = {
                    hostname: 'api.deepseek.com',
                    port: 443,
                    path,
                    method: 'POST',
                    headers: Object.assign({
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'User-Agent': 'Quask/1.0',
                        'Content-Length': Buffer.byteLength(requestBody)
                    }, headers || {})
                };

                const req = https.request(options, (apiRes) => {
                    let data = '';
                    apiRes.on('data', (chunk) => { data += chunk; });
                    apiRes.on('end', () => {
                        resReq({ statusCode: apiRes.statusCode, body: data, headers: apiRes.headers });
                    });
                });

                req.on('error', (err) => {
                    resReq({ error: err });
                });

                req.write(requestBody);
                req.end();
            });
        };

        (async () => {
            // Try sequence of auth/header/path combinations
            const attempts = [
                { path: '/chat/completions', headers: { 'Authorization': `Bearer ${apiKey}` } },
                { path: '/chat/completions', headers: { 'X-API-Key': apiKey } },
                { path: '/chat/completions', headers: { 'Api-Key': apiKey } },
                { path: '/v1/chat/completions', headers: { 'Authorization': `Bearer ${apiKey}` } },
                { path: '/v1/chat/completions', headers: { 'X-API-Key': apiKey } }
            ];

            let lastResult = null;

            for (const attempt of attempts) {
                try {
                    const result = await doRequest(attempt.path, attempt.headers);
                    lastResult = result;

                    if (result && result.error) {
                        console.error('Request error during attempt', attempt, result.error && result.error.message);
                        continue;
                    }

                    console.log('Attempt', attempt.path, Object.keys(attempt.headers || {}), 'status:', result.statusCode);

                    // If non-2xx, try next attempt
                    if (!result.statusCode || result.statusCode < 200 || result.statusCode >= 300) {
                        console.warn('Non-2xx from DeepSeek:', result.statusCode, '(truncated body):', (result.body || '').slice(0,200));
                        continue;
                    }

                    // Parse body JSON
                    let response;
                    try {
                        response = JSON.parse(result.body);
                    } catch (e) {
                        console.error('Failed to parse JSON from DeepSeek (truncated):', (result.body || '').slice(0,200));
                        // try next attempt
                        continue;
                    }

                    if (response.error) {
                        console.error('DeepSeek responded with error object:', response.error);
                        // try next attempt
                        continue;
                    }

                    const content =
                        response &&
                        response.choices &&
                        Array.isArray(response.choices) &&
                        response.choices[0] &&
                        response.choices[0].message &&
                        response.choices[0].message.content;

                    if (!content) {
                        console.warn('DeepSeek response missing content, trying next attempt.');
                        continue;
                    }

                    // Clean and parse content
                    try {
                        let cleanContent = content.trim();
                        if (cleanContent.startsWith('```json')) {
                            cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                        } else if (cleanContent.startsWith('```')) {
                            cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
                        }
                        const parsedContent = JSON.parse(cleanContent);
                        resolve({ demo: false, content: JSON.stringify(parsedContent) });
                        return;
                    } catch (jsonErr) {
                        console.warn('AI returned non-JSON content, attempting next option. Content (truncated):', (content || '').slice(0,200));
                        continue;
                    }
                } catch (e) {
                    console.error('Unexpected error during attempt', attempt, e && e.message);
                    // continue to next attempt
                }
            }

            // All attempts failed — include short status or error reason
            if (lastResult && lastResult.statusCode) {
                resolve({ demo: true, content: null, error: `status_${lastResult.statusCode}` });
            } else if (lastResult && lastResult.error) {
                resolve({ demo: true, content: null, error: 'network_error' });
            } else {
                resolve({ demo: true, content: null, error: 'no_response' });
            }
        })();
    });
}

module.exports = { handleQuestionGeneration };