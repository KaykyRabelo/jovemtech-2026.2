'use strict';

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Interpreta o texto digitado. A letra indica a coluna e o número, a linha (ex.: B3).
// Devolve sempre um objeto { tipo, ... }; entradas inválidas viram { tipo: 'erro', mensagem }.
function interpretarEntrada(texto, linhas, colunas) {
  const limpo = String(texto || '').trim().toLowerCase();
  if (limpo === '') return { tipo: 'erro', mensagem: 'Digite um comando. Use "ajuda" para ver as opções.' };

  if (limpo === 'ajuda') return { tipo: 'ajuda' };
  if (limpo === 'sair') return { tipo: 'sair' };
  if (limpo === 'dica') return { tipo: 'dica' };

  const partes = limpo.split(/\s+/);
  const comando = partes[0];

  if (comando !== 'r' && comando !== 'b') {
    return { tipo: 'erro', mensagem: `Comando desconhecido: "${partes[0]}". Use "ajuda".` };
  }
  if (partes.length !== 2) {
    return { tipo: 'erro', mensagem: `Use o formato: ${comando} B3` };
  }

  const coordenada = interpretarCoordenada(partes[1], linhas, colunas);
  if (coordenada.erro) return { tipo: 'erro', mensagem: coordenada.erro };

  return {
    tipo: comando === 'r' ? 'abrir' : 'bandeira',
    linha: coordenada.linha,
    coluna: coordenada.coluna,
  };
}

function interpretarCoordenada(texto, linhas, colunas) {
  const combinacao = /^([a-z])(\d{1,2})$/.exec(texto);
  if (!combinacao) {
    return { erro: `Coordenada inválida: "${texto}". Exemplo: B3.` };
  }

  const coluna = ALFABETO.toLowerCase().indexOf(combinacao[1]);
  const linha = Number(combinacao[2]) - 1;

  if (coluna >= colunas || linha < 0 || linha >= linhas) {
    const ultima = ALFABETO[colunas - 1];
    return { erro: `Fora do tabuleiro. Use colunas A–${ultima} e linhas 1–${linhas}.` };
  }
  return { linha, coluna };
}

module.exports = { interpretarEntrada, interpretarCoordenada, ALFABETO };
