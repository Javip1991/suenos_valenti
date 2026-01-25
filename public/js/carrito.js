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
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: p.id, nombre: p.nombre, precio: p.precio })
        });
    } catch (err) {
        console.error("Error guardando carrito en sesión:", err);
    }
}

export function vaciarCarrito() {
  carrito.length = 0;
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

export function dibujarCarrito(lineas, ulCarrito, txtTotal, txtUds) {
  ulCarrito.innerHTML = "";
  let tUnidades = 0;
  let tImporte = 0;

  for (const l of lineas) {
    const li = document.createElement("li");
    li.innerHTML = `
  <span>${l.nombre}</span>
  <div class="qty-controls">
    <button class="btn-minus" data-id="${l.id}">−</button>
    <span>${l.cantidad}</span>
    <button class="btn-plus" data-id="${l.id}">+</button>
  </div>
  <strong>${decimalEuros(l.subtotal)}</strong>
`;


    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.className = "btn-eliminar";
    btnEliminar.addEventListener("click", async () => {
      eliminarProducto(l.id);
    });

    li.appendChild(btnEliminar);
    ulCarrito.appendChild(li);

    tUnidades += l.cantidad;
    tImporte += l.subtotal;
  }

  txtUds.textContent = `${tUnidades} ud`;
  txtTotal.textContent = decimalEuros(precioIVA(tImporte));
}

export async function eliminarProducto(idProducto) {
  const index = carrito.findIndex(l => l.id === idProducto);
  if (index !== -1) {
    carrito.splice(index, 1); 
    localStorage.setItem("carrito", JSON.stringify(carrito));

    dibujarCarrito(
      carrito,
      document.querySelector("#listaCarrito"),
      document.querySelector("#txtTotal"),
      document.querySelector("#txtUnidades")
    );

    
    try {
      await fetch("/carrito/eliminar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: idProducto })
      });
    } catch (err) {
      console.error("Error eliminando producto del carrito en sesión:", err);
    }
  }
}

function modificarCantidad(idProducto, cambio) {
  const linea = carrito.find(l => l.id === idProducto);
  if (!linea) return;

  const precioUnitario = linea.subtotal / linea.cantidad;
  linea.cantidad += cambio;

  if (linea.cantidad <= 0) {
    const index = carrito.findIndex(l => l.id === idProducto);
    if (index !== -1) carrito.splice(index, 1);
  } else {
    linea.subtotal = +(precioUnitario * linea.cantidad).toFixed(2);
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));

  dibujarCarrito(
    carrito,
    document.querySelector("#listaCarrito"),
    document.querySelector("#txtTotal"),
    document.querySelector("#txtUnidades")
  );
}

document.addEventListener("click", (e) => {
  const btnPlus = e.target.closest(".btn-plus");
  const btnMinus = e.target.closest(".btn-minus");

  if (btnPlus) {
    modificarCantidad(+btnPlus.dataset.id, 1);
  }

  if (btnMinus) {
    modificarCantidad(+btnMinus.dataset.id, -1);
  }
});
