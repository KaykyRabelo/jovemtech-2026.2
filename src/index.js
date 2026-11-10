#!/usr/bin/env node
'use strict';

const readline = require('node:readline');
const { LINHAS, COLUNAS, MINAS } = require('./config');
const { interpretarEntrada } = require('./entrada');
const { renderizar, textoAjuda, formatarTempo } = require('./render');
const { novoJogo, abrirCasa, alternarBandeira, pedirDica, tempoDecorrido } = require('./regras');
const { lerRecorde, salvarRecorde } = require('./recorde');

const args = process.argv.slice(2);
const opcoes = {
  ascii: args.includes('--ascii'),
  cor: !args.includes('--sem-cor') && !process.env.NO_COLOR && process.stdout.isTTY !== false,
};

const jogo = novoJogo(LINHAS, COLUNAS, MINAS);
let recorde = lerRecorde();

function mostrar() {
  console.log(renderizar(jogo, { ...opcoes, recorde }));
}

function finalizar() {
  mostrar();
  const tempo = tempoDecorrido(jogo);

  if (jogo.status === 'derrota') {
    console.log('💥 Você pisou numa mina! Fim de jogo.');
    return;
  }

  console.log(`🎉 Você venceu em ${formatarTempo(tempo)}!`);
  if (jogo.usouDica) {
    console.log('Você usou dica, então este tempo não vale como recorde.');
  } else if (salvarRecorde(tempo)) {
    console.log('Novo recorde!');
  }
}

const leitor = readline.createInterface({ input: process.stdin, output: process.stdout });

function perguntar() {
  leitor.question('> ', (texto) => {
    const entrada = interpretarEntrada(texto, LINHAS, COLUNAS);

    if (entrada.tipo === 'sair') {
      console.log('Até a próxima!');
      leitor.close();
      return;
    }

    let resultado = { ok: true };
    switch (entrada.tipo) {
      case 'ajuda':
        console.log(textoAjuda());
        return perguntar();
      case 'erro':
        console.log(entrada.mensagem);
        return perguntar();
      case 'abrir':
        resultado = abrirCasa(jogo, entrada.linha, entrada.coluna);
        break;
      case 'bandeira':
        resultado = alternarBandeira(jogo, entrada.linha, entrada.coluna);
        break;
      case 'dica':
        resultado = pedirDica(jogo);
        break;
    }

    if (!resultado.ok) {
      console.log(resultado.motivo);
      return perguntar();
    }

    if (jogo.status !== 'jogando') {
      finalizar();
      leitor.close();
      return;
    }

    mostrar();
    perguntar();
  });
}

console.log('=== CAMPO MINADO ===');
console.log(textoAjuda());
mostrar();
perguntar();
