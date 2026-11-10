'use strict';

const { SIMBOLOS_UNICODE, SIMBOLOS_ASCII } = require('./config');
const { criarCores } = require('./cores');
const { ALFABETO } = require('./entrada');
const { minasRestantes, tempoDecorrido } = require('./regras');

const COR_DO_NUMERO = {
  1: 'azul',
  2: 'verde',
  3: 'vermelho',
  4: 'magenta',
  5: 'amarelo',
  6: 'ciano',
  7: 'negrito',
  8: 'cinza',
};

function formatarTempo(segundos) {
  const m = String(Math.floor(segundos / 60)).padStart(2, '0');
  const s = String(segundos % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// Devolve o texto de uma casa. A cor nunca é a única informação: cada estado tem símbolo próprio.
function desenharCasa(casa, jogo, l, c, simbolos, cores) {
  const terminou = jogo.status !== 'jogando';
  const atingida = jogo.minaAtingida && jogo.minaAtingida[0] === l && jogo.minaAtingida[1] === c;

  if (atingida) return cores.vermelho(cores.negrito(simbolos.mina));

  if (casa.aberta) {
    if (casa.vizinhas === 0) return cores.cinza(simbolos.vazia);
    return cores[COR_DO_NUMERO[casa.vizinhas]](casa.vizinhas);
  }

  if (jogo.status === 'derrota') {
    if (casa.mina && !casa.bandeira) return cores.vermelho(simbolos.mina);
    if (!casa.mina && casa.bandeira) return cores.vermelho(simbolos.errada);
  }

  if (casa.bandeira) {
    return terminou && jogo.status === 'vitoria'
      ? cores.verde(simbolos.bandeira)
      : cores.amarelo(simbolos.bandeira);
  }

  return simbolos.fechada;
}

function renderizar(jogo, { ascii = false, cor = true, recorde = null, agora = Date.now() } = {}) {
  const simbolos = ascii ? SIMBOLOS_ASCII : SIMBOLOS_UNICODE;
  const cores = criarCores(cor);
  const largura = String(jogo.linhas).length;

  const cabecalho =
    ' '.repeat(largura + 1) +
    Array.from({ length: jogo.colunas }, (_, i) => ALFABETO[i]).join(' ');

  const linhas = jogo.tabuleiro.map((fila, l) => {
    const numero = String(l + 1).padStart(largura, ' ');
    const casas = fila.map((casa, c) => desenharCasa(casa, jogo, l, c, simbolos, cores));
    return `${numero} ${casas.join(' ')}`;
  });

  const status = [
    `Minas restantes: ${minasRestantes(jogo)}`,
    `Tempo: ${formatarTempo(tempoDecorrido(jogo, agora))}`,
  ];
  if (recorde !== null) status.push(`Recorde: ${formatarTempo(recorde)}`);

  return ['', cabecalho, ...linhas, '', status.join('   |   '), ''].join('\n');
}

function textoAjuda() {
  return [
    'Comandos:',
    '  r B3    abre a casa na coluna B, linha 3',
    '  b B3    marca ou desmarca bandeira em B3',
    '  dica    abre uma casa segura (a partida não conta para o recorde)',
    '  ajuda   mostra esta lista',
    '  sair    encerra o jogo',
  ].join('\n');
}

module.exports = { renderizar, formatarTempo, textoAjuda };
