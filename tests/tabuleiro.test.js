'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { criarTabuleiro, vizinhos, sortearMinas } = require('../src/tabuleiro');

const contarMinas = (tab) => tab.flat().filter((casa) => casa.mina).length;

test('criarTabuleiro cria a grade com casas fechadas e sem mina', () => {
  const tab = criarTabuleiro(3, 4);
  assert.equal(tab.length, 3);
  assert.equal(tab[0].length, 4);
  assert.ok(tab.flat().every((c) => !c.mina && !c.aberta && !c.bandeira));
});

test('vizinhos devolve 8 casas no meio, 5 na borda e 3 no canto', () => {
  assert.equal(vizinhos(5, 5, 2, 2).length, 8);
  assert.equal(vizinhos(5, 5, 0, 2).length, 5);
  assert.equal(vizinhos(5, 5, 0, 0).length, 3);
});

test('sortearMinas coloca a quantidade pedida de minas', () => {
  const tab = criarTabuleiro(8, 8);
  sortearMinas(tab, 10, 0, 0);
  assert.equal(contarMinas(tab), 10);
});

test('a casa da primeira jogada nunca é mina (em várias tentativas)', () => {
  for (let i = 0; i < 200; i++) {
    const tab = criarTabuleiro(8, 8);
    sortearMinas(tab, 10, 3, 4);
    assert.equal(tab[3][4].mina, false);
  }
});

test('a vizinhança da primeira jogada também fica livre quando há espaço', () => {
  for (let i = 0; i < 100; i++) {
    const tab = criarTabuleiro(8, 8);
    sortearMinas(tab, 10, 4, 4);
    for (const [l, c] of vizinhos(8, 8, 4, 4)) {
      assert.equal(tab[l][c].mina, false);
    }
  }
});

test('sem espaço para a zona livre, só a casa inicial é protegida', () => {
  const tab = criarTabuleiro(3, 3);
  sortearMinas(tab, 8, 1, 1);
  assert.equal(contarMinas(tab), 8);
  assert.equal(tab[1][1].mina, false);
});

test('sortearMinas recusa minas demais', () => {
  const tab = criarTabuleiro(2, 2);
  assert.throws(() => sortearMinas(tab, 4, 0, 0), RangeError);
});

test('contagem de vizinhas bate com as minas ao redor', () => {
  const tab = criarTabuleiro(8, 8);
  sortearMinas(tab, 10, 0, 0);
  for (let l = 0; l < 8; l++) {
    for (let c = 0; c < 8; c++) {
      const esperado = vizinhos(8, 8, l, c).filter(([a, b]) => tab[a][b].mina).length;
      assert.equal(tab[l][c].vizinhas, esperado);
    }
  }
});

test('o gerador injetado torna o sorteio determinístico', () => {
  const rng = () => 0;
  const a = criarTabuleiro(5, 5);
  const b = criarTabuleiro(5, 5);
  sortearMinas(a, 5, 4, 4, rng);
  sortearMinas(b, 5, 4, 4, rng);
  assert.deepEqual(a, b);
});
