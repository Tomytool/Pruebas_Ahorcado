// Se realiza una función con el alert sin ocupar el nativo de javascript

const mostrarAlerta = (textoMostrar, colorTexto) => {
  let cuadroAlerta = document.createElement('div');
  cuadroAlerta.classList.add('alerta');
  cuadroAlerta.innerHTML =
    textoMostrar + '<button id="opcion">Aceptar</button>';
  cuadroAlerta.style.color = colorTexto;
  document.querySelector('body').appendChild(cuadroAlerta);
  botonReiniciar = document.querySelector('#opcion');
  botonReiniciar.addEventListener('click', function () {
    location.reload();
  });
};
