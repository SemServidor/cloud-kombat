const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.LEADERBOARD_TABLE;
const GAME_SECRET = process.env.GAME_SECRET || 'cloud-kombat-s3cr3t-2024';

// Score máximo aceito
const MAX_POSSIBLE_SCORE = 100;

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Game-Token',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
};

/**
 * Valida o token de sessão do jogo.
 * Token = HMAC-SHA256(secret, sessionId + startTime)
 */
function validateGameToken(sessionId, startTime, token) {
    if (!sessionId || !startTime || !token) return false;
    
    const expectedToken = crypto
        .createHmac('sha256', GAME_SECRET)
        .update(sessionId + ':' + startTime)
        .digest('hex');
    
    try {
        return crypto.timingSafeEqual(
            Buffer.from(token, 'hex'),
            Buffer.from(expectedToken, 'hex')
        );
    } catch (e) {
        return false;
    }
}

module.exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    try {
        const body = JSON.parse(event.body);
        const { name, cargo, email, score, sessionId, startTime, gameToken } = body;

        // === Validação básica ===
        if (!name || typeof score !== 'number') {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Dados incompletos' })
            };
        }

        // === Validação: score cap ===
        if (score < 0 || score > MAX_POSSIBLE_SCORE) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Pontuação inválida' })
            };
        }

        // === Validação: token de sessão ===
        if (!validateGameToken(sessionId, startTime, gameToken)) {
            return {
                statusCode: 403,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Sessão inválida' })
            };
        }

        // === Rate limiting: verificar se esse sessionId já foi usado ===
        try {
            const existing = await docClient.send(new QueryCommand({
                TableName: TABLE_NAME,
                IndexName: 'SessionIndex',
                KeyConditionExpression: 'sessionId = :sid',
                ExpressionAttributeValues: { ':sid': sessionId },
                Limit: 1
            }));
            
            if (existing.Items && existing.Items.length > 0) {
                return {
                    statusCode: 429,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ error: 'Sessão já utilizada' })
                };
            }
        } catch (e) {
            // Se o index não existe ainda, continuar
            console.warn('SessionIndex query failed, skipping:', e.message);
        }

        // === Salvar pontuação ===
        const timestamp = new Date().toISOString();
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

        const item = {
            id,
            gameId: 'cloud-kombat',
            sessionId: sessionId,
            name: name.substring(0, 15),
            cargo: (cargo || '').substring(0, 30),
            email: (email || '').substring(0, 40),
            score,
            timestamp,
            negScore: 0 - score
        };

        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: item
        }));

        return {
            statusCode: 201,
            headers: CORS_HEADERS,
            body: JSON.stringify({ message: 'Pontuação salva com sucesso', id })
        };
    } catch (error) {
        console.error('Erro ao salvar pontuação:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Erro interno ao salvar pontuação' })
        };
    }
};
