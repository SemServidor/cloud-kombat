const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.LEADERBOARD_TABLE;

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
};

module.exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    try {
        const limit = Math.min(
            parseInt(event.queryStringParameters?.limit || '10', 10),
            50
        );

        // Query usando o GSI para obter os top scores ordenados
        const result = await docClient.send(new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: 'LeaderboardIndex',
            KeyConditionExpression: 'gameId = :gameId',
            ExpressionAttributeValues: {
                ':gameId': 'cloud-kombat'
            },
            ScanIndexForward: true, // negScore ascendente = score descendente
            Limit: limit
        }));

        const scores = (result.Items || []).map(item => ({
            id: item.id,
            name: item.name,
            cargo: item.cargo,
            email: item.email,
            score: item.score,
            timestamp: item.timestamp
        }));

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ scores })
        };
    } catch (error) {
        console.error('Erro ao buscar leaderboard:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Erro interno ao buscar leaderboard' })
        };
    }
};
