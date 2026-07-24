export default class ScoreManager {
    constructor() {
        this.storageKey = 'semServidorScores';
        // A URL da API será configurada após o deploy
        // Substitua pelo valor do output ApiUrl do CloudFormation
        this.apiUrl = window.LEADERBOARD_API_URL || '';
    }
    
    /**
     * Busca o leaderboard da API remota (DynamoDB)
     * Fallback para localStorage se a API não estiver disponível
     */
    async getScores(limit = 10) {
        // Tentar buscar da API remota
        if (this.apiUrl) {
            try {
                const response = await fetch(`${this.apiUrl}/scores?limit=${limit}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    // Cachear no localStorage como backup
                    this.cacheScoresLocally(data.scores);
                    return data.scores;
                }
            } catch (error) {
                console.warn('Erro ao buscar leaderboard remoto, usando cache local:', error);
            }
        }
        
        // Fallback para localStorage
        return this.getLocalScores();
    }
    
    /**
     * Salva a pontuação na API remota (DynamoDB)
     * Fallback para localStorage se a API não estiver disponível
     */
    async addScore(score, name = 'Anônimo', cargo = '', email = '') {
        const scoreData = {
            name,
            cargo,
            email,
            score,
            timestamp: new Date().toISOString()
        };

        // Tentar salvar na API remota
        if (this.apiUrl) {
            try {
                const response = await fetch(`${this.apiUrl}/scores`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(scoreData)
                });
                
                if (response.ok) {
                    // Também salvar localmente como cache
                    this.addLocalScore(scoreData);
                    return true;
                }
            } catch (error) {
                console.warn('Erro ao salvar no leaderboard remoto, salvando localmente:', error);
            }
        }
        
        // Fallback para localStorage
        this.addLocalScore(scoreData);
        return true;
    }
    
    /**
     * Cache das pontuações remotas no localStorage
     */
    cacheScoresLocally(scores) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(scores));
        } catch (e) {
            console.error('Erro ao cachear pontuações localmente:', e);
        }
    }
    
    /**
     * Busca pontuações do localStorage (cache/fallback)
     */
    getLocalScores() {
        try {
            const scores = localStorage.getItem(this.storageKey);
            return scores ? JSON.parse(scores) : [];
        } catch (e) {
            console.error('Erro ao carregar pontuações locais:', e);
            return [];
        }
    }
    
    /**
     * Adiciona pontuação ao localStorage (cache/fallback)
     */
    addLocalScore(scoreData) {
        try {
            const scores = this.getLocalScores();
            scores.push(scoreData);
            scores.sort((a, b) => b.score - a.score);
            const topScores = scores.slice(0, 10);
            localStorage.setItem(this.storageKey, JSON.stringify(topScores));
        } catch (e) {
            console.error('Erro ao salvar pontuação local:', e);
        }
    }
    
    clearScores() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (e) {
            console.error('Erro ao limpar pontuações:', e);
            return false;
        }
    }
}
