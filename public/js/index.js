import { renderCatalogo } from "./ui.js";
import { carrito, dibujarCarrito } from "./carrito.js";

document.addEventListener("DOMContentLoaded", () => {

  const guardado = JSON.parse(localStorage.getItem("carrito")) || [];

  carrito.length = 0;
  carrito.push(...guardado);

  dibujarCarrito(
    carrito,
    document.querySelector("#listaCarrito"),
    document.querySelector("#txtTotal"),
    document.querySelector("#txtUnidades")
  );

  renderCatalogo();
});
