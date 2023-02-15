const botaoStart = document.getElementById('start-button');
const telaInicial = document.getElementById('tela-inicial');
const botaoIniciar = document.getElementById('botao-iniciar');
const jogo = document.getElementById('jogo');
const ajudas = document.getElementById('ajudas');

let resposta = ""
let pontuacaoAtual = 0;
let pontosPorRodada = 600;

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 600;

const labelDica = document.querySelector('#label-dica');
const labelProximaPalavra = document.querySelector('#label-prox-palavra');

async function exibirProximo() {
  let palavraProxima = await buscarPalavraProxima(resposta);
  console.log(palavraProxima)
  labelProximaPalavra.textContent = palavraProxima;
}

const proximoBtn = document.getElementById('proximo-btn');
proximoBtn.addEventListener('click', exibirProximo);

function exibirDica() {
  let letrasRestantes = resposta.split('').filter(letra => {
    return !respostas.some(resposta => resposta.includes(letra) && !labelDica.textContent);
  });
  const letraDica = letrasRestantes[Math.floor(Math.random() * letrasRestantes.length)];
  labelDica.textContent = letraDica;
}

const dicaBtn = document.getElementById('dica-btn');
dicaBtn.addEventListener('click', exibirDica);

botaoStart.addEventListener('click', async function() {
  telaInicial.style.display = 'none';
  jogo.style.display = 'block';
  ajudas.style.display = 'flex';
  resposta = await obterPalavraAleatoria();
  inputs[0].focus();
  // document.getElementById('resposta').textContent = resposta;
});

const inputs = document.querySelectorAll('.quadrado');

let tabelaContainer = document.getElementById("respostas");
document.body.appendChild(tabelaContainer);

inputs[0].focus();

let respostaAtual = 1;
let respostas = [];

Array.from(inputs).forEach((input, index) => {
  input.addEventListener('input', (event) =>{ if(!event.key) onDigit(event, input, index)})
  input.addEventListener('keydown',  (event) =>{ onDigit(event, input, index) });
});

async function onDigit(event, input, index) {
  // permite apenas letras



  let letra = event.data ?  event.data :  event.key
  if (letra === 'Backspace') {
    // insere a letra no input
    input.value = '';
    // move o foco para o próximo input, se houver
    const nextInput = inputs[index - 1];
    if (nextInput) {
      input.setAttribute('disabled', 'disabled');
      nextInput.removeAttribute('disabled');
      nextInput.focus();
    }
    return
  }
  if (letra === 'Tab') {
    event.preventDefault();
    return;
  }

  if ((letra && /^[a-zA-Z]$/.test(letra)) || (letra && /^[a-zA-Z]$/.test(letra)) && input.value.length < 1) {
    // insere a letra no input
    input.value = letra.toUpperCase();
    // move o foco para o próximo input, se houver
    const nextInput = inputs[index + 1];
    console.log(letra)
    if (nextInput) {
      input.setAttribute('disabled', 'disabled');
      nextInput.removeAttribute('disabled');
      nextInput.focus();
    }
  }

  // previne que outras teclas sejam pressionadas
  event.preventDefault();

  // INCREMENTA LISTA DE RESPOSTAS
  const isLastInputFilled = Array.from(inputs).every((input) => input.value !== '');

  if (isLastInputFilled && letra === 'Enter') {
    const letters = Array.from(inputs).map((input) => input.value.toUpperCase().charAt(0));
    respostas[respostaAtual - 1] = letters;
    console.log(respostas);
    Array.from(inputs).forEach((input) => {
      input.removeAttribute('disabled');
      input.value = '';
    });

    console.log(letra)
    const sequenciaDeLetras = letters.join('');
    //VERIFICA SE ACERTOU
    if (sequenciaDeLetras === resposta.slice(-sequenciaDeLetras.length)) {
      await new Promise((resolve) => {
        let trHTML = '<tr class="linha">';
        letters.forEach((letter, index) => {
          let classe = (resposta.toUpperCase().includes(letter)) ? (resposta[index] == letter ? 'quadrado-correto' : 'quadrado-resposta-existe') : 'quadrado-resposta';
          trHTML += `<td class="${classe}">${letter}</td>`;
        });
        trHTML += '</tr>';
        tabelaContainer.insertAdjacentHTML('afterbegin',trHTML)
        // tabelaContainer.innerHTML += trHTML;
        pontosPorRodada -= 100;
        resolve();
      });
      setTimeout(() => {
        if (window.confirm(`Parabéns, você acertou a palavra ${resposta}! Clique em OK para jogar novamente.`)) {
          pontuacaoAtual += pontosPorRodada;
          pontosPorRodada = 600;
          novaRodada();
          atualizarPontuacao()
        }
      }, 500);
      // inputs[0].focus();
      return
    }


    if (respostaAtual <= 6) {
      await new Promise((resolve) => {
        let trHTML = '<tr class="linha">';
        letters.forEach((letter, index) => {
          console.log(resposta[index])
          let classe = (resposta.toUpperCase().includes(letter)) ? (resposta[index] == letter ? 'quadrado-correto' : 'quadrado-resposta-existe') : 'quadrado-resposta';
          trHTML += `<td class="${classe}">${letter}</td>`;
        });
        trHTML += '</tr>';
        tabelaContainer.insertAdjacentHTML('afterbegin',trHTML)
        // tabelaContainer.innerHTML += trHTML;
        pontosPorRodada -= 100;
        resolve();
      });
      Array.from(inputs)[0].focus();
    }
    if (respostaAtual > 5) {
      if (window.confirm(`Que pena! a palavra era ${resposta}, Clique em OK para jogar novamente.`)) {
        pontuacaoAtual += pontosPorRodada;
        pontosPorRodada = 600;
        novaRodada();
        atualizarPontuacao()
      }
    }
    respostaAtual++;
  } 
}



async function novaRodada(){
    // Limpa a tabela
    tabelaContainer.innerHTML = '';
    // Limpa a lista de respostas
    respostas = [];
    // Gera uma nova resposta
    resposta = await obterPalavraAleatoria();
    respostaAtual = 1;
    inputs[0].focus();
    labelDica.textContent = null;
    // document.getElementById('resposta').textContent = resposta;
}

function atualizarPontuacao() {
  const pontuacaoElement = document.getElementById('pontuacao');
  pontuacaoElement.textContent = pontuacaoAtual.toString();
  inputs[0].focus();
  labelDica.textContent = null ;
}

async function buscarPalavraProxima(palavra) {
  const endpoint = `https://api.dicionario-aberto.net/near/${palavra}`;
  const response = await fetch(endpoint);
  const data = await response.json();
  const proxima = data[0];
  return proxima;
}


async function obterPalavraAleatoria() {
  let palavras = [
    "abrir",
    "altar",
    "amigo",
    "anexo",
    "anjos",
    "antes",
    "apito",
    "arame",
    "areia",
    "aroma",
    "artes",
  ]  
  const indice = Math.floor(Math.random() * palavras.length);
  return palavras[indice].toLocaleUpperCase();
}

