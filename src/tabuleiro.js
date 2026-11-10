'use strict';

function criarCasa() {
  return { mina: false, aberta: false, bandeira: false, vizinhas: 0 };
}

function criarTabuleiro(linhas, colunas) {
  return Array.from({ length: linhas }, () =>
    Array.from({ length: colunas }, criarCasa)
  );
}

// Devolve as coordenadas das (até) 8 casas ao redor de (l, c).
function vizinhos(linhas, colunas, l, c) {
  const lista = [];
  for (let dl = -1; dl <= 1; dl++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dl === 0 && dc === 0) continue;
      const nl = l + dl;
      const nc = c + dc;
      if (nl >= 0 && nl < linhas && nc >= 0 && nc < colunas) {
        lista.push([nl, nc]);
      }
    }
  }
  return lista;
}

function calcularVizinhas(tabuleiro) {
  const linhas = tabuleiro.length;
  const colunas = tabuleiro[0].length;
  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < colunas; c++) {
      tabuleiro[l][c].vizinhas = vizinhos(linhas, colunas, l, c).filter(
        ([nl, nc]) => tabuleiro[nl][nc].mina
      ).length;
    }
  }
}

// Sorteia as minas só depois da primeira jogada, para que ela nunca seja uma mina.
// Sempre que houver espaço, a casa inicial e suas vizinhas ficam livres,
// assim a primeira jogada costuma abrir uma área.
function sortearMinas(tabuleiro, quantidade, seguraL, seguraC, rng = Math.random) {
  const linhas = tabuleiro.length;
  const colunas = tabuleiro[0].length;
  const total = linhas * colunas;

  if (quantidade > total - 1) {
    throw new RangeError('Minas demais para o tamanho do tabuleiro.');
  }

  const protegidas = new Set([`${seguraL},${seguraC}`]);
  const zonaLivre = new Set(protegidas);
  for (const [nl, nc] of vizinhos(linhas, colunas, seguraL, seguraC)) {
    zonaLivre.add(`${nl},${nc}`);
  }

  const candidatas = (excluir) => {
    const lista = [];
    for (let l = 0; l < linhas; l++) {
      for (let c = 0; c < colunas; c++) {
        if (!excluir.has(`${l},${c}`)) lista.push([l, c]);
      }
    }
    return lista;
  };

  let opcoes = candidatas(zonaLivre);
  if (opcoes.length < quantidade) opcoes = candidatas(protegidas);

  // Embaralhamento de Fisher-Yates (parcial).
  for (let i = 0; i < quantidade; i++) {
    const j = i + Math.floor(rng() * (opcoes.length - i));
    [opcoes[i], opcoes[j]] = [opcoes[j], opcoes[i]];
    const [l, c] = opcoes[i];
    tabuleiro[l][c].mina = true;
  }

  calcularVizinhas(tabuleiro);
}

module.exports = { criarTabuleiro, vizinhos, sortearMinas, calcularVizinhas };
