'use strict';

const { criarTabuleiro, vizinhos, sortearMinas } = require('./tabuleiro');

function novoJogo(linhas, colunas, minas) {
  return {
    tabuleiro: criarTabuleiro(linhas, colunas),
    linhas,
    colunas,
    minas,
    minasSorteadas: false,
    status: 'jogando', // 'jogando' | 'vitoria' | 'derrota'
    inicio: null,
    fim: null,
    usouDica: false,
    minaAtingida: null,
  };
}

function contarBandeiras(jogo) {
  return jogo.tabuleiro.flat().filter((casa) => casa.bandeira).length;
}

function minasRestantes(jogo) {
  return jogo.minas - contarBandeiras(jogo);
}

// Segundos decorridos. O cronômetro começa na primeira jogada e para no fim.
function tempoDecorrido(jogo, agora = Date.now()) {
  if (jogo.inicio === null) return 0;
  const fim = jogo.fim !== null ? jogo.fim : agora;
  return Math.floor((fim - jogo.inicio) / 1000);
}

function verificarVitoria(jogo) {
  const venceu = jogo.tabuleiro.flat().every((casa) => casa.mina || casa.aberta);
  if (venceu && jogo.status === 'jogando') {
    jogo.status = 'vitoria';
    // Marca as minas restantes com bandeira, como feedback de vitória.
    for (const casa of jogo.tabuleiro.flat()) {
      if (casa.mina) casa.bandeira = true;
    }
  }
  return venceu;
}

// Abre a casa (l, c). Casas vazias abrem toda a área vazia ao redor (cascata).
function abrirCasa(jogo, l, c, { rng = Math.random, agora = Date.now() } = {}) {
  if (jogo.status !== 'jogando') {
    return { ok: false, motivo: 'A partida já terminou.' };
  }

  const casa = jogo.tabuleiro[l][c];
  if (casa.aberta) return { ok: false, motivo: 'Essa casa já está aberta.' };
  if (casa.bandeira) {
    return { ok: false, motivo: 'Essa casa tem bandeira. Desmarque antes de abrir.' };
  }

  if (!jogo.minasSorteadas) {
    sortearMinas(jogo.tabuleiro, jogo.minas, l, c, rng);
    jogo.minasSorteadas = true;
    jogo.inicio = agora;
  }

  if (casa.mina) {
    casa.aberta = true;
    jogo.status = 'derrota';
    jogo.fim = agora;
    jogo.minaAtingida = [l, c];
    return { ok: true, explodiu: true };
  }

  // Cascata iterativa, para não estourar a pilha em tabuleiros grandes.
  const pilha = [[l, c]];
  while (pilha.length > 0) {
    const [pl, pc] = pilha.pop();
    const atual = jogo.tabuleiro[pl][pc];
    if (atual.aberta || atual.bandeira) continue;
    atual.aberta = true;
    if (atual.vizinhas === 0) {
      for (const [nl, nc] of vizinhos(jogo.linhas, jogo.colunas, pl, pc)) {
        pilha.push([nl, nc]);
      }
    }
  }

  if (verificarVitoria(jogo)) jogo.fim = agora;
  return { ok: true, explodiu: false };
}

function alternarBandeira(jogo, l, c) {
  if (jogo.status !== 'jogando') {
    return { ok: false, motivo: 'A partida já terminou.' };
  }
  const casa = jogo.tabuleiro[l][c];
  if (casa.aberta) {
    return { ok: false, motivo: 'Não dá para marcar uma casa já aberta.' };
  }
  casa.bandeira = !casa.bandeira;
  return { ok: true, marcada: casa.bandeira };
}

// Abre uma casa segura escolhida ao acaso. Partidas com dica não entram no recorde.
function pedirDica(jogo, { rng = Math.random, agora = Date.now() } = {}) {
  if (jogo.status !== 'jogando') {
    return { ok: false, motivo: 'A partida já terminou.' };
  }
  if (!jogo.minasSorteadas) {
    return { ok: false, motivo: 'Faça a primeira jogada antes de pedir dica.' };
  }

  const seguras = [];
  for (let l = 0; l < jogo.linhas; l++) {
    for (let c = 0; c < jogo.colunas; c++) {
      const casa = jogo.tabuleiro[l][c];
      if (!casa.mina && !casa.aberta) seguras.push([l, c]);
    }
  }
  if (seguras.length === 0) {
    return { ok: false, motivo: 'Não há casas seguras para revelar.' };
  }

  const [l, c] = seguras[Math.floor(rng() * seguras.length)];
  jogo.tabuleiro[l][c].bandeira = false;
  jogo.usouDica = true;
  abrirCasa(jogo, l, c, { rng, agora });
  return { ok: true, linha: l, coluna: c };
}

module.exports = {
  novoJogo,
  contarBandeiras,
  minasRestantes,
  tempoDecorrido,
  verificarVitoria,
  abrirCasa,
  alternarBandeira,
  pedirDica,
};
