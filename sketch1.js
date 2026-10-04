//RENATA

let agentes = [];
let cantidad = 60; // 30 rojos y 30 azules

//parametros
let radioVecindad = 90;
let radioSeparacion = 20; //distancia minima para que no choquen

//fuerzas (para esto nos ayudó la ia)
let fuerzaAtraccionIguales = 0.04; //para que se junten los del mismo color
let fuerzaRepulsionDiferentes = 0.10; //para que se alejen de los del otro color
let fuerzaSeparacion = 0.12; // para noponerse encima de otros
let fuerzaAlineacion = 0.03; // para ir hacia el mismo lado

let modoBorde = "REBOTAR";

function setup() {
  createCanvas(500, 500);
  
  //para que siempre salgan en el mismo lado al probar
  randomSeed(99);

  for (let i = 0; i < cantidad; i++) {
    //mitad para un lado y mitad para el otro
    let esTipoA = i < floor(cantidad / 2);

    agentes.push({
      x: random(30, 470),
      y: random(30, 470),
      vx: random(-0.8, 0.8), //lento al inicio
      vy: random(-0.8, 0.8),
      tam: 12,
      tipo: esTipoA ? "A" : "B" //es tipo A o B
    });
  }
}

function draw() {
  background(10, 25, 50, 40);

  //mover el primero si mantengo el click
  if (mouseIsPressed) {
    agentes[0].x = mouseX;
    agentes[0].y = mouseY;
  }

  for (let a of agentes) {
    let vecinos = vecinosDe(a, agentes, radioVecindad);

    //aplicar reglas (para esto consultamos ayuda a la IA)
    aplicarAtraccionIguales(a, vecinos);
    aplicarRepulsionDiferentes(a, vecinos);
    aplicarSeparacion(a, vecinos);
    aplicarAlineacion(a, vecinos);

    //que no vayan tan rapido antes de moverlos
    if (a.vx > 3.5) a.vx = 3.5;
    if (a.vx < -3.5) a.vx = -3.5;
    if (a.vy > 3.5) a.vy = 3.5;
    if (a.vy < -3.5) a.vy = -3.5;

    //actualizar posicion
    a.x += a.vx;
    a.y += a.vy;

    aplicarBorde(a);
  }

  //apague esto para la entrega
  // dibujarRedVecindad(agentes[0], agentes);

  //dibujar los agentes segun color
  mostrar(agentes);
}

//mostrar los agentes segun color
function mostrar(todos) {
  for (let a of todos) {
    //lo pinta rojo o azul dependiendo de que tipo es
    if (a.tipo == "A") {
      fill(255, 80, 80); // rojo
    } else {
      fill(100, 200, 255); // azul
    }
    noStroke();
    circle(a.x, a.y, a.tam);
  }
}

//junta a los del mismo color
function aplicarAtraccionIguales(a, vecinos) {
  let sumax = 0;
  let sumay = 0;
  let contador = 0;

  for (let v of vecinos) {
    //comprueba si es vecino o no
    if (v.tipo == a.tipo) {
      sumax += v.x;
      sumay += v.y;
      contador++;
    }
  }

  if (contador > 0) {
    let promx = sumax / contador;
    let promy = sumay / contador;
    a.vx += (promx - a.x) * fuerzaAtraccionIguales * 0.1;
    a.vy += (promy - a.y) * fuerzaAtraccionIguales * 0.1;
  }
}
//EDUARDO
//alejar a los que son de diferente color
function aplicarRepulsionDiferentes(a, vecinos) {
  for (let v of vecinos) {
    //comprueba si el vecino es distinto
    if (v.tipo != a.tipo) {
      let d = dist(a.x, a.y, v.x, v.y);
      if (d > 0) {
        let empujex = (a.x - v.x) / d;
        let empujey = (a.y - v.y) / d;
        a.vx += empujex * fuerzaRepulsionDiferentes;
        a.vy += empujey * fuerzaRepulsionDiferentes;
      }
    }
  }
}
//MACARENA
//espacio personal entre articulos para que no se pisen
function aplicarSeparacion(a, vecinos) {
  for (let v of vecinos) {
    let d = dist(a.x, a.y, v.x, v.y);
    if (d > 0 && d < radioSeparacion) {
      let empujex = (a.x - v.x) / d;
      let empujey = (a.y - v.y) / d;
      a.vx += empujex * fuerzaSeparacion;
      a.vy += empujey * fuerzaSeparacion;
    }
  }
}
