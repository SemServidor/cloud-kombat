const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.LEADERBOARD_TABLE;

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
};

module.exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    try {
        const body = JSON.parse(event.body);
        const { name, cargo, email, score } = body;

        // Validação básica
        if (!name || typeof score !== 'number') {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Nome e pontuação são obrigatórios' })
            };
        }

        if (score < 0 || score > 9999) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Pontuação inválida' })
            };
        }

        const timestamp = new Date().toISOString();
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

        const item = {
            id,
            gameId: 'cloud-kombat', // Partition key do GSI para queries no leaderboard
            name: name.substring(0, 15),
            cargo: (cargo || '').substring(0, 30),
            email: (email || '').substring(0, 40),
            score,
            timestamp,
            // GSI sort key: score negativo para ordenação descendente
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
