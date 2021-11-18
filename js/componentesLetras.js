// codigo que hace la incorporacion dinamica de las letras del juego
let abcedario = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'ñ',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
];
let contenedor = document.getElementById('letras');
abcedario.forEach((letra, index) => {
  let elemento = document.createElement('button');
  elemento.classList.add('letra');
  elemento.innerHTML = abcedario[index];

  contenedor.appendChild(elemento);
});
