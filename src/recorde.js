'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ARQUIVO_PADRAO = path.join(__dirname, '..', 'recorde.json');

// Lê o melhor tempo salvo (em segundos). Devolve null se não existir ou estiver corrompido.
function lerRecorde(arquivo = ARQUIVO_PADRAO) {
  try {
    const dados = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
    if (Number.isInteger(dados.melhorTempo) && dados.melhorTempo >= 0) {
      return dados.melhorTempo;
    }
    return null;
  } catch {
    return null;
  }
}

// Grava o tempo só se for melhor que o atual. Devolve true quando houve novo recorde.
function salvarRecorde(segundos, arquivo = ARQUIVO_PADRAO) {
  const atual = lerRecorde(arquivo);
  if (atual !== null && segundos >= atual) return false;
  try {
    fs.writeFileSync(arquivo, JSON.stringify({ melhorTempo: segundos }, null, 2) + '\n');
    return true;
  } catch {
    return false;
  }
}

module.exports = { lerRecorde, salvarRecorde, ARQUIVO_PADRAO };
