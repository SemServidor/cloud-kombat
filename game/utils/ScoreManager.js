export default class ScoreManager {
    constructor() {
        this.storageKey = 'semServidorScores';
    }
    
    getScores() {
        try {
            const scores = localStorage.getItem(this.storageKey);
            return scores ? JSON.parse(scores) : [];
        } catch (e) {
            console.error('Erro ao carregar pontuações:', e);
            return [];
        }
    }
    
    addScore(score, name = 'Anônimo') {
        try {
            const scores = this.getScores();
            
            // Adicionar nova pontuação
            scores.push({
                name: name,
                score: score,
                date: new Date().toISOString()
            });
            
            // Ordenar por pontuação (maior para menor)
            scores.sort((a, b) => b.score - a.score);
            
            // Limitar a 10 pontuações
            const topScores = scores.slice(0, 10);
            
            // Salvar no localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(topScores));
            
            return true;
        } catch (e) {
            console.error('Erro ao salvar pontuação:', e);
            return false;
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
