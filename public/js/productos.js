export const productos = [
  { id: 1, nombre: "Clase de masaje de pies en pareja", tipo: "parejas", precio: 59.99 },
  { id: 2, nombre: "Clase grupal sobre apertura de chakras", tipo: "grupal", precio: 69.99 },
  { id: 3, nombre: "Clase individual de pilates, profe : Poncio", tipo: "individual", precio: 49.99 },
  { id: 4, nombre: "Clase de iniciacion a la ayahuasca", tipo: "viaje", precio: 89.99 },
  { id: 5, nombre: "Clase de masajes astrales en pareja", tipo: "astral", precio: 79.99 },
  { id: 6, nombre: "Clase de adiestramiento del sapo Bufo", tipo: "animales", precio: 89.99 },
  { id: 7, nombre: "Cata individual de hongos espaciales", tipo: "comida", precio: 99.99 },
  { id: 8, nombre: "DMT is for everybody in the place!", tipo: "DMT", precio: 149.99 },
];

export function buscarProducto(id) {
  return productos.find((p) => p.id === id);
}

export function precioIVA(precio = 0, iva = 0.21) {
  return precio + precio * iva;
}

export function decimalEuros(importe) {
  return `${importe.toFixed(2)} €`;
}
