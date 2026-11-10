'use strict';

// Tamanho do tabuleiro e quantidade de minas. Altere aqui para mudar o jogo.
const LINHAS = 8;
const COLUNAS = 8;
const MINAS = 10;

const SIMBOLOS_UNICODE = {
  fechada: '■',
  vazia: '·',
  bandeira: '⚑',
  mina: '*',
  errada: '✗',
};

const SIMBOLOS_ASCII = {
  fechada: '#',
  vazia: '.',
  bandeira: 'F',
  mina: '*',
  errada: 'x',
};

module.exports = { LINHAS, COLUNAS, MINAS, SIMBOLOS_UNICODE, SIMBOLOS_ASCII };
