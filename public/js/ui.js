import { productos } from "./productos.js";
import { agregar, vaciarCarrito, dibujarCarrito, carrito } from "./carrito.js";

export function renderCatalogo() {
  const catalogo = document.querySelector("#gridProductos");

  catalogo.innerHTML = "";

  for (const p of productos) {
    const card = document.createElement("article");
    card.className = "product";

    card.innerHTML = `
      <h4>${p.nombre}</h4>
      <p>Tipo: ${p.tipo}</p>
      <p class="price">${p.precio.toFixed(2)} € + IVA</p>
      <button class="btn" data-id="${p.id}">Añadir</button>
    `;

    catalogo.appendChild(card);
  }

  

  const nuevoGrid = catalogo.cloneNode(true);
  catalogo.replaceWith(nuevoGrid);

  nuevoGrid.addEventListener("click", (ev) => {
    const btn = ev.target.closest("button[data-id]");
    if (!btn) return;
    const id = +btn.dataset.id;
    agregar(id);
    dibujarCarrito(carrito, 
        document.querySelector("#listaCarrito"), 
        document.querySelector("#txtTotal"), 
        document.querySelector("#txtUnidades"));
  });

  document.querySelector("#btnVaciar").addEventListener("click", async () => {
    carrito.length = 0;
    dibujarCarrito(carrito, 
        document.querySelector("#listaCarrito"), 
        document.querySelector("#txtTotal"), 
        document.querySelector("#txtUnidades"));

    localStorage.setItem("carrito", JSON.stringify(carrito));

    try {
        await fetch("/carrito/vaciar", { method: "POST" });
    } catch (err) {
        console.error("Error vaciando carrito en sesión:", err);
    }

  });
}
