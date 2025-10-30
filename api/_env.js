// Health-check / env presence endpoint (masked)
require('dotenv').config();

module.exports = (req, res) => {
    // CORS and simple OPTIONS handling
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const key = process.env.DEEPSEEK_API_KEY || '';
    const payload = {
        deepseekPresent: !!key,
        keyMasked: key ? key.slice(0, 6) + '...' : null
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
};
