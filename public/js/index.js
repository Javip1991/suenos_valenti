import { renderCatalogo } from "./ui.js";
import { carrito } from "./carrito.js";

// Renderizar catálogo y carrito al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    await cargarCarritoSesion;
    renderCatalogo();
  
  dibujarCarrito(carrito, 
    document.querySelector("#listaCarrito"), 
    document.querySelector("#txtTotal"), 
    document.querySelector("#txtUnidades"));

   
});

export async function cargarCarritoSesion() {
    try {
        const res = await fetch("/carrito");
        if (!res.ok) return;
        const carritoSesion = await res.json();
        carrito.length = 0;
        carrito.push(...carritoSesion); // Sobrescribe localStorage
        dibujarCarrito(carrito, 
            document.querySelector("#listaCarrito"), 
            document.querySelector("#txtTotal"), 
            document.querySelector("#txtUnidades"));

        localStorage.setItem("carrito", JSON.stringify(carrito));
         dibujarCarrito(carrito, 
        document.querySelector("#listaCarrito"), 
        document.querySelector("#txtTotal"), 
        document.querySelector("#txtUnidades"));
    } catch (err) {
        console.error("Error cargando carrito:", err);
    }
};

