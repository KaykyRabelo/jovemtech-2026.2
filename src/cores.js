'use strict';

const CODIGOS = {
  vermelho: 31,
  verde: 32,
  amarelo: 33,
  azul: 34,
  magenta: 35,
  ciano: 36,
  cinza: 90,
  negrito: 1,
};

// Cria as funções de cor. Com `ativas` falso, devolve o texto sem alteração.
function criarCores(ativas) {
  const cores = {};
  for (const [nome, codigo] of Object.entries(CODIGOS)) {
    cores[nome] = (texto) => (ativas ? `\x1b[${codigo}m${texto}\x1b[0m` : String(texto));
  }
  return cores;
}

module.exports = { criarCores };
