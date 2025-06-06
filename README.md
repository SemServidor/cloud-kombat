# Sem Servidor: Smash Mode

Um jogo arcade leve e divertido que roda exclusivamente em navegadores desktop, utilizando Phaser 3 como framework principal. O jogo é totalmente client-side, sem backend ou servidores envolvidos.

## 🎮 Sobre o Jogo

**Tema:** Destruir servidores e computadores como metáfora visual da filosofia serverless. O estilo é irreverente, em pixel-art, com mecânicas inspiradas no *T-Rex Game* do Chrome e *Fruit Ninja*.

**Plataforma:** Navegador desktop (Chrome, Firefox, Edge)

## 🚀 Como Jogar

1. Escolha sua arma: marreta, taco de beisebol ou pé de cabra
2. Clique nos servidores que aparecem na tela para destruí-los e ganhar pontos
3. Evite clicar nas nuvens, pois você perderá uma vida
4. O jogo termina quando você perder todas as 3 vidas
5. Registre seu nome para entrar no ranking local

## 🛠️ Tecnologias Utilizadas

- JavaScript (ES6+)
- Phaser 3
- HTML5, CSS3
- LocalStorage para leaderboard

## 📋 Requisitos

- Navegador desktop moderno (Chrome, Firefox, Edge)
- JavaScript habilitado

## 🔧 Instalação e Execução

1. Clone este repositório:
   ```
   git clone https://github.com/seu-usuario/sem-servidor-smash-mode.git
   ```

2. Navegue até a pasta do projeto:
   ```
   cd sem-servidor-smash-mode
   ```

3. Inicie um servidor local. Você pode usar o módulo `http-server` do Node.js:
   ```
   npx http-server
   ```
   
   Ou o servidor embutido do Python:
   ```
   python -m http.server
   ```

4. Abra seu navegador e acesse `http://localhost:8080` (ou a porta indicada pelo servidor)

## 🚀 Deploy

O jogo pode ser facilmente implantado em qualquer serviço de hospedagem estática:

- GitHub Pages
- Netlify
- Vercel
- Amazon S3

## 📁 Estrutura do Projeto

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

## 🎨 Personalização

Para personalizar o jogo, você pode:

1. Substituir as imagens na pasta `assets/`
2. Ajustar parâmetros de dificuldade em `game/scenes/GameScene.js`
3. Modificar estilos visuais em `styles/main.css`

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👨‍💻 Autor

Desenvolvido por [Seu Nome]

---

**Importante:** Este jogo é totalmente client-side e não requer nenhum servidor para funcionar, representando visualmente a ideia de "Sem Servidor".
