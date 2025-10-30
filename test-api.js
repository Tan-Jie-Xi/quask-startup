require('dotenv').config();
const https = require('https');

// Test the DeepSeek API directly
async function testDeepSeekAPI() {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        console.log('API Key starts with:', apiKey ? apiKey.slice(0, 6) + '...' : 'not found');

        const requestBody = JSON.stringify({
            model: "deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant."
                },
                {
                    role: "user",
                    content: "Say hello"
                }
            ],
            max_tokens: 100
        });

        const options = {
            hostname: 'api.deepseek.com',
            port: 443,
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Content-Length': Buffer.byteLength(requestBody)
            }
        };

        console.log('Making request to:', `https://${options.hostname}${options.path}`);
        
        const req = https.request(options, (res) => {
            console.log('Response status:', res.statusCode);
            console.log('Response headers:', res.headers);
            
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('Raw response:', data);
                try {
                    const response = JSON.parse(data);
                    if (response.error) {
                        console.error('API Error:', response.error);
                        reject(new Error(response.error.message));
                    } else {
                        resolve(response);
                    }
                } catch (e) {
                    reject(new Error('Failed to parse response: ' + e.message));
                }
            });
        });

        req.on('error', (error) => {
            console.error('Request error:', error);
            reject(error);
        });

        req.write(requestBody);
        req.end();
    });
}

// Run the test
console.log('Starting API test...');
testDeepSeekAPI()
    .then(response => {
        console.log('Success! API is working.');
        console.log('Response:', JSON.stringify(response, null, 2));
        process.exit(0);
    })
    .catch(error => {
        console.error('Test failed:', error.message);
        process.exit(1);
    });