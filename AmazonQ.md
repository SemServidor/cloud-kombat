# Sem Servidor: Smash Mode - Documentação de Desenvolvimento

Este documento contém informações sobre o desenvolvimento do jogo "Sem Servidor: Smash Mode", implementado com Phaser 3.

## Estrutura do Projeto

O projeto segue uma estrutura modular organizada por funcionalidade:

```
sem-servidor-smash-mode/
├── index.html          # Página principal
├── main.js             # Inicialização do jogo
├── game/
│   ├── scenes/         # Cenas do jogo (menu, gameplay, gameover)
│   ├── objects/        # Objetos do jogo (servidor, nuvem, arma)
│   └── utils/          # Utilitários (pontuação, leaderboard)
├── assets/
│   ├── sprites/        # Imagens dos elementos do jogo
│   └── ui/             # Elementos de interface
├── styles/
│   └── main.css        # Estilos CSS
└── README.md           # Documentação
```

## Componentes Principais

### 1. Cenas (Scenes)

- **MenuScene**: Tela inicial com seleção de arma e exibição do leaderboard
- **GameScene**: Gameplay principal onde o jogador destrói servidores
- **GameOverScene**: Tela de fim de jogo com registro de pontuação

### 2. Objetos (Objects)

- **Server**: Representa os servidores que o jogador deve destruir
- **Cloud**: Representa as nuvens que o jogador deve evitar
- **Weapon**: Representa a arma selecionada pelo jogador

### 3. Utilitários (Utils)

- **ScoreManager**: Gerencia o sistema de pontuação e leaderboard usando LocalStorage

## Fluxo do Jogo

1. O jogador inicia na tela de menu e escolhe uma arma
2. Na tela de gameplay, servidores e nuvens aparecem aleatoriamente
3. O jogador clica nos servidores para destruí-los e ganhar pontos
4. Se o jogador clicar em uma nuvem, perde uma vida
5. O jogo termina quando o jogador perde todas as 3 vidas
6. Na tela de game over, o jogador pode registrar seu nome para o leaderboard

## Mecânicas de Jogo

- **Progressão de Dificuldade**: A frequência e velocidade dos objetos aumentam com o tempo
- **Sistema de Vidas**: O jogador começa com 3 vidas e perde uma ao clicar em nuvens
- **Sistema de Pontuação**: Cada servidor destruído vale 1 ponto
- **Leaderboard Local**: As melhores pontuações são salvas no LocalStorage do navegador

## Personalização

Para personalizar o jogo:

1. **Sprites**: Substitua as imagens na pasta `assets/sprites/` e `assets/ui/`
2. **Dificuldade**: Ajuste os parâmetros em `game/scenes/GameScene.js`:
   - `spawnRate`: Tempo entre spawns de objetos
   - `minSpawnRate`: Tempo mínimo entre spawns
   - `difficultyInterval`: Intervalo para aumentar a dificuldade

3. **Estilos Visuais**: Modifique `styles/main.css` para alterar a aparência geral

## Requisitos para Execução

- Navegador desktop moderno (Chrome, Firefox, Edge)
- Servidor HTTP local para desenvolvimento (http-server, Python http.server)

## Próximos Passos

Possíveis melhorias para futuras versões:

1. Adicionar efeitos sonoros e música de fundo
2. Implementar power-ups e bônus especiais
3. Adicionar mais tipos de servidores com pontuações diferentes
4. Criar modos de jogo adicionais (tempo limitado, desafio)
5. Melhorar os efeitos visuais (partículas, explosões)

## Notas de Implementação

- O jogo utiliza módulos ES6 para organização do código
- A física é implementada usando o sistema Arcade do Phaser 3
- O leaderboard é armazenado localmente usando LocalStorage
- Não há dependência de backend ou servidores externos
