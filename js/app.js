let oportunidades = 0;
let cuerpoQuemado;
const borrar = () => {
  oportunidades = oportunidades + 1;
  switch (oportunidades) {
    case 1:
      cuerpoQuemado = document.querySelector('.pizq');
      cuerpoQuemado.classList.add('ocultar');
      break;
    case 2:
      cuerpoQuemado = document.querySelector('.pdech');
      cuerpoQuemado.classList.add('ocultar');
      break;
    case 3:
      cuerpoQuemado = document.querySelector('.bizq');
      cuerpoQuemado.classList.add('ocultar');
      break;
    case 4:
      cuerpoQuemado = document.querySelector('.bdech');
      cuerpoQuemado.classList.add('ocultar');
      break;
    case 5:
      cuerpoQuemado = document.querySelector('.cuerpo');
      cuerpoQuemado.classList.add('ocultar');
      break;
    case 6:
      cuerpoQuemado = document.querySelector('.cabeza');
      cuerpoQuemado.classList.add('ocultar');
      break;
    default:
      console.log('Has perdido');
      break;
  }
};
