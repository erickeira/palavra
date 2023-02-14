const botaoStart = document.getElementById('start-button');
const telaInicial = document.getElementById('tela-inicial');
const botaoIniciar = document.getElementById('botao-iniciar');
const jogo = document.getElementById('jogo');

botaoStart.addEventListener('click', function() {
  telaInicial.style.display = 'none';
  jogo.style.display = 'block';
});