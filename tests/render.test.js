'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { renderizar, formatarTempo } = require('../src/render');
const { novoJogo, abrirCasa, alternarBandeira } = require('../src/regras');

function jogoPequeno() {
  const jogo = novoJogo(3, 3, 1);
  jogo.tabuleiro[0][0].mina = true;
  jogo.tabuleiro[0][1].vizinhas = 1;
  jogo.tabuleiro[1][0].vizinhas = 1;
  jogo.tabuleiro[1][1].vizinhas = 1;
  jogo.minasSorteadas = true;
  jogo.inicio = 0;
  return jogo;
}

const semCor = { cor: false, ascii: true, agora: 0 };

test('formatarTempo usa minutos e segundos com dois dígitos', () => {
  assert.equal(formatarTempo(0), '00:00');
  assert.equal(formatarTempo(75), '01:15');
});

test('tabuleiro novo mostra cabeçalho, casas fechadas e status', () => {
  const texto = renderizar(novoJogo(3, 3, 1), semCor);
  assert.match(texto, /A B C/);
  assert.match(texto, /1 # # #/);
  assert.match(texto, /Minas restantes: 1/);
  assert.match(texto, /Tempo: 00:00/);
});

test('modo ASCII usa F para bandeira e modo Unicode usa ⚑', () => {
  const jogo = novoJogo(3, 3, 1);
  alternarBandeira(jogo, 0, 0);
  assert.match(renderizar(jogo, semCor), /F/);
  assert.match(renderizar(jogo, { ...semCor, ascii: false }), /⚑/);
});

test('sem cor não há códigos ANSI; com cor há', () => {
  const jogo = novoJogo(3, 3, 1);
  alternarBandeira(jogo, 0, 0);
  assert.doesNotMatch(renderizar(jogo, semCor), /\x1b\[/);
  assert.match(renderizar(jogo, { ...semCor, cor: true }), /\x1b\[33m/); // bandeira amarela
});

test('casas abertas mostram o número de vizinhas', () => {
  const jogo = jogoPequeno();
  abrirCasa(jogo, 1, 1);
  assert.match(renderizar(jogo, semCor), /2 # 1 #/);
});

test('na derrota todas as minas aparecem e bandeira errada vira x', () => {
  const jogo = jogoPequeno();
  alternarBandeira(jogo, 2, 2); // bandeira em casa sem mina
  abrirCasa(jogo, 0, 0);
  const texto = renderizar(jogo, semCor);
  assert.match(texto, /1 \* #/);
  assert.match(texto, /x/);
});

test('mostra o recorde quando existe', () => {
  const texto = renderizar(novoJogo(3, 3, 1), { ...semCor, recorde: 65 });
  assert.match(texto, /Recorde: 01:05/);
});

test('o cronômetro aparece no status', () => {
  const jogo = jogoPequeno();
  const texto = renderizar(jogo, { ...semCor, agora: 12000 });
  assert.match(texto, /Tempo: 00:12/);
});
