const botaoStart = document.getElementById('start-button');
const telaInicial = document.getElementById('tela-inicial');
const botaoIniciar = document.getElementById('botao-iniciar');
const jogo = document.getElementById('jogo');

let resposta = ""
let pontuacaoAtual = 0;
let pontosPorRodada = 600;


const labelDica = document.querySelector('#label-dica');
// const labelProximaPalavra = document.querySelector('#label-prox-palavra');

// async function exibirProximo() {
//   let palavraProxima = await buscarPalavraProxima(resposta);
//   console.log(palavraProxima)
//   labelProximaPalavra.textContent = palavraProxima;
// }

// const proximoBtn = document.getElementById('proximo-btn');
// proximoBtn.addEventListener('click', exibirProximo);

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
  resposta = await obterPalavraAleatoria();
  document.getElementById('resposta').textContent = resposta;
});

const inputs = document.querySelectorAll('.quadrado');
let tabelaContainer = document.getElementById("respostas");
document.body.appendChild(tabelaContainer);

inputs[0].focus();

let respostaAtual = 1;
let respostas = [];
inputs.forEach((input, index) => {
  input.addEventListener('keydown', async (event) => {
    // permite apenas letras
    if (event.key === 'Tab') {
      event.preventDefault();
      return;
    }
    if (/^[a-zA-Z]$/.test(event.key)) {
      // insere a letra no input
      input.value = event.key.toUpperCase();
      input.setAttribute('disabled', 'disabled');
      // move o foco para o próximo input, se houver
      const nextInput = inputs[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }else{
      return
    }
    // previne que outras teclas sejam pressionadas
    event.preventDefault();

    // INCREMENTA LISTA DE RESPOSTAS
    const isLastInputFilled = Array.from(inputs).every((input) => input.value !== '');
    if (isLastInputFilled) {
      const letters = Array.from(inputs).map((input) => input.value.toUpperCase().charAt(0));
      respostas[respostaAtual - 1] = letters;
      console.log(respostas);
      Array.from(inputs).forEach((input) => {
        input.removeAttribute('disabled');
        input.value = '';
      });

      const sequenciaDeLetras = letters.join('');
      //VERIFICA SE ACERTOU
      if (sequenciaDeLetras === resposta.slice(-sequenciaDeLetras.length)) {
        await new Promise((resolve) => {
          let trHTML = '<tr>';
          letters.forEach((letter) => {
            let classe = (resposta.toUpperCase().includes(letter)) ? 'quadrado-resposta-existe' : 'quadrado-resposta';
            trHTML += `<td class="${classe}">${letter}</td>`;
          });
          trHTML += '</tr>';
          tabelaContainer.innerHTML += trHTML;
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
        inputs[0].focus();
        return
      }
      
      if (respostaAtual <= 6) {
        await new Promise((resolve) => {
          let trHTML = '<tr>';
          letters.forEach((letter) => {
            let classe = (resposta.toUpperCase().includes(letter)) ? 'quadrado-resposta-existe' : 'quadrado-resposta';
            trHTML += `<td class="${classe}">${letter}</td>`;
          });
          trHTML += '</tr>';
          tabelaContainer.innerHTML += trHTML;
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
    } else {
      Array.from(inputs)[index + 1].focus();
    }
  });
});

async function novaRodada(){
    // Limpa a tabela
    tabelaContainer.innerHTML = '';
    // Limpa a lista de respostas
    respostas = [];
    // Gera uma nova resposta
    resposta = await obterPalavraAleatoria();
    respostaAtual = 1;
    inputs[0].focus();
    document.getElementById('resposta').textContent = resposta;
}

function atualizarPontuacao() {
  const pontuacaoElement = document.getElementById('pontuacao');
  pontuacaoElement.textContent = pontuacaoAtual.toString();
  inputs[0].focus();
}

async function buscarPalavraProxima(palavra) {
  const endpoint = `https://api.dicionario-aberto.net/near${palavra}`;
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

