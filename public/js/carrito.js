import { buscarProducto, precioIVA, decimalEuros } from "./productos.js";

export let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

export async function agregar(idProducto) {
  const p = buscarProducto(idProducto);
  if (!p) return;

  const linea = carrito.find(l => l.id === idProducto);
  if (linea) {
    linea.cantidad += 1;
    linea.subtotal = +(linea.cantidad * p.precio).toFixed(2);
  } else {
    carrito.push({
      id: p.id,
      nombre: p.nombre,
      cantidad: 1,
      subtotal: +p.precio.toFixed(2),
    });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  dibujarCarrito(carrito, 
    document.querySelector("#listaCarrito"),
    document.querySelector("#txtTotal"),
    document.querySelector("#txtUnidades")
    );

    try {
        await fetch("/carrito", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: p.id, nombre: p.nombre, precio: p.precio })
        });
    } catch (err) {
        console.error("Error guardando carrito en sesión:", err);
    }
}

export function vaciarCarrito() {
  carrito = [];
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

export function dibujarCarrito(lineas = [], ulCarrito, txtTotal, txtUds) {
  ulCarrito.innerHTML = "";
  let tUnidades = 0;
  let tImporte = 0;

  for (const l of lineas) {
    const li = document.createElement("li");
    li.textContent = ` ${l.nombre} - ${l.cantidad} uds - ${decimalEuros(l.subtotal)}`;
    ulCarrito.appendChild(li);

    tUnidades += l.cantidad;
    tImporte += l.subtotal;
  }

  txtUds.textContent = `${tUnidades} ud`;
  txtTotal.textContent = decimalEuros(precioIVA(tImporte));
}
