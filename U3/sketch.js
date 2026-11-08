// enjambre de lluvia - unidad 3
// integrantes: Renata, Eduardo, Antonia y Macarena
// los datos de lluvia cambian el movimiento y aspecto del enjambre


// RENATA
const MODO_FUENTE = "csv"; // "csv" para los datos o "simulada" para prueba
const ARCHIVO = "lluvia.csv";

const LLUVIA_MIN = 0;
const LLUVIA_MAX = 2.2;
const CANTIDAD_AGENTES = 45;
const RADIO_VECINOS = 75;
const FUERZA_ALINEACION = 0.08;
const SEMILLA = 2026;

let agentes = [];
let datos = [];
let indice = 0;
let estacionActual = null;
let senalObjetivo = 0;
let senalSuave = 0;
let hayDatos = false;

function setup() {
  createCanvas(800, 500);
  frameRate(30);
  randomSeed(SEMILLA);

  for (let i = 0; i < CANTIDAD_AGENTES; i++) {
    agentes.push({
      x: random(width),
      y: random(height),
      vx: random(-1.5, 1.5),
      vy: random(-1.5, 1.5)
    });
  }

  if (MODO_FUENTE === "csv") {
    cargarDatos();
    setInterval(cargarDatos, 30000);
  } else {
    datos = [
      { fecha: "simulada", estacion: "Sin lluvia", lluvia: 0 },
      { fecha: "simulada", estacion: "Lluvia media", lluvia: 1.1 },
      { fecha: "simulada", estacion: "Lluvia alta", lluvia: 2.2 }
    ];
    hayDatos = true;
  }
}

async function cargarDatos() {
  try {
    const respuesta = await fetch(ARCHIVO + "?t=" + Date.now());

    if (!respuesta.ok) {
      throw new Error("No se encontró el archivo");
    }

    const texto = await respuesta.text();
    const filas = texto.replace("\uFEFF", "").trim().split(/\r?\n/);
    const nuevosDatos = [];

    // el csv tiene fecha, estacion y precipitacion_mm
    for (let i = 1; i < filas.length; i++) {
      const partes = filas[i].split(",");
      const lluviaTexto = partes[2]?.trim();
      const lluvia = Number(lluviaTexto);

      if (partes[0] && partes[1] && lluviaTexto &&
          Number.isFinite(lluvia) && lluvia >= 0) {
        nuevosDatos.push({
          fecha: partes[0].trim(),
          estacion: partes[1].trim(),
          lluvia: lluvia
        });
      }
    }

    if (nuevosDatos.length === 0) {
      throw new Error("No hay datos válidos");
    }

    datos = nuevosDatos;
    hayDatos = true;
  } catch (error) {
    hayDatos = false;
  }
}


//EDUARDO
function draw() {
  background(18, 30, 48);

  if (hayDatos) {
    leerSenal();
    moverAgentes();
  }

  dibujarAgentes();
  mostrarTexto();

  //if (frameCount === 250) noLoop();
}

function leerSenal() {
  // cambiamos de estación cada 90 cuadros (3 segundos)
  if (estacionActual === null || frameCount % 90 === 0) {
    siguienteEstacion();
  }

  senalSuave = lerp(senalSuave, senalObjetivo, 0.08);
}

function siguienteEstacion() {
  if (datos.length === 0) return;

  estacionActual = datos[indice];
  indice = (indice + 1) % datos.length;

  const rango = LLUVIA_MAX - LLUVIA_MIN;
  if (rango > 0) {
    senalObjetivo = constrain(
      (estacionActual.lluvia - LLUVIA_MIN) / rango,
      0,
      1
    );
  }
}


// ANTONIA
function moverAgentes() {
  for (const agente of agentes) {
    let sumaX = 0;
    let sumaY = 0;
    let vecinos = 0;

    // cada punto mira solamente a los que están cerca
    for (const otro of agentes) {
      if (otro !== agente &&
          dist(agente.x, agente.y, otro.x, otro.y) < RADIO_VECINOS) {
        sumaX += otro.vx;
        sumaY += otro.vy;
        vecinos++;
      }
    }

    if (vecinos > 0) {
      const fuerza = FUERZA_ALINEACION * (0.25 + senalSuave);
      agente.vx = lerp(agente.vx, sumaX / vecinos, fuerza);
      agente.vy = lerp(agente.vy, sumaY / vecinos, fuerza);
    }

    // con más lluvia, los puntos se mueven más rápido
    const velocidad = lerp(0.5, 3.5, senalSuave);
    let largo = sqrt(agente.vx * agente.vx + agente.vy * agente.vy);

    if (largo < 0.01) {
      agente.vx = 1;
      agente.vy = 0;
      largo = 1;
    }

    agente.vx = agente.vx / largo * velocidad;
    agente.vy = agente.vy / largo * velocidad;

    agente.x += agente.vx;
    agente.y += agente.vy;

    // si salen del lienzo, aparecen por el lado opuesto
    if (agente.x < 0) agente.x = width;
    if (agente.x > width) agente.x = 0;
    if (agente.y < 0) agente.y = height;
    if (agente.y > height) agente.y = 0;
  }
}


// MACARENA
function dibujarAgentes() {
  const tamano = lerp(5, 18, senalSuave);

  noStroke();
  fill(
    105 - 35 * senalSuave,
    150 + 80 * senalSuave,
    180 + 75 * senalSuave
  );

  for (const agente of agentes) {
    circle(agente.x, agente.y, tamano);
  }
}


//RENATA
function mostrarTexto() {
  noStroke();
  fill(255);
  textSize(15);

  text("Enjambre según precipitación", 18, 28);

  if (!hayDatos) {
    fill(255, 100, 100);
    text("SIN DATOS: revisa lluvia.csv", 18, 55);
  } else {
    const fuente = MODO_FUENTE === "csv" ? "Datos abiertos" : "Simulada";
    text("Fuente: " + fuente, 18, 52);

    if (estacionActual) {
      text("Estación: " + estacionActual.estacion, 18, 76);
      text("Fecha: " + estacionActual.fecha, 18, 100);
      text("Agua caída en 24 horas: " +
           estacionActual.lluvia + " mm", 18, 124);
      text("Señal suavizada: " + senalSuave.toFixed(2), 18, 148);
    }
  }

  text("Flecha derecha: siguiente estación", 18, height - 18);
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW && hayDatos) {
    siguienteEstacion();
  }
}