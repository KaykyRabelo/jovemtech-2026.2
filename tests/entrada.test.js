'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { interpretarEntrada } = require('../src/entrada');

test('"r B3" abre a coluna B, linha 3', () => {
  assert.deepEqual(interpretarEntrada('r B3', 8, 8), { tipo: 'abrir', linha: 2, coluna: 1 });
});

test('"b a1" marca bandeira, ignorando maiúsculas e espaços extras', () => {
  assert.deepEqual(interpretarEntrada('  B   a1 ', 8, 8), { tipo: 'bandeira', linha: 0, coluna: 0 });
});

test('comandos simples', () => {
  assert.equal(interpretarEntrada('dica', 8, 8).tipo, 'dica');
  assert.equal(interpretarEntrada('AJUDA', 8, 8).tipo, 'ajuda');
  assert.equal(interpretarEntrada('sair', 8, 8).tipo, 'sair');
});

test('último canto do tabuleiro é aceito', () => {
  assert.deepEqual(interpretarEntrada('r H8', 8, 8), { tipo: 'abrir', linha: 7, coluna: 7 });
});

test('fora do tabuleiro vira erro', () => {
  assert.equal(interpretarEntrada('r I1', 8, 8).tipo, 'erro');
  assert.equal(interpretarEntrada('r A9', 8, 8).tipo, 'erro');
  assert.equal(interpretarEntrada('r A0', 8, 8).tipo, 'erro');
});

test('entradas malformadas viram erro', () => {
  for (const texto of ['', '   ', 'x B3', 'r', 'r 3B', 'r B', 'r B3 extra', 'b ??']) {
    assert.equal(interpretarEntrada(texto, 8, 8).tipo, 'erro', `"${texto}" deveria ser erro`);
  }
});

test('valores não textuais não quebram', () => {
  assert.equal(interpretarEntrada(undefined, 8, 8).tipo, 'erro');
  assert.equal(interpretarEntrada(null, 8, 8).tipo, 'erro');
});
