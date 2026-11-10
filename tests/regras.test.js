'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  novoJogo,
  abrirCasa,
  alternarBandeira,
  pedirDica,
  minasRestantes,
  tempoDecorrido,
} = require('../src/regras');

// Monta um jogo com minas em posições conhecidas (sem depender de sorteio).
function jogoComMinas(linhas, colunas, posicoes) {
  const jogo = novoJogo(linhas, colunas, posicoes.length);
  for (const [l, c] of posicoes) jogo.tabuleiro[l][c].mina = true;
  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < colunas; c++) {
      let n = 0;
      for (let dl = -1; dl <= 1; dl++) {
        for (let dc = -1; dc <= 1; dc++) {
          const a = l + dl;
          const b = c + dc;
          if ((dl || dc) && jogo.tabuleiro[a] && jogo.tabuleiro[a][b] && jogo.tabuleiro[a][b].mina) n++;
        }
      }
      jogo.tabuleiro[l][c].vizinhas = n;
    }
  }
  jogo.minasSorteadas = true;
  jogo.inicio = 0;
  return jogo;
}

test('primeira jogada nunca é mina e inicia o cronômetro', () => {
  const jogo = novoJogo(8, 8, 10);
  const r = abrirCasa(jogo, 0, 0, { agora: 5000 });
  assert.equal(r.ok, true);
  assert.equal(r.explodiu, false);
  assert.equal(jogo.inicio, 5000);
  assert.equal(jogo.minasSorteadas, true);
});

test('abrir uma mina termina em derrota', () => {
  const jogo = jogoComMinas(3, 3, [[0, 0]]);
  const r = abrirCasa(jogo, 0, 0, { agora: 3000 });
  assert.equal(r.explodiu, true);
  assert.equal(jogo.status, 'derrota');
  assert.deepEqual(jogo.minaAtingida, [0, 0]);
});

test('casa vazia abre em cascata e para nos números', () => {
  const jogo = jogoComMinas(4, 4, [[3, 3]]);
  abrirCasa(jogo, 0, 0);
  assert.equal(jogo.tabuleiro[0][0].aberta, true);
  assert.equal(jogo.tabuleiro[1][1].aberta, true);
  assert.equal(jogo.tabuleiro[2][2].aberta, true); // número 1, borda da cascata
  assert.equal(jogo.tabuleiro[3][3].aberta, false); // a mina continua fechada
});

test('cascata não abre casas com bandeira', () => {
  const jogo = jogoComMinas(4, 4, [[3, 3]]);
  alternarBandeira(jogo, 1, 1);
  abrirCasa(jogo, 0, 0);
  assert.equal(jogo.tabuleiro[1][1].aberta, false);
  assert.equal(jogo.tabuleiro[1][1].bandeira, true);
});

test('bandeira alterna e atualiza o contador de minas restantes', () => {
  const jogo = jogoComMinas(3, 3, [[0, 0], [2, 2]]);
  assert.equal(minasRestantes(jogo), 2);
  alternarBandeira(jogo, 0, 0);
  assert.equal(minasRestantes(jogo), 1);
  alternarBandeira(jogo, 0, 0);
  assert.equal(minasRestantes(jogo), 2);
});

test('não abre casa com bandeira nem casa já aberta', () => {
  const jogo = jogoComMinas(3, 3, [[0, 0]]);
  alternarBandeira(jogo, 0, 0);
  assert.equal(abrirCasa(jogo, 0, 0).ok, false);
  abrirCasa(jogo, 2, 2);
  assert.equal(abrirCasa(jogo, 2, 2).ok, false);
});

test('não marca bandeira em casa aberta', () => {
  const jogo = jogoComMinas(3, 3, [[0, 0]]);
  abrirCasa(jogo, 2, 2);
  assert.equal(alternarBandeira(jogo, 2, 2).ok, false);
});

test('vitória ao abrir todas as casas sem mina', () => {
  const jogo = jogoComMinas(2, 2, [[0, 0]]);
  abrirCasa(jogo, 0, 1, { agora: 1000 });
  abrirCasa(jogo, 1, 0, { agora: 2000 });
  assert.equal(jogo.status, 'jogando');
  abrirCasa(jogo, 1, 1, { agora: 4000 });
  assert.equal(jogo.status, 'vitoria');
  assert.equal(jogo.fim, 4000);
  assert.equal(jogo.tabuleiro[0][0].bandeira, true); // mina marcada na vitória
});

test('depois do fim da partida nada mais é aceito', () => {
  const jogo = jogoComMinas(3, 3, [[0, 0]]);
  abrirCasa(jogo, 0, 0);
  assert.equal(abrirCasa(jogo, 2, 2).ok, false);
  assert.equal(alternarBandeira(jogo, 2, 2).ok, false);
  assert.equal(pedirDica(jogo).ok, false);
});

test('cronômetro conta a partir da primeira jogada e para no fim', () => {
  const jogo = novoJogo(8, 8, 10);
  assert.equal(tempoDecorrido(jogo, 99999), 0);
  jogo.inicio = 1000;
  assert.equal(tempoDecorrido(jogo, 6500), 5);
  jogo.fim = 3000;
  assert.equal(tempoDecorrido(jogo, 99999), 2);
});

test('dica só funciona depois da primeira jogada', () => {
  const jogo = novoJogo(8, 8, 10);
  assert.equal(pedirDica(jogo).ok, false);
});

test('dica abre uma casa segura e marca a partida como "com dica"', () => {
  const jogo = jogoComMinas(4, 4, [[3, 3]]);
  const r = pedirDica(jogo);
  assert.equal(r.ok, true);
  assert.equal(jogo.tabuleiro[r.linha][r.coluna].mina, false);
  assert.equal(jogo.tabuleiro[r.linha][r.coluna].aberta, true);
  assert.equal(jogo.usouDica, true);
  assert.notEqual(jogo.status, 'derrota');
});

test('a dica nunca escolhe uma mina (em várias tentativas)', () => {
  for (let i = 0; i < 100; i++) {
    const jogo = jogoComMinas(5, 5, [[0, 0], [2, 2], [4, 4]]);
    pedirDica(jogo);
    assert.notEqual(jogo.status, 'derrota');
  }
});
