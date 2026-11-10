'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { lerRecorde, salvarRecorde } = require('../src/recorde');

function arquivoTemporario() {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'recorde-'));
  return path.join(pasta, 'recorde.json');
}

test('sem arquivo, não há recorde', () => {
  assert.equal(lerRecorde(arquivoTemporario()), null);
});

test('o primeiro tempo vira recorde', () => {
  const arquivo = arquivoTemporario();
  assert.equal(salvarRecorde(90, arquivo), true);
  assert.equal(lerRecorde(arquivo), 90);
});

test('só um tempo melhor substitui o recorde', () => {
  const arquivo = arquivoTemporario();
  salvarRecorde(90, arquivo);
  assert.equal(salvarRecorde(120, arquivo), false);
  assert.equal(salvarRecorde(90, arquivo), false);
  assert.equal(lerRecorde(arquivo), 90);
  assert.equal(salvarRecorde(45, arquivo), true);
  assert.equal(lerRecorde(arquivo), 45);
});

test('arquivo corrompido é tratado como sem recorde', () => {
  const arquivo = arquivoTemporario();
  fs.writeFileSync(arquivo, '{ isto não é json');
  assert.equal(lerRecorde(arquivo), null);
  assert.equal(salvarRecorde(30, arquivo), true);
  assert.equal(lerRecorde(arquivo), 30);
});

test('conteúdo com formato inesperado é ignorado', () => {
  const arquivo = arquivoTemporario();
  fs.writeFileSync(arquivo, JSON.stringify({ melhorTempo: 'rápido' }));
  assert.equal(lerRecorde(arquivo), null);
});
