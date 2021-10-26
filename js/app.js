let texto;
let arrayTexto;
let palabraSeparada;
let oportunidades = 0;
let cuerpoQuemado;
let intentosAcertados = 0;
let contadorLetras;
let elementoInsertar;

// aqui se da inicio  a la función de ingreso de fraces
const ingresoTexto = () => {
  texto = document.getElementById('ingreso').value;
  document.getElementById('ingreso').value = '';

  console.log(texto);
  separartexto(texto);
};

const IniciarJuego = document
  .getElementById('inicio')
  .addEventListener('click', ingresoTexto);

// funcion que separa el texto ingresado y lo convierte en un array
const separartexto = (cadena) => {
  texto.innerHTML = '';
  arrayTexto = cadena.split(' ');
  console.log(arrayTexto);
  for (let i = 0; i < arrayTexto.length; i++) {
    if (arrayTexto[i].length <= 3) {
      arrayTexto.splice(i, 1);
    }
  }
  console.log(arrayTexto);
  palabraAleatoria();
};

// funcion que elige una palabra aleatoria dentro del array y la separa por letras
const palabraAleatoria = () => {
  let numeroRand = Math.floor(Math.random() * (arrayTexto.length - 0));
  // alert('palabra aleatoria es: ' + arrayTexto[numeroRand]);
  palabraSeparada = arrayTexto[numeroRand].split('');
  console.log(palabraSeparada);
  insertar(palabraSeparada);
};

// insertar en pantalla
const insertar = (arrayMostrada) => {
  insertarLetra = document.getElementsByClassName('frace');
  arrayMostrada.forEach((letra) => {
    const elementoInsertar = document.createElement('div');
    elementoInsertar.classList.add('letraAdivinar');
    elementoInsertar.innerHTML = letra;
    console.log(letra);
    insertarLetra[0].appendChild(elementoInsertar);
  });
  buscarLetras();
};

// Aqui debo hacer el codigo que pueda ingresar la opcion del usuario segun la letra que oprima en la pantalla
const buscarLetras = () => {
  const div = document.querySelectorAll('.letraAdivinar');
  this.addEventListener('click', (e) => {
    let comparacion = e.target.innerHTML;
    contadorLetras = 0;
    palabraSeparada.forEach((letra, index) => {
      console.log(index);
      console.log(letra);
      if (letra === comparacion) {
        div[index].classList.remove('letraAdivinar');
        div[index].classList.add('letraAcertada');
        contadorLetras += 1;
      }
      if (
        document.querySelectorAll('.letraAcertada').length ===
        palabraSeparada.length
      ) {
        setTimeout(() => {
          alert('ganaste');
          location.reload();
        }, 500);
      }
    });
    if (contadorLetras === 0) {
      oportunidades += 1;
    }

    console.log(e.target.innerHTML);

    borrar(oportunidades);
  });
};

const borrar = (intentos) => {
  switch (intentos) {
    case 1:
      console.log('comienza el juego');
      break;
    case 2:
      cuerpoQuemado = document.querySelector('.pizq');
      cuerpoQuemado.classList.add('ocultar');
      console.log('te quedan 5 intentos');
      break;
    case 3:
      cuerpoQuemado = document.querySelector('.pdech');
      cuerpoQuemado.classList.add('ocultar');
      console.log('te quedan 4 intentos');
      break;
    case 4:
      cuerpoQuemado = document.querySelector('.bizq');
      cuerpoQuemado.classList.add('ocultar');
      console.log('te quedan 3 intentos');
      break;
    case 5:
      cuerpoQuemado = document.querySelector('.bdech');
      cuerpoQuemado.classList.add('ocultar');
      console.log('te quedan 2 intentos');
      break;
    case 6:
      cuerpoQuemado = document.querySelector('.cuerpo');
      cuerpoQuemado.classList.add('ocultar');
      console.log('te quedan 1 intentos');
      break;
    case 7:
      cuerpoQuemado = document.querySelector('.cabeza');
      cuerpoQuemado.classList.add('ocultar');
      setTimeout(() => {
        alert('Perdiste');
        location.reload();
      }, 200);
      break;
  }
};
