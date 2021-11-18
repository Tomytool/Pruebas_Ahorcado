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
  arrayTexto = cadena.split(' ');
  console.log({ arrayTexto });
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
  palabraSeparada.forEach((letra, index) => {
    if (
      letra === ',' ||
      letra === '.' ||
      letra === ';' ||
      letra === '?' ||
      letra === '!'
    ) {
      palabraSeparada.splice(index, 1);
    }
  });
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
          mostrarAlerta('Has Ganado', 'blue', false);
        }, 200);
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
  if (intentos === 1) {
  }
  if (intentos === 2) {
    cuerpoQuemado = document.querySelector('.pizq');
    cuerpoQuemado.classList.add('ocultar');
  }
  if (intentos === 3) {
    cuerpoQuemado = document.querySelector('.pdech');
    cuerpoQuemado.classList.add('ocultar');
  }
  if (intentos === 4) {
    cuerpoQuemado = document.querySelector('.bizq');
    cuerpoQuemado.classList.add('ocultar');
  }
  if (intentos === 5) {
    cuerpoQuemado = document.querySelector('.bdech');
    cuerpoQuemado.classList.add('ocultar');
  }
  if (intentos === 6) {
    cuerpoQuemado = document.querySelector('.cuerpo');
    cuerpoQuemado.classList.add('ocultar');
  }
  if (intentos === 7) {
    cuerpoQuemado = document.querySelector('.cabeza');
    cuerpoQuemado.classList.add('ocultar');
    setTimeout(() => {
      mostrarAlerta('Has perdido', 'red', true);
    }, 200);
  }
};
