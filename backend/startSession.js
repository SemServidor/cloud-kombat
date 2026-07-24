const crypto = require('crypto');

const GAME_SECRET = process.env.GAME_SECRET || 'cloud-kombat-s3cr3t-2024';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
};

module.exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    try {
        // Gerar ID de sessão único
        const sessionId = crypto.randomUUID();
        const startTime = Date.now();

        // Gerar token HMAC que valida esta sessão
        const gameToken = crypto
            .createHmac('sha256', GAME_SECRET)
            .update(sessionId + ':' + startTime)
            .digest('hex');

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                sessionId,
                startTime,
                gameToken
            })
        };
    } catch (error) {
        console.error('Erro ao criar sessão:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Erro ao iniciar sessão' })
        };
    }
};
