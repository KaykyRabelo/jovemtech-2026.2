# jovemtech-2026.2 — Campo Minado

Campo minado em JavaScript puro para Node.js, jogado no terminal, sem dependências externas.

## Como rodar

```bash
git clone https://github.com/KaykyRabelo/jovemtech-2026.2.git
cd jovemtech-2026.2
npm start
```

Requer Node.js 18 ou mais novo.

Opções:

| Opção | Efeito |
| --- | --- |
| `--ascii` | troca os símbolos Unicode por caracteres simples |
| `--sem-cor` | desliga as cores (a variável `NO_COLOR` também funciona) |

Exemplo: `npm start -- --ascii --sem-cor`

## Como jogar

O tabuleiro é 8×8 com 10 minas. A letra indica a **coluna** e o número, a **linha**.

| Comando | O que faz |
| --- | --- |
| `r B3` | abre a casa na coluna B, linha 3 |
| `b B3` | marca ou desmarca bandeira em B3 |
| `dica` | abre uma casa segura (a partida não conta para o recorde) |
| `ajuda` | mostra os comandos |
| `sair` | encerra o jogo |

Você vence ao abrir todas as casas sem mina.

### Regras

- As minas só são sorteadas **depois da primeira jogada**, que nunca cai em uma mina.
- Cada número indica quantas das 8 casas vizinhas têm mina.
- Abrir uma casa vazia abre automaticamente a área vazia ao redor (cascata).
- O cronômetro começa na primeira jogada e para quando a partida termina.
- O melhor tempo de vitória fica salvo em `recorde.json`. Partidas com dica não entram no recorde.

### Símbolos e cores

A cor nunca é a única informação: cada estado tem um símbolo próprio.

| Estado | Unicode | ASCII | Cor |
| --- | --- | --- | --- |
| Casa fechada | `■` | `#` | padrão |
| Casa vazia aberta | `·` | `.` | cinza |
| Bandeira | `⚑` | `F` | amarelo (verde na vitória) |
| Mina | `*` | `*` | vermelho |
| Bandeira errada (na derrota) | `✗` | `x` | vermelho |
| Números 1 a 8 | `1`–`8` | `1`–`8` | azul, verde, vermelho, magenta, amarelo, ciano, negrito, cinza |

## Estrutura do projeto

| Arquivo | Responsabilidade |
| --- | --- |
| `src/config.js` | tamanho do tabuleiro, número de minas e símbolos |
| `src/cores.js` | funções de cor ANSI |
| `src/tabuleiro.js` | criação do tabuleiro, sorteio de minas e contagem de vizinhas |
| `src/regras.js` | abrir casas, cascata, bandeira, dica, vitória, derrota e cronômetro |
| `src/entrada.js` | validação do texto digitado |
| `src/render.js` | desenho do tabuleiro em texto colorido |
| `src/recorde.js` | leitura e gravação do recorde |
| `src/index.js` | loop do jogo e entrada/saída no terminal |

Para mudar o tamanho do tabuleiro ou o número de minas, edite `src/config.js`.

## Testes

```bash
npm test
```

Usa o executor nativo `node:test`, sem bibliotecas de terceiros. A lógica aceita um gerador de números aleatórios e um relógio injetados, o que torna os testes determinísticos.

## Limitações

- Não há "chording" (abrir os vizinhos de um número já satisfeito).
- Há um único nível de dificuldade.
- O recorde vale apenas no computador onde o jogo roda.

## Equipe

- Kayky Rabelo
