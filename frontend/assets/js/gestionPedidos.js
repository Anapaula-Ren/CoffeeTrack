const API_URL = 'http://localhost:3000';

let pedidoActual = [];
let allProducts = [];
let clienteSeleccionadoNombre = '';
let listaInsumosGlobal = [];
let pendingPersonalizationResolver = null;
let pendingPersonalizationRejecter = null;

const resumenModal = document.getElementById('resumenModal');
const listaPedidoModal = document.getElementById('listaPedidoModal');
const totalModal = document.getElementById('totalModal');
const closeButton = document.querySelector('.close-button') || document.querySelector('#resumenModal .modal-close-btn');
const cerrarYConfirmarButton = document.getElementById('cerrarYConfirmar');
const seguirAgregandoButton = document.getElementById('seguirAgregando');

const clienteInitModal = document.getElementById('clienteInitModal');
const inputBusqueda = document.getElementById('busquedaCliente');
const btnBuscar = document.getElementById('btnBuscarCliente');
const listaResultados = document.getElementById('listaResultados');
const formNuevo = document.getElementById('formNuevoCliente');
const selectMesaRapida = document.getElementById('selectMesaRapida');
const btnRegistrar = document.getElementById('btnRegistrarCliente');
const btnCancelarRegistro = document.getElementById('btnCancelarRegistro');
const btnConfirmarMesa = document.getElementById('btnConfirmarMesa');
const btnSalirPedidos = document.getElementById('btnSalirPedidos');
const inputIdFinal = document.getElementById('idClienteFinal');

const addProductModal = document.getElementById('addProductModal');
const btnAddProduct = document.getElementById('btnAddProduct');
const btnCloseAdd = document.getElementById('btnCloseAddProduct') || document.querySelector('.close-add-product');
const formAdd = document.getElementById('addProductForm');
const categorySelect = document.getElementById('newProdCategory');

const userRole = localStorage.getItem('usuarioRol');

document.getElementById('btnCerrarSesion')
  ?.addEventListener('click', function (e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = '../../InicioDeSesion.html';
  });

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();

  clienteInitModal.style.display = 'flex';

  if (userRole === 'Encargado de inventario') {
    const pedidosLink = document.querySelector('nav a[href*="GestionPedidos.html"]');
    const panelLink = document.querySelector('nav a[href*="Panel.html"]');
    if (pedidosLink) pedidosLink.style.display = 'none';
    if (panelLink) panelLink.style.display = 'none';
  }
  
  if (userRole === 'Cajero/Mesero') {
    const inventarioLink = document.querySelector('nav a[href*="Inventario"]');
    if (inventarioLink) inventarioLink.style.display = 'none';
  }

  if (userRole === 'Administrador') {
    const linkUsuarios = document.getElementById('linkUsuarios');
    if (linkUsuarios) linkUsuarios.style.display = 'inline-block';
    if (btnAddProduct) btnAddProduct.style.display = 'inline-block';
  }
});

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/api/menu`);
    if (!response.ok) throw new Error('Error al cargar el menú');
    allProducts = await response.json();
    renderProducts(allProducts);
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al cargar los productos.');
  }
}

function renderProducts(products) {
  const container = document.getElementById('productsContainer');
  container.innerHTML = '';

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = product.IdProducto;
    const imgSrc = product.ImagenUrl || 'https://via.placeholder.com/150?text=Sin+Imagen';

    card.innerHTML = `
      <img src="${imgSrc}" alt="${product.Nombre}"
        onerror="this.src='https://via.placeholder.com/150?text=Error+Imagen'">
      <h3 class="producto-nombre">${product.Nombre}</h3>
      <p class="producto-precio">Precio: $${product.Precio}</p>
      <div class="cantidad-control">
        <label for="cantidad-${product.IdProducto}">Cantidad:</label>
        <input type="number" value="0" min="0" class="producto-cantidad" id="cantidad-${product.IdProducto}">
        <div class="buttons">
          <button class="edit">✏️</button>
          <button class="ok">✔</button>
          <button class="delete">❌</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function cancelarPedidoYLimpiar(mostrarAlerta = true) {
  pedidoActual = [];
  document.querySelectorAll('.producto-cantidad').forEach(input => input.value = 0);
  document.querySelectorAll('.ok').forEach(button => {
    button.disabled = false;
    button.style.backgroundColor = '';
    button.style.cursor = 'pointer';
  });
  resumenModal.style.display = 'none';
  if (mostrarAlerta) alert('❌ Pedido Cancelado. El carrito ha sido vaciado.');
}

function mostrarResumenPedido() {
  listaPedidoModal.innerHTML = '';
  let subtotal = 0;

  if (pedidoActual.length === 0) {
    listaPedidoModal.innerHTML = '<li style="padding: 15px; text-align: center; color: #795548; font-style: italic;">No hay productos en el pedido actual.</li>';
    totalModal.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: bold; color: #3e2723;">
        <span>Total:</span>
        <span>$0.00</span>
      </div>
    `;
  } else {
    pedidoActual.forEach(item => {
      const precioNumero = parseFloat(item.precio.replace('Precio: $', '').trim());
      const itemSubtotal = precioNumero * item.cantidad;
      subtotal += itemSubtotal;

      const li = document.createElement('li');
      li.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px 8px; border-bottom: 1.5px solid #f4ece8; color: #4e342e; font-size: 0.95rem;';
      li.innerHTML = `
        <div style="flex: 1; padding-right: 15px; text-align: left;">
          <strong style="color: #3e2723; display: block; font-size: 0.98rem; font-weight: 600;">${item.nombre}</strong>
          <span style="font-size: 0.82rem; color: #8d6e63; font-weight: 500;">Cantidad: ${item.cantidad} &times; $${precioNumero.toFixed(2)} c/u</span>
        </div>
        <div style="font-weight: 600; color: #5d4037; font-size: 1rem; min-width: 80px; text-align: right;">
          $${itemSubtotal.toFixed(2)}
        </div>
      `;
      listaPedidoModal.appendChild(li);
    });

    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    totalModal.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e8ddd8; padding-bottom: 8px; font-weight: 500;">
        <span>Subtotal:</span>
        <span style="color: #5d4037;">$${subtotal.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e8ddd8; padding-bottom: 8px; font-weight: 500;">
        <span>IVA (16%):</span>
        <span style="color: #5d4037;">$${iva.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1.25rem; font-weight: 700; color: #3e2723; padding-top: 6px;">
        <span>Total:</span>
        <span style="color: #2e7d32;">$${total.toFixed(2)}</span>
      </div>
    `;
  }
  resumenModal.style.display = 'block';
}

function actualizarEstadoConfirmar(id, nombre) {
  inputIdFinal.value = id;
  clienteSeleccionadoNombre = nombre;
  btnConfirmarMesa.disabled = false;
  btnConfirmarMesa.style.opacity = '1';
  btnConfirmarMesa.style.cursor = 'pointer';
  btnConfirmarMesa.textContent = `Confirmar ${nombre} y Continuar`;
  listaResultados.style.display = 'none';
  formNuevo.style.display = 'none';
  // Restaurar las tarjetas de mesa
  const tableSect = document.querySelector('.client-table-select');
  if (tableSect) tableSect.style.display = '';
}

btnBuscar.addEventListener('click', async () => {
  const texto = inputBusqueda.value.trim();
  if (texto.length < 2) return alert('Escribe al menos 2 letras para buscar.');

  try {
    const res = await fetch(`${API_URL}/api/clientes/buscar?nombre=${encodeURIComponent(texto)}`);
    const clientes = await res.json();

    listaResultados.innerHTML = '';
    listaResultados.style.display = 'block';
    formNuevo.style.display = 'none';

    const divNuevo = document.createElement('div');
    divNuevo.className = 'add-client-btn-row';
    divNuevo.innerHTML = `<i class="fa-solid fa-circle-plus"></i> Registrar Nuevo Cliente`;
    divNuevo.onclick = () => {
      formNuevo.style.display = 'block';
      listaResultados.style.display = 'none';
      // Ocultar mesas para que el form aparezca en su lugar
      document.querySelector('.client-table-select').style.display = 'none';
      document.getElementById('nuevoNombreCliente').value = texto;
      document.getElementById('nuevoNombreCliente').focus();
    };
    listaResultados.appendChild(divNuevo);

    clientes.forEach(c => {
      const div = document.createElement('div');
      div.className = 'client-search-item';
      div.innerHTML = `<strong>${c.Nombre}</strong> <small>(${c.Email || 'Sin correo'})</small>`;
      div.onclick = () => actualizarEstadoConfirmar(c.IdCliente, c.Nombre);
      listaResultados.appendChild(div);
    });

  } catch (error) {
    console.error('Error buscando cliente:', error);
  }
});

btnCancelarRegistro.addEventListener('click', () => {
  formNuevo.style.display = 'none';
  document.querySelector('.client-table-select').style.display = '';
  document.getElementById('nuevoNombreCliente').value = '';
  document.getElementById('nuevoEmailCliente').value = '';
});

btnRegistrar.addEventListener('click', async () => {
  const nombre = document.getElementById('nuevoNombreCliente').value.trim();
  const email = document.getElementById('nuevoEmailCliente').value.trim();
  if (!nombre) return alert('El nombre es obligatorio.');
  if (!email) return alert('⚠️ El correo es obligatorio para nuevos clientes.');

  showLoader('Registrando cliente...');

  try {
    const res = await fetch(`${API_URL}/api/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email })
    });
    const data = await res.json();
    hideLoader();

    if (data.success) {
      // Mostrar mensaje de éxito en el modal antes de confirmar
      const btnRegistrarEl = document.getElementById('btnRegistrarCliente');
      btnRegistrarEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> ¡Registrado!';
      btnRegistrarEl.style.background = '#388e3c';
      setTimeout(() => {
        actualizarEstadoConfirmar(data.id, data.nombre);
        btnRegistrarEl.innerHTML = '<i class="fa-solid fa-check"></i> Registrar';
        btnRegistrarEl.style.background = '';
      }, 1200);
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    hideLoader();
    console.error(error);
  }
});

document.querySelectorAll('.mesa-card').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mesa-card').forEach(b => b.classList.remove('activa'));
    btn.classList.add('activa');
    const valor = btn.dataset.value;
    const label = btn.dataset.label;
    selectMesaRapida.value = valor;
    actualizarEstadoConfirmar(valor, label);
  });
});

btnConfirmarMesa.addEventListener('click', () => {
  if (inputIdFinal.value) {
    clienteInitModal.style.display = 'none';
    if (pedidoActual.length > 0) {
      cerrarYConfirmarButton.click();
    } else {
      alert(`✅ Cliente: ${clienteSeleccionadoNombre} seleccionado. Añade productos para finalizar.`);
    }
  }
});

btnSalirPedidos.addEventListener('click', () => {
  window.location.href = '../inicio/Inicio.html';
});

closeButton.addEventListener('click', () => cancelarPedidoYLimpiar());
seguirAgregandoButton.addEventListener('click', () => resumenModal.style.display = 'none');

window.addEventListener('click', (event) => {
  if (event.target === resumenModal) cancelarPedidoYLimpiar();
  if (event.target === addProductModal) addProductModal.style.display = 'none';
});

cerrarYConfirmarButton.addEventListener('click', async () => {
  if (pedidoActual.length === 0) {
    alert('El pedido está vacío.');
    resumenModal.style.display = 'none';
    return;
  }

  const idCliente = inputIdFinal.value;
  if (!idCliente) {
    alert('⚠️ Error: No hay cliente seleccionado.');
    resumenModal.style.display = 'none';
    clienteInitModal.style.display = 'flex';
    return;
  }

  let total = 0;
  const productosParaDB = pedidoActual.map(item => {
    const precio = parseFloat(item.precio.replace('Precio: $', '').trim());
    const subtotal = precio * item.cantidad;
    total += subtotal;
    return {
      id: item.idProducto,
      cantidad: item.cantidad,
      subtotal: parseFloat(subtotal.toFixed(2)),
      personalizado: item.personalizado
    };
  });

  const pedidoData = {
    idCliente: parseInt(idCliente, 10),
    idUsuario: parseInt(localStorage.getItem('usuarioId') || '1', 10),
    total: parseFloat(total.toFixed(2)),
    productos: productosParaDB,
    usuarioRol: localStorage.getItem('usuarioRol')
  };

  showLoader('Procesando pedido...');

  try {
    const response = await fetch(`${API_URL}/api/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedidoData)
    });
    const data = await response.json();
    hideLoader();

    if (response.ok && data.success) {
      alert(`✅ Pedido #${data.idPedido} guardado con éxito.`);
      cancelarPedidoYLimpiar(false);
    } else {
      alert(`❌ Error: ${data.message}`);
    }
  } catch (error) {
    hideLoader();
    console.error(error);
    alert('❌ Error de conexión.');
  }
});

document.getElementById('productsContainer').addEventListener('click', async (e) => {
  const target = e.target;
  const card = target.closest('.card');
  if (!card) return;

  // Si hacen clic en la tarjeta o su contenido directo (excluyendo controles de cantidad y botones ok/edit/delete)
  if (!target.closest('.cantidad-control') && !target.classList.contains('ok') && !target.classList.contains('edit') && !target.classList.contains('delete')) {
    const idProducto = parseInt(card.dataset.id, 10);
    abrirEditarRecetaModal(idProducto);
    return;
  }
if (target.classList.contains('ok')) {
  if (target.disabled) return;
  
  const idProducto = parseInt(card.dataset.id, 10);
  const cantidadInput = card.querySelector('.producto-cantidad');
  let cantidad = parseInt(cantidadInput.value, 10);
  if (isNaN(cantidad) || cantidad < 1) return alert('Cantidad inválida');

  const productObj = allProducts.find(p => p.IdProducto === idProducto);
  const esBebida = productObj && (productObj.Categoria === 'Bebidas' || (productObj.Categorium && productObj.Categorium.Nombre === 'Bebidas'));
//nuevo if bebida
if (esBebida) {
  const idCliente = document.getElementById('idClienteFinal').value;
  if (!idCliente) {
    alert('⚠️ Selecciona un cliente o mesa primero.');
    clienteInitModal.style.display = 'flex';
    return;
  }
  target.disabled = true;
  target.style.backgroundColor = '#ccc';
  target.style.cursor = 'default';
  await agregarUnidadesConPersonalizacion(productObj, cantidad);  // SIN EL 'add'
}

  else {
    // Producto normal (no bebida)
    const nombre = card.querySelector('.producto-nombre').textContent.trim();
    const precio = card.querySelector('.producto-precio').textContent.trim();
    const existente = pedidoActual.find(p => p.idProducto === idProducto);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      pedidoActual.push({ idProducto, nombre, precio, cantidad });
    }
    target.disabled = true;
    target.style.backgroundColor = '#ccc';
    target.style.cursor = 'default';
    mostrarResumenPedido();
  }
}
  
if (target.classList.contains('edit')) {
  const idProducto = parseInt(card.dataset.id, 10);
  const cantidadInput = card.querySelector('.producto-cantidad');
  let nuevaCantidad = parseInt(cantidadInput.value, 10);
  if (isNaN(nuevaCantidad) || nuevaCantidad < 1) return alert('Cantidad inválida');

  const productObj = allProducts.find(p => p.IdProducto === idProducto);
  const esBebida = productObj && (productObj.Categoria === 'Bebidas' || (productObj.Categorium && productObj.Categorium.Nombre === 'Bebidas'));

  if (esBebida) {
    // Buscar TODOS los índices de ítems con este idProducto
    const indicesAEliminar = [];
    pedidoActual.forEach((item, idx) => {
      if (item.idProducto === idProducto && item.personalizado) {
        indicesAEliminar.push(idx);
      }
    });
    
    if (indicesAEliminar.length === 0) {
      alert('Este producto no está en el pedido. Agrégalo primero con ✔');
      return;
    }
    
    // Eliminar TODOS los ítems encontrados (de atrás hacia adelante para no afectar índices)
    for (let i = indicesAEliminar.length - 1; i >= 0; i--) {
      pedidoActual.splice(indicesAEliminar[i], 1);
    }
    
    // Guardar referencia al botón OK de la tarjeta
    const okButton = card.querySelector('.ok');
    if (okButton) {
      okButton.disabled = true;
      okButton.style.backgroundColor = '#ccc';
      okButton.style.cursor = 'default';
    }
    
    // Llamar a la función en modo 'add' (agregar los nuevos)
    await agregarUnidadesConPersonalizacion(productObj, nuevaCantidad, 'add');
  } else {
    const existente = pedidoActual.find(p => p.idProducto === idProducto);
    if (existente) {
      existente.cantidad = nuevaCantidad;
      mostrarResumenPedido();
      alert('Cantidad actualizada.');
    } else {
      alert('Producto no añadido aún. Usa ✔ primero.');
    }
  }
}


  if (target.classList.contains('delete')) {
    const idProducto = parseInt(card.dataset.id, 10);
    const index = pedidoActual.findIndex(p => p.idProducto === idProducto);

    if (index !== -1) {
      pedidoActual.splice(index, 1);
      mostrarResumenPedido();
      alert('Eliminado del pedido.');
      const okButton = card.querySelector('.ok');
      if (okButton) {
        okButton.disabled = false;
        okButton.style.backgroundColor = '';
        okButton.style.cursor = 'pointer';
      }
    } else {
      alert('Este producto no está en el pedido.');
    }
  }
});

async function cargarInsumosSistema() {
  try {
    const res = await fetch(`${API_URL}/api/inventario/insumos`);
    listaInsumosGlobal = await res.json();
  } catch (e) { console.error('Error cargando insumos', e); }
}

function agregarFilaIngrediente() {
  const div = document.createElement('div');
  div.className = 'fila-ingrediente';
  div.style.cssText = 'display:flex; gap:10px; margin-bottom:8px;';

  let opciones = '<option value="">-- Insumo --</option>';
  listaInsumosGlobal.forEach(insumo => {
    opciones += `<option value="${insumo.IdInventario}">${insumo.NombreProducto}</option>`;
  });

  div.innerHTML = `
    <select class="sel-insumo" style="flex:2; padding:5px; border:1px solid #ccc; border-radius:4px;">${opciones}</select>
    <input type="number" class="inp-cantidad" placeholder="Cant. (ej: 0.250)" step="0.001"
      style="flex:1; padding:5px; border:1px solid #ccc; border-radius:4px;">
    <button type="button" onclick="this.parentElement.remove()"
      style="background:#dc3545; color:white; border:none; border-radius:4px; padding:0 10px; cursor:pointer;">&times;</button>
  `;
  document.getElementById('listaIngredientesContainer').appendChild(div);
}

if (btnAddProduct) {
  btnAddProduct.addEventListener('click', async () => {
    addProductModal.style.display = 'block';
    if (listaInsumosGlobal.length === 0) await cargarInsumosSistema();

    document.getElementById('listaIngredientesContainer').innerHTML = '';
    agregarFilaIngrediente();

    if (categorySelect && categorySelect.options.length <= 1) {
      try {
        const res = await fetch(`${API_URL}/api/menu/categorias`);
        if (res.ok) {
          const cats = await res.json();
          categorySelect.innerHTML = '<option value="">Seleccione...</option>';
          cats.forEach(c => {
            const op = document.createElement('option');
            op.value = c.IdCategoria;
            op.textContent = c.Nombre;
            categorySelect.appendChild(op);
          });
        }
      } catch (e) { console.error(e); }
    }
  });
}

if (btnCloseAdd) btnCloseAdd.addEventListener('click', () => addProductModal.style.display = 'none');

document.getElementById('btnAgregarIngrediente')
  ?.addEventListener('click', agregarFilaIngrediente);

if (formAdd) {
  formAdd.addEventListener('submit', async (e) => {
    e.preventDefault();

    const productoData = {
      Nombre: document.getElementById('newProdName').value,
      Descripcion: document.getElementById('newProdDesc').value,
      Precio: parseFloat(document.getElementById('newProdPrice').value),
      Stock: parseInt(document.getElementById('newProdStock').value),
      IdCategoria: parseInt(document.getElementById('newProdCategory').value),
      Imagen: document.getElementById('newProdImage').value,
      Receta: []
    };

    document.querySelectorAll('.fila-ingrediente').forEach(row => {
      const idInsumo = row.querySelector('.sel-insumo').value;
      const cantidad = row.querySelector('.inp-cantidad').value;
      if (idInsumo && cantidad) {
        productoData.Receta.push({
          IdInventario: parseInt(idInsumo),
          CantidadInsumo: parseFloat(cantidad)
        });
      }
    });

    try {
      const res = await fetch(`${API_URL}/api/inventario/productos-con-receta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productoData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert('✅ Producto guardado correctamente.');
        addProductModal.style.display = 'none';
        formAdd.reset();
        loadProducts();
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    }
  });
}

const modalQuick = document.getElementById('modalQuickInsumo');
const btnAbrirQuick = document.getElementById('btnAbrirCrearInsumo');
const formQuick = document.getElementById('formQuickInsumo');

if (btnAbrirQuick) {
  btnAbrirQuick.addEventListener('click', (e) => {
    e.preventDefault();
    modalQuick.style.display = 'flex';
  });
}

if (formQuick) {
  formQuick.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevoInsumo = {
      nombre: document.getElementById('qi_nombre').value,
      categoria: parseInt(document.getElementById('qi_categoria').value),
      cantidad: parseFloat(document.getElementById('qi_cantidad').value),
      imagen: document.getElementById('qi_imagen').value || 'https://via.placeholder.com/150'
    };

    try {
      const res = await fetch(`${API_URL}/api/inventario/nuevo-insumo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoInsumo)
      });

      if (res.ok) {
        alert('✅ Ingrediente creado.');
        modalQuick.style.display = 'none';
        formQuick.reset();
        await cargarInsumosSistema();
        actualizarSelectsAbiertos();
      } else {
        alert('Error al guardar');
      }
    } catch (error) { console.error(error); }
  });
}

function actualizarSelectsAbiertos() {
  let nuevasOpciones = '<option value="">-- Insumo --</option>';
  listaInsumosGlobal.forEach(insumo => {
    nuevasOpciones += `<option value="${insumo.IdInventario}">${insumo.NombreProducto}</option>`;
  });

  document.querySelectorAll('.sel-insumo').forEach(select => {
    const valorActual = select.value;
    select.innerHTML = nuevasOpciones;
    select.value = valorActual;
  });
}

// ==========================================
// FUNCIONALIDAD DE PERSONALIZACIÓN DE BEBIDAS
// ==========================================

const personalizadoModal = document.getElementById('personalizadoModal');
const btnClosePersonalizado = document.getElementById('btnClosePersonalizado');
const btnCancelarPersonalizado = document.getElementById('btnCancelarPersonalizado');
const formPersonalizado = document.getElementById('formPersonalizado');

// Manejar los botones de cantidad de Shots de espresso
document.querySelectorAll('.shot-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.shot-btn').forEach(b => {
      b.classList.remove('active');
      b.style.border = '2px solid #eae1db';
      b.style.background = 'white';
      b.style.color = '#795548';
    });
    btn.classList.add('active');
    btn.style.border = '2px solid #8d6e63';
    btn.style.background = '#efebe9';
    btn.style.color = '#5d4037';
    document.getElementById('persShots').value = btn.dataset.value;
  });
});

// Cerrar modal de personalización
if (btnClosePersonalizado) {
  btnClosePersonalizado.addEventListener('click', () => {
    personalizadoModal.style.display = 'none';
  });
}

if (btnCancelarPersonalizado) {
  btnCancelarPersonalizado.addEventListener('click', () => {
    personalizadoModal.style.display = 'none';
  });
}

// Cerrar al hacer clic fuera del modal
window.addEventListener('click', (event) => {
  if (event.target === personalizadoModal) {
    personalizadoModal.style.display = 'none';
  }
});

// Enviar el pedido personalizado al backend
// Enviar el pedido personalizado al backend (MODIFICADO PARA PROMESAS)
if (formPersonalizado) {
  formPersonalizado.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!pendingPersonalizationResolver) return;

    const tipoLeche = document.getElementById('persLeche').value;
    const shots = parseInt(document.getElementById('persShots').value, 10);
    let descLeche = 'Sin leche';
    if (tipoLeche !== 'Sin Leche') {
      const milkOption = document.querySelector('#persLeche option:checked');
      descLeche = milkOption ? `Leche: ${milkOption.textContent.trim()}` : 'Leche';
    }
    const descShots = shots === 0 ? 'Sin espresso' : `${shots} Shot(s)`;
    const nombreCustomizado = `${document.getElementById('persNombreProducto').textContent} (${descLeche}, ${descShots})`;

    pendingPersonalizationResolver({
      tipoLeche,
      shots,
      nombreCustomizado
    });
    document.getElementById('personalizadoModal').style.display = 'none';
    pendingPersonalizationResolver = null;
  });
}

function rechazarPersonalizacion() {
  if (pendingPersonalizationRejecter) {
    pendingPersonalizationRejecter(new Error('cancelado'));
    pendingPersonalizationRejecter = null;
  }
  document.getElementById('personalizadoModal').style.display = 'none';
}

// Asociar a los botones de cierre (busca estos elementos o agrégalos si no existen)
document.getElementById('btnClosePersonalizado')?.addEventListener('click', rechazarPersonalizacion);
document.getElementById('btnCancelarPersonalizado')?.addEventListener('click', rechazarPersonalizacion);

// ==========================================
// FUNCIONALIDAD DE EDICIÓN DE RECETA EN VIVO
// ==========================================

const recetaModal = document.getElementById('recetaModal');
const btnCloseReceta = document.getElementById('btnCloseReceta');
const btnCancelarReceta = document.getElementById('btnCancelarReceta');
const btnRecetaAgregarIngrediente = document.getElementById('btnRecetaAgregarIngrediente');
const formReceta = document.getElementById('formReceta');

async function abrirEditarRecetaModal(idProducto) {
  const productObj = allProducts.find(p => p.IdProducto === idProducto);
  if (!productObj) return;

  showLoader('Cargando receta...');

  const recetaNombreProducto = document.getElementById('recetaNombreProducto');
  const recetaIngredientesContainer = document.getElementById('recetaIngredientesContainer');

  recetaNombreProducto.textContent = productObj.Nombre;
  recetaNombreProducto.dataset.id = idProducto;

  // Cargar insumos globales si aún no están cargados
  if (listaInsumosGlobal.length === 0) {
    await cargarInsumosSistema();
  }

  // Limpiar contenedor de ingredientes
  recetaIngredientesContainer.innerHTML = '<p style="padding:15px; text-align:center; color:#8d6e63; font-style:italic;">Cargando receta del producto...</p>';

  try {
    const res = await fetch(`${API_URL}/api/inventario/productos/${idProducto}/receta`);
    hideLoader();

    if (!res.ok) throw new Error('Error al cargar la receta');
    const receta = await res.json();

    recetaIngredientesContainer.innerHTML = '';
    if (receta.length === 0) {
      agregarFilaIngredienteReceta(); // Fila vacía inicial si no tiene ingredientes
    } else {
      receta.forEach(ingrediente => {
        agregarFilaIngredienteReceta(ingrediente.IdInventario, ingrediente.CantidadInsumo);
      });
    }
  } catch (err) {
    hideLoader();
    console.error(err);
    recetaIngredientesContainer.innerHTML = '<p style="color:#e53935; text-align:center; padding:15px;">❌ Error al cargar la receta.</p>';
  }

  recetaModal.style.display = 'flex';
}
//funcion 
function abrirModalPersonalizacionConPromesa(producto, valoresActuales = null) {
  return new Promise((resolve, reject) => {
    const modal = document.getElementById('personalizadoModal');
    const persNombreProducto = document.getElementById('persNombreProducto');
    const persLeche = document.getElementById('persLeche');
    const persShotsInput = document.getElementById('persShots');

    persNombreProducto.textContent = producto.Nombre;
    persNombreProducto.dataset.id = producto.IdProducto;

    if (valoresActuales) {
      persLeche.value = valoresActuales.tipoLeche || 'Sin Leche';
      persShotsInput.value = valoresActuales.shots || 1;
      // Resaltar botón de shots
      document.querySelectorAll('.shot-btn').forEach(btn => {
        const val = parseInt(btn.dataset.value);
        if (val === (valoresActuales.shots || 1)) {
          btn.classList.add('active');
          btn.style.border = '2px solid #8d6e63';
          btn.style.background = '#efebe9';
          btn.style.color = '#5d4037';
        } else {
          btn.classList.remove('active');
          btn.style.border = '2px solid #eae1db';
          btn.style.background = 'white';
          btn.style.color = '#795548';
        }
      });
    } else {
      persLeche.value = 'Sin Leche';
      persShotsInput.value = '1';
      document.querySelectorAll('.shot-btn').forEach(btn => {
        if (btn.dataset.value === '1') {
          btn.classList.add('active');
          btn.style.border = '2px solid #8d6e63';
          btn.style.background = '#efebe9';
          btn.style.color = '#5d4037';
        } else {
          btn.classList.remove('active');
          btn.style.border = '2px solid #eae1db';
          btn.style.background = 'white';
          btn.style.color = '#795548';
        }
      });
    }

    pendingPersonalizationResolver = resolve;
    pendingPersonalizationRejecter = reject;
    modal.style.display = 'flex';
  });
}


async function agregarUnidadesConPersonalizacion(producto, cantidad) {
  for (let i = 0; i < cantidad; i++) {
    try {
      const personalizacion = await abrirModalPersonalizacionConPromesa(producto);
      const precioFormat = `Precio: $${producto.Precio}`;
      pedidoActual.push({
        idProducto: producto.IdProducto,
        nombre: personalizacion.nombreCustomizado,
        precio: precioFormat,
        cantidad: 1,
        personalizado: { tipoLeche: personalizacion.tipoLeche, shots: personalizacion.shots }
      });
    } catch (err) {
      // Usuario canceló, salir del bucle
      break;
    }
  }
  mostrarResumenPedido();
}


function agregarFilaIngredienteReceta(idInsumo = '', cantidad = '') {
  const div = document.createElement('div');
  div.className = 'fila-ingrediente-receta';
  div.style.cssText = 'display:flex; gap:10px; margin-bottom:8px; align-items:center;';

  let opciones = '<option value="">-- Seleccionar Insumo --</option>';
  listaInsumosGlobal.forEach(insumo => {
    const seleccionado = parseInt(insumo.IdInventario, 10) === parseInt(idInsumo, 10) ? 'selected' : '';
    opciones += `<option value="${insumo.IdInventario}" ${seleccionado}>${insumo.NombreProducto}</option>`;
  });

  div.innerHTML = `
    <select class="sel-insumo-receta" style="flex:2; padding:10px; border:2.5px solid #eae1db; border-radius:8px; outline:none; font-family:inherit; color:#3e2723; background:#fafafa;">${opciones}</select>
    <input type="number" class="inp-cantidad-receta" placeholder="Cant. (kg/l)" step="0.001" min="0" value="${cantidad}" required
      style="flex:1; padding:10px; border:2.5px solid #eae1db; border-radius:8px; outline:none; text-align:center; font-family:inherit; box-sizing:border-box; color:#3e2723; background:#fafafa;">
    <button type="button" class="btn-eliminar-fila-receta"
      style="background:#e53935; color:white; border:none; border-radius:8px; width:38px; height:38px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:1.4rem; font-weight:bold; outline:none; transition:all 0.2s;">&times;</button>
  `;

  div.querySelector('.btn-eliminar-fila-receta').addEventListener('click', () => div.remove());

  document.getElementById('recetaIngredientesContainer').appendChild(div);
}


// Evento para agregar filas vacías en el modal de receta
if (btnRecetaAgregarIngrediente) {
  btnRecetaAgregarIngrediente.addEventListener('click', () => {
    agregarFilaIngredienteReceta();
  });
}

// Cerrar modal de receta
if (btnCloseReceta) {
  btnCloseReceta.addEventListener('click', () => {
    recetaModal.style.display = 'none';
  });
}

if (btnCancelarReceta) {
  btnCancelarReceta.addEventListener('click', () => {
    recetaModal.style.display = 'none';
  });
}

// Cerrar al hacer clic fuera del modal de receta
window.addEventListener('click', (event) => {
  if (event.target === recetaModal) {
    recetaModal.style.display = 'none';
  }
});

// Guardar la receta editada
if (formReceta) {
  formReceta.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idProducto = parseInt(document.getElementById('recetaNombreProducto').dataset.id, 10);
    const recetaIngredientes = [];

    document.querySelectorAll('.fila-ingrediente-receta').forEach(row => {
      const idInsumo = row.querySelector('.sel-insumo-receta').value;
      const cantidad = row.querySelector('.inp-cantidad-receta').value;
      if (idInsumo && cantidad) {
        recetaIngredientes.push({
          IdInventario: parseInt(idInsumo, 10),
          CantidadInsumo: parseFloat(cantidad)
        });
      }
    });

    showLoader('Guardando receta...');

    try {
      const res = await fetch(`${API_URL}/api/inventario/productos/${idProducto}/receta`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Receta: recetaIngredientes })
      });

      const data = await res.json();
      hideLoader();

      if (res.ok && data.success) {
        alert('✅ Receta actualizada correctamente en la base de datos.');
        recetaModal.style.display = 'none';
      } else {
        alert('❌ Error al actualizar la receta: ' + data.message);
      }
    } catch (err) {
      hideLoader();
      console.error(err);
      alert('❌ Error de conexión al guardar la receta.');
    }
  });
}

/*const API_URL = 'http://localhost:3000';

let pedidoActual = [];
let allProducts = [];
let clienteSeleccionadoNombre = '';
let listaInsumosGlobal = [];
let pendingPersonalizationResolver = null;
let pendingPersonalizationRejecter = null;

const resumenModal = document.getElementById('resumenModal');
const listaPedidoModal = document.getElementById('listaPedidoModal');
const totalModal = document.getElementById('totalModal');
const closeButton = document.querySelector('.close-button') || document.querySelector('#resumenModal .modal-close-btn');
const cerrarYConfirmarButton = document.getElementById('cerrarYConfirmar');
const seguirAgregandoButton = document.getElementById('seguirAgregando');

const clienteInitModal = document.getElementById('clienteInitModal');
const inputBusqueda = document.getElementById('busquedaCliente');
const btnBuscar = document.getElementById('btnBuscarCliente');
const listaResultados = document.getElementById('listaResultados');
const formNuevo = document.getElementById('formNuevoCliente');
const selectMesaRapida = document.getElementById('selectMesaRapida');
const btnRegistrar = document.getElementById('btnRegistrarCliente');
const btnCancelarRegistro = document.getElementById('btnCancelarRegistro');
const btnConfirmarMesa = document.getElementById('btnConfirmarMesa');
const btnSalirPedidos = document.getElementById('btnSalirPedidos');
const inputIdFinal = document.getElementById('idClienteFinal');

const addProductModal = document.getElementById('addProductModal');
const btnAddProduct = document.getElementById('btnAddProduct');
const btnCloseAdd = document.getElementById('btnCloseAddProduct') || document.querySelector('.close-add-product');
const formAdd = document.getElementById('addProductForm');
const categorySelect = document.getElementById('newProdCategory');

const userRole = localStorage.getItem('usuarioRol');

document.getElementById('btnCerrarSesion')
  ?.addEventListener('click', function (e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = '../../InicioDeSesion.html';
  });

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();

  clienteInitModal.style.display = 'flex';

  if (userRole === 'Encargado de inventario') {
    const pedidosLink = document.querySelector('nav a[href*="GestionPedidos.html"]');
    const panelLink = document.querySelector('nav a[href*="Panel.html"]');
    if (pedidosLink) pedidosLink.style.display = 'none';
    if (panelLink) panelLink.style.display = 'none';
  }
  
  if (userRole === 'Cajero/Mesero') {
    const inventarioLink = document.querySelector('nav a[href*="Inventario"]');
    if (inventarioLink) inventarioLink.style.display = 'none';
  }

  if (userRole === 'Administrador') {
    const linkUsuarios = document.getElementById('linkUsuarios');
    if (linkUsuarios) linkUsuarios.style.display = 'inline-block';
    if (btnAddProduct) btnAddProduct.style.display = 'inline-block';
  }
});

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/api/menu`);
    if (!response.ok) throw new Error('Error al cargar el menú');
    allProducts = await response.json();
    renderProducts(allProducts);
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al cargar los productos.');
  }
}

function renderProducts(products) {
  const container = document.getElementById('productsContainer');
  container.innerHTML = '';

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = product.IdProducto;
    const imgSrc = product.ImagenUrl || 'https://via.placeholder.com/150?text=Sin+Imagen';

    card.innerHTML = `
      <img src="${imgSrc}" alt="${product.Nombre}"
        onerror="this.src='https://via.placeholder.com/150?text=Error+Imagen'">
      <h3 class="producto-nombre">${product.Nombre}</h3>
      <p class="producto-precio">Precio: $${product.Precio}</p>
      <div class="cantidad-control">
        <label for="cantidad-${product.IdProducto}">Cantidad:</label>
        <input type="number" value="0" min="0" class="producto-cantidad" id="cantidad-${product.IdProducto}">
        <div class="buttons">
          <button class="edit">✏️</button>
          <button class="ok">✔</button>
          <button class="delete">❌</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function cancelarPedidoYLimpiar(mostrarAlerta = true) {
  pedidoActual = [];
  document.querySelectorAll('.producto-cantidad').forEach(input => input.value = 0);
  document.querySelectorAll('.ok').forEach(button => {
    button.disabled = false;
    button.style.backgroundColor = '';
    button.style.cursor = 'pointer';
  });
  resumenModal.style.display = 'none';
  if (mostrarAlerta) alert('❌ Pedido Cancelado. El carrito ha sido vaciado.');
}

function mostrarResumenPedido() {
  listaPedidoModal.innerHTML = '';
  let subtotal = 0;

  if (pedidoActual.length === 0) {
    listaPedidoModal.innerHTML = '<li style="padding: 15px; text-align: center; color: #795548; font-style: italic;">No hay productos en el pedido actual.</li>';
    totalModal.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: bold; color: #3e2723;">
        <span>Total:</span>
        <span>$0.00</span>
      </div>
    `;
  } else {
    pedidoActual.forEach(item => {
      const precioNumero = parseFloat(item.precio.replace('Precio: $', '').trim());
      const itemSubtotal = precioNumero * item.cantidad;
      subtotal += itemSubtotal;

      const li = document.createElement('li');
      li.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px 8px; border-bottom: 1.5px solid #f4ece8; color: #4e342e; font-size: 0.95rem;';
      li.innerHTML = `
        <div style="flex: 1; padding-right: 15px; text-align: left;">
          <strong style="color: #3e2723; display: block; font-size: 0.98rem; font-weight: 600;">${item.nombre}</strong>
          <span style="font-size: 0.82rem; color: #8d6e63; font-weight: 500;">Cantidad: ${item.cantidad} &times; $${precioNumero.toFixed(2)} c/u</span>
        </div>
        <div style="font-weight: 600; color: #5d4037; font-size: 1rem; min-width: 80px; text-align: right;">
          $${itemSubtotal.toFixed(2)}
        </div>
      `;
      listaPedidoModal.appendChild(li);
    });

    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    totalModal.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e8ddd8; padding-bottom: 8px; font-weight: 500;">
        <span>Subtotal:</span>
        <span style="color: #5d4037;">$${subtotal.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e8ddd8; padding-bottom: 8px; font-weight: 500;">
        <span>IVA (16%):</span>
        <span style="color: #5d4037;">$${iva.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1.25rem; font-weight: 700; color: #3e2723; padding-top: 6px;">
        <span>Total:</span>
        <span style="color: #2e7d32;">$${total.toFixed(2)}</span>
      </div>
    `;
  }
  resumenModal.style.display = 'block';
}

function actualizarEstadoConfirmar(id, nombre) {
  inputIdFinal.value = id;
  clienteSeleccionadoNombre = nombre;
  btnConfirmarMesa.disabled = false;
  btnConfirmarMesa.style.opacity = '1';
  btnConfirmarMesa.style.cursor = 'pointer';
  btnConfirmarMesa.textContent = `Confirmar ${nombre} y Continuar`;
  listaResultados.style.display = 'none';
  formNuevo.style.display = 'none';
  // Restaurar las tarjetas de mesa
  const tableSect = document.querySelector('.client-table-select');
  if (tableSect) tableSect.style.display = '';
}

btnBuscar.addEventListener('click', async () => {
  const texto = inputBusqueda.value.trim();
  if (texto.length < 2) return alert('Escribe al menos 2 letras para buscar.');

  try {
    const res = await fetch(`${API_URL}/api/clientes/buscar?nombre=${encodeURIComponent(texto)}`);
    const clientes = await res.json();

    listaResultados.innerHTML = '';
    listaResultados.style.display = 'block';
    formNuevo.style.display = 'none';

    const divNuevo = document.createElement('div');
    divNuevo.className = 'add-client-btn-row';
    divNuevo.innerHTML = `<i class="fa-solid fa-circle-plus"></i> Registrar Nuevo Cliente`;
    divNuevo.onclick = () => {
      formNuevo.style.display = 'block';
      listaResultados.style.display = 'none';
      // Ocultar mesas para que el form aparezca en su lugar
      document.querySelector('.client-table-select').style.display = 'none';
      document.getElementById('nuevoNombreCliente').value = texto;
      document.getElementById('nuevoNombreCliente').focus();
    };
    listaResultados.appendChild(divNuevo);

    clientes.forEach(c => {
      const div = document.createElement('div');
      div.className = 'client-search-item';
      div.innerHTML = `<strong>${c.Nombre}</strong> <small>(${c.Email || 'Sin correo'})</small>`;
      div.onclick = () => actualizarEstadoConfirmar(c.IdCliente, c.Nombre);
      listaResultados.appendChild(div);
    });

  } catch (error) {
    console.error('Error buscando cliente:', error);
  }
});

btnCancelarRegistro.addEventListener('click', () => {
  formNuevo.style.display = 'none';
  document.querySelector('.client-table-select').style.display = '';
  document.getElementById('nuevoNombreCliente').value = '';
  document.getElementById('nuevoEmailCliente').value = '';
});

btnRegistrar.addEventListener('click', async () => {
  const nombre = document.getElementById('nuevoNombreCliente').value.trim();
  const email = document.getElementById('nuevoEmailCliente').value.trim();
  if (!nombre) return alert('El nombre es obligatorio.');
  if (!email) return alert('⚠️ El correo es obligatorio para nuevos clientes.');

  showLoader('Registrando cliente...');

  try {
    const res = await fetch(`${API_URL}/api/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email })
    });
    const data = await res.json();
    hideLoader();

    if (data.success) {
      // Mostrar mensaje de éxito en el modal antes de confirmar
      const btnRegistrarEl = document.getElementById('btnRegistrarCliente');
      btnRegistrarEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> ¡Registrado!';
      btnRegistrarEl.style.background = '#388e3c';
      setTimeout(() => {
        actualizarEstadoConfirmar(data.id, data.nombre);
        btnRegistrarEl.innerHTML = '<i class="fa-solid fa-check"></i> Registrar';
        btnRegistrarEl.style.background = '';
      }, 1200);
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    hideLoader();
    console.error(error);
  }
});

document.querySelectorAll('.mesa-card').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mesa-card').forEach(b => b.classList.remove('activa'));
    btn.classList.add('activa');
    const valor = btn.dataset.value;
    const label = btn.dataset.label;
    selectMesaRapida.value = valor;
    actualizarEstadoConfirmar(valor, label);
  });
});

btnConfirmarMesa.addEventListener('click', () => {
  if (inputIdFinal.value) {
    clienteInitModal.style.display = 'none';
    if (pedidoActual.length > 0) {
      cerrarYConfirmarButton.click();
    } else {
      alert(`✅ Cliente: ${clienteSeleccionadoNombre} seleccionado. Añade productos para finalizar.`);
    }
  }
});

btnSalirPedidos.addEventListener('click', () => {
  window.location.href = '../inicio/Inicio.html';
});

closeButton.addEventListener('click', () => cancelarPedidoYLimpiar());
seguirAgregandoButton.addEventListener('click', () => resumenModal.style.display = 'none');

window.addEventListener('click', (event) => {
  if (event.target === resumenModal) cancelarPedidoYLimpiar();
  if (event.target === addProductModal) addProductModal.style.display = 'none';
});

cerrarYConfirmarButton.addEventListener('click', async () => {
  if (pedidoActual.length === 0) {
    alert('El pedido está vacío.');
    resumenModal.style.display = 'none';
    return;
  }

  const idCliente = inputIdFinal.value;
  if (!idCliente) {
    alert('⚠️ Error: No hay cliente seleccionado.');
    resumenModal.style.display = 'none';
    clienteInitModal.style.display = 'flex';
    return;
  }

  let total = 0;
  const productosParaDB = pedidoActual.map(item => {
    const precio = parseFloat(item.precio.replace('Precio: $', '').trim());
    const subtotal = precio * item.cantidad;
    total += subtotal;
    return {
      id: item.idProducto,
      cantidad: item.cantidad,
      subtotal: parseFloat(subtotal.toFixed(2)),
      personalizado: item.personalizado
    };
  });

  const pedidoData = {
    idCliente: parseInt(idCliente, 10),
    idUsuario: parseInt(localStorage.getItem('usuarioId') || '1', 10),
    total: parseFloat(total.toFixed(2)),
    productos: productosParaDB,
    usuarioRol: localStorage.getItem('usuarioRol')
  };

  showLoader('Procesando pedido...');

  try {
    const response = await fetch(`${API_URL}/api/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedidoData)
    });
    const data = await response.json();
    hideLoader();

    if (response.ok && data.success) {
      alert(`✅ Pedido #${data.idPedido} guardado con éxito.`);
      cancelarPedidoYLimpiar(false);
    } else {
      alert(`❌ Error: ${data.message}`);
    }
  } catch (error) {
    hideLoader();
    console.error(error);
    alert('❌ Error de conexión.');
  }
});

document.getElementById('productsContainer').addEventListener('click', async (e) => {
  const target = e.target;
  const card = target.closest('.card');
  if (!card) return;

  // Si hacen clic en la tarjeta o su contenido directo (excluyendo controles de cantidad y botones ok/edit/delete)
  if (!target.closest('.cantidad-control') && !target.classList.contains('ok') && !target.classList.contains('edit') && !target.classList.contains('delete')) {
    const idProducto = parseInt(card.dataset.id, 10);
    abrirEditarRecetaModal(idProducto);
    return;
  }
if (target.classList.contains('ok')) {
  if (target.disabled) return;
  
  const idProducto = parseInt(card.dataset.id, 10);
  const cantidadInput = card.querySelector('.producto-cantidad');
  let cantidad = parseInt(cantidadInput.value, 10);
  if (isNaN(cantidad) || cantidad < 1) return alert('Cantidad inválida');

  const productObj = allProducts.find(p => p.IdProducto === idProducto);
  const esBebida = productObj && (productObj.Categoria === 'Bebidas' || (productObj.Categorium && productObj.Categorium.Nombre === 'Bebidas'));
//nuevo if bebida
if (esBebida) {
  const idCliente = document.getElementById('idClienteFinal').value;
  if (!idCliente) {
    alert('⚠️ Selecciona un cliente o mesa primero.');
    clienteInitModal.style.display = 'flex';
    return;
  }
  target.disabled = true;
  target.style.backgroundColor = '#ccc';
  target.style.cursor = 'default';
  await agregarUnidadesConPersonalizacion(productObj, cantidad);  // SIN EL 'add'
}

  else {
    // Producto normal (no bebida)
    const nombre = card.querySelector('.producto-nombre').textContent.trim();
    const precio = card.querySelector('.producto-precio').textContent.trim();
    const existente = pedidoActual.find(p => p.idProducto === idProducto);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      pedidoActual.push({ idProducto, nombre, precio, cantidad });
    }
    target.disabled = true;
    target.style.backgroundColor = '#ccc';
    target.style.cursor = 'default';
    mostrarResumenPedido();
  }
}
  
if (target.classList.contains('edit')) {
  const idProducto = parseInt(card.dataset.id, 10);
  const cantidadInput = card.querySelector('.producto-cantidad');
  let nuevaCantidad = parseInt(cantidadInput.value, 10);
  if (isNaN(nuevaCantidad) || nuevaCantidad < 1) return alert('Cantidad inválida');

  const productObj = allProducts.find(p => p.IdProducto === idProducto);
  const esBebida = productObj && (productObj.Categoria === 'Bebidas' || (productObj.Categorium && productObj.Categorium.Nombre === 'Bebidas'));

  if (esBebida) {
    // Buscar TODOS los índices de ítems con este idProducto
    const indicesAEliminar = [];
    pedidoActual.forEach((item, idx) => {
      if (item.idProducto === idProducto && item.personalizado) {
        indicesAEliminar.push(idx);
      }
    });
    
    if (indicesAEliminar.length === 0) {
      alert('Este producto no está en el pedido. Agrégalo primero con ✔');
      return;
    }
    
    // Eliminar TODOS los ítems encontrados (de atrás hacia adelante para no afectar índices)
    for (let i = indicesAEliminar.length - 1; i >= 0; i--) {
      pedidoActual.splice(indicesAEliminar[i], 1);
    }
    
    // Guardar referencia al botón OK de la tarjeta
    const okButton = card.querySelector('.ok');
    if (okButton) {
      okButton.disabled = true;
      okButton.style.backgroundColor = '#ccc';
      okButton.style.cursor = 'default';
    }
    
    // Llamar a la función en modo 'add' (agregar los nuevos)
    await agregarUnidadesConPersonalizacion(productObj, nuevaCantidad, 'add');
  } else {
    const existente = pedidoActual.find(p => p.idProducto === idProducto);
    if (existente) {
      existente.cantidad = nuevaCantidad;
      mostrarResumenPedido();
      alert('Cantidad actualizada.');
    } else {
      alert('Producto no añadido aún. Usa ✔ primero.');
    }
  }
}


  if (target.classList.contains('delete')) {
    const idProducto = parseInt(card.dataset.id, 10);
    const index = pedidoActual.findIndex(p => p.idProducto === idProducto);

    if (index !== -1) {
      pedidoActual.splice(index, 1);
      mostrarResumenPedido();
      alert('Eliminado del pedido.');
      const okButton = card.querySelector('.ok');
      if (okButton) {
        okButton.disabled = false;
        okButton.style.backgroundColor = '';
        okButton.style.cursor = 'pointer';
      }
    } else {
      alert('Este producto no está en el pedido.');
    }
  }
});

async function cargarInsumosSistema() {
  try {
    const res = await fetch(`${API_URL}/api/inventario/insumos`);
    listaInsumosGlobal = await res.json();
  } catch (e) { console.error('Error cargando insumos', e); }
}

function agregarFilaIngrediente() {
  const div = document.createElement('div');
  div.className = 'fila-ingrediente';
  div.style.cssText = 'display:flex; gap:10px; margin-bottom:8px;';

  let opciones = '<option value="">-- Insumo --</option>';
  listaInsumosGlobal.forEach(insumo => {
    opciones += `<option value="${insumo.IdInventario}">${insumo.NombreProducto}</option>`;
  });

  div.innerHTML = `
    <select class="sel-insumo" style="flex:2; padding:5px; border:1px solid #ccc; border-radius:4px;">${opciones}</select>
    <input type="number" class="inp-cantidad" placeholder="Cant. (ej: 0.250)" step="0.001"
      style="flex:1; padding:5px; border:1px solid #ccc; border-radius:4px;">
    <button type="button" onclick="this.parentElement.remove()"
      style="background:#dc3545; color:white; border:none; border-radius:4px; padding:0 10px; cursor:pointer;">&times;</button>
  `;
  document.getElementById('listaIngredientesContainer').appendChild(div);
}

if (btnAddProduct) {
  btnAddProduct.addEventListener('click', async () => {
    addProductModal.style.display = 'block';
    if (listaInsumosGlobal.length === 0) await cargarInsumosSistema();

    document.getElementById('listaIngredientesContainer').innerHTML = '';
    agregarFilaIngrediente();

    if (categorySelect && categorySelect.options.length <= 1) {
      try {
        const res = await fetch(`${API_URL}/api/menu/categorias`);
        if (res.ok) {
          const cats = await res.json();
          categorySelect.innerHTML = '<option value="">Seleccione...</option>';
          cats.forEach(c => {
            const op = document.createElement('option');
            op.value = c.IdCategoria;
            op.textContent = c.Nombre;
            categorySelect.appendChild(op);
          });
        }
      } catch (e) { console.error(e); }
    }
  });
}

if (btnCloseAdd) btnCloseAdd.addEventListener('click', () => addProductModal.style.display = 'none');

document.getElementById('btnAgregarIngrediente')
  ?.addEventListener('click', agregarFilaIngrediente);

if (formAdd) {
  formAdd.addEventListener('submit', async (e) => {
    e.preventDefault();

    const productoData = {
      Nombre: document.getElementById('newProdName').value,
      Descripcion: document.getElementById('newProdDesc').value,
      Precio: parseFloat(document.getElementById('newProdPrice').value),
      Stock: parseInt(document.getElementById('newProdStock').value),
      IdCategoria: parseInt(document.getElementById('newProdCategory').value),
      Imagen: document.getElementById('newProdImage').value,
      Receta: []
    };

    document.querySelectorAll('.fila-ingrediente').forEach(row => {
      const idInsumo = row.querySelector('.sel-insumo').value;
      const cantidad = row.querySelector('.inp-cantidad').value;
      if (idInsumo && cantidad) {
        productoData.Receta.push({
          IdInventario: parseInt(idInsumo),
          CantidadInsumo: parseFloat(cantidad)
        });
      }
    });

    try {
      const res = await fetch(`${API_URL}/api/inventario/productos-con-receta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productoData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert('✅ Producto guardado correctamente.');
        addProductModal.style.display = 'none';
        formAdd.reset();
        loadProducts();
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    }
  });
}

const modalQuick = document.getElementById('modalQuickInsumo');
const btnAbrirQuick = document.getElementById('btnAbrirCrearInsumo');
const formQuick = document.getElementById('formQuickInsumo');

if (btnAbrirQuick) {
  btnAbrirQuick.addEventListener('click', (e) => {
    e.preventDefault();
    modalQuick.style.display = 'flex';
  });
}

if (formQuick) {
  formQuick.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevoInsumo = {
      nombre: document.getElementById('qi_nombre').value,
      categoria: parseInt(document.getElementById('qi_categoria').value),
      cantidad: parseFloat(document.getElementById('qi_cantidad').value),
      imagen: document.getElementById('qi_imagen').value || 'https://via.placeholder.com/150'
    };

    try {
      const res = await fetch(`${API_URL}/api/inventario/nuevo-insumo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoInsumo)
      });

      if (res.ok) {
        alert('✅ Ingrediente creado.');
        modalQuick.style.display = 'none';
        formQuick.reset();
        await cargarInsumosSistema();
        actualizarSelectsAbiertos();
      } else {
        alert('Error al guardar');
      }
    } catch (error) { console.error(error); }
  });
}

function actualizarSelectsAbiertos() {
  let nuevasOpciones = '<option value="">-- Insumo --</option>';
  listaInsumosGlobal.forEach(insumo => {
    nuevasOpciones += `<option value="${insumo.IdInventario}">${insumo.NombreProducto}</option>`;
  });

  document.querySelectorAll('.sel-insumo').forEach(select => {
    const valorActual = select.value;
    select.innerHTML = nuevasOpciones;
    select.value = valorActual;
  });
}

// ==========================================
// FUNCIONALIDAD DE PERSONALIZACIÓN DE BEBIDAS
// ==========================================

const personalizadoModal = document.getElementById('personalizadoModal');
const btnClosePersonalizado = document.getElementById('btnClosePersonalizado');
const btnCancelarPersonalizado = document.getElementById('btnCancelarPersonalizado');
const formPersonalizado = document.getElementById('formPersonalizado');

// Manejar los botones de cantidad de Shots de espresso
document.querySelectorAll('.shot-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.shot-btn').forEach(b => {
      b.classList.remove('active');
      b.style.border = '2px solid #eae1db';
      b.style.background = 'white';
      b.style.color = '#795548';
    });
    btn.classList.add('active');
    btn.style.border = '2px solid #8d6e63';
    btn.style.background = '#efebe9';
    btn.style.color = '#5d4037';
    document.getElementById('persShots').value = btn.dataset.value;
  });
});

// Cerrar modal de personalización
if (btnClosePersonalizado) {
  btnClosePersonalizado.addEventListener('click', () => {
    personalizadoModal.style.display = 'none';
  });
}

if (btnCancelarPersonalizado) {
  btnCancelarPersonalizado.addEventListener('click', () => {
    personalizadoModal.style.display = 'none';
  });
}

// Cerrar al hacer clic fuera del modal
window.addEventListener('click', (event) => {
  if (event.target === personalizadoModal) {
    personalizadoModal.style.display = 'none';
  }
});

// Enviar el pedido personalizado al backend
// Enviar el pedido personalizado al backend (MODIFICADO PARA PROMESAS)
if (formPersonalizado) {
  formPersonalizado.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!pendingPersonalizationResolver) return;

    const tipoLeche = document.getElementById('persLeche').value;
    const shots = parseInt(document.getElementById('persShots').value, 10);
    let descLeche = 'Sin leche';
    if (tipoLeche !== 'Sin Leche') {
      const milkOption = document.querySelector('#persLeche option:checked');
      descLeche = milkOption ? `Leche: ${milkOption.textContent.trim()}` : 'Leche';
    }
    const descShots = shots === 0 ? 'Sin espresso' : `${shots} Shot(s)`;
    const nombreCustomizado = `${document.getElementById('persNombreProducto').textContent} (${descLeche}, ${descShots})`;

    pendingPersonalizationResolver({
      tipoLeche,
      shots,
      nombreCustomizado
    });
    document.getElementById('personalizadoModal').style.display = 'none';
    pendingPersonalizationResolver = null;
  });
}

function rechazarPersonalizacion() {
  if (pendingPersonalizationRejecter) {
    pendingPersonalizationRejecter(new Error('cancelado'));
    pendingPersonalizationRejecter = null;
  }
  document.getElementById('personalizadoModal').style.display = 'none';
}

// Asociar a los botones de cierre (busca estos elementos o agrégalos si no existen)
document.getElementById('btnClosePersonalizado')?.addEventListener('click', rechazarPersonalizacion);
document.getElementById('btnCancelarPersonalizado')?.addEventListener('click', rechazarPersonalizacion);

// ==========================================
// FUNCIONALIDAD DE EDICIÓN DE RECETA EN VIVO
// ==========================================

const recetaModal = document.getElementById('recetaModal');
const btnCloseReceta = document.getElementById('btnCloseReceta');
const btnCancelarReceta = document.getElementById('btnCancelarReceta');
const btnRecetaAgregarIngrediente = document.getElementById('btnRecetaAgregarIngrediente');
const formReceta = document.getElementById('formReceta');

async function abrirEditarRecetaModal(idProducto) {
  const productObj = allProducts.find(p => p.IdProducto === idProducto);
  if (!productObj) return;

  showLoader('Cargando receta...');

  const recetaNombreProducto = document.getElementById('recetaNombreProducto');
  const recetaIngredientesContainer = document.getElementById('recetaIngredientesContainer');

  recetaNombreProducto.textContent = productObj.Nombre;
  recetaNombreProducto.dataset.id = idProducto;

  // Cargar insumos globales si aún no están cargados
  if (listaInsumosGlobal.length === 0) {
    await cargarInsumosSistema();
  }

  // Limpiar contenedor de ingredientes
  recetaIngredientesContainer.innerHTML = '<p style="padding:15px; text-align:center; color:#8d6e63; font-style:italic;">Cargando receta del producto...</p>';

  try {
    const res = await fetch(`${API_URL}/api/inventario/productos/${idProducto}/receta`);
    hideLoader();

    if (!res.ok) throw new Error('Error al cargar la receta');
    const receta = await res.json();

    recetaIngredientesContainer.innerHTML = '';
    if (receta.length === 0) {
      agregarFilaIngredienteReceta(); // Fila vacía inicial si no tiene ingredientes
    } else {
      receta.forEach(ingrediente => {
        agregarFilaIngredienteReceta(ingrediente.IdInventario, ingrediente.CantidadInsumo);
      });
    }
  } catch (err) {
    hideLoader();
    console.error(err);
    recetaIngredientesContainer.innerHTML = '<p style="color:#e53935; text-align:center; padding:15px;">❌ Error al cargar la receta.</p>';
  }

  recetaModal.style.display = 'flex';
}
//funcion 
function abrirModalPersonalizacionConPromesa(producto, valoresActuales = null) {
  return new Promise((resolve, reject) => {
    const modal = document.getElementById('personalizadoModal');
    const persNombreProducto = document.getElementById('persNombreProducto');
    const persLeche = document.getElementById('persLeche');
    const persShotsInput = document.getElementById('persShots');

    persNombreProducto.textContent = producto.Nombre;
    persNombreProducto.dataset.id = producto.IdProducto;

    if (valoresActuales) {
      persLeche.value = valoresActuales.tipoLeche || 'Sin Leche';
      persShotsInput.value = valoresActuales.shots || 1;
      // Resaltar botón de shots
      document.querySelectorAll('.shot-btn').forEach(btn => {
        const val = parseInt(btn.dataset.value);
        if (val === (valoresActuales.shots || 1)) {
          btn.classList.add('active');
          btn.style.border = '2px solid #8d6e63';
          btn.style.background = '#efebe9';
          btn.style.color = '#5d4037';
        } else {
          btn.classList.remove('active');
          btn.style.border = '2px solid #eae1db';
          btn.style.background = 'white';
          btn.style.color = '#795548';
        }
      });
    } else {
      persLeche.value = 'Sin Leche';
      persShotsInput.value = '1';
      document.querySelectorAll('.shot-btn').forEach(btn => {
        if (btn.dataset.value === '1') {
          btn.classList.add('active');
          btn.style.border = '2px solid #8d6e63';
          btn.style.background = '#efebe9';
          btn.style.color = '#5d4037';
        } else {
          btn.classList.remove('active');
          btn.style.border = '2px solid #eae1db';
          btn.style.background = 'white';
          btn.style.color = '#795548';
        }
      });
    }

    pendingPersonalizationResolver = resolve;
    pendingPersonalizationRejecter = reject;
    modal.style.display = 'flex';
  });
}


async function agregarUnidadesConPersonalizacion(producto, cantidad) {
  for (let i = 0; i < cantidad; i++) {
    try {
      const personalizacion = await abrirModalPersonalizacionConPromesa(producto);
      const precioFormat = `Precio: $${producto.Precio}`;
      pedidoActual.push({
        idProducto: producto.IdProducto,
        nombre: personalizacion.nombreCustomizado,
        precio: precioFormat,
        cantidad: 1,
        personalizado: { tipoLeche: personalizacion.tipoLeche, shots: personalizacion.shots }
      });
    } catch (err) {
      // Usuario canceló, salir del bucle
      break;
    }
  }
  mostrarResumenPedido();
}


function agregarFilaIngredienteReceta(idInsumo = '', cantidad = '') {
  const div = document.createElement('div');
  div.className = 'fila-ingrediente-receta';
  div.style.cssText = 'display:flex; gap:10px; margin-bottom:8px; align-items:center;';

  let opciones = '<option value="">-- Seleccionar Insumo --</option>';
  listaInsumosGlobal.forEach(insumo => {
    const seleccionado = parseInt(insumo.IdInventario, 10) === parseInt(idInsumo, 10) ? 'selected' : '';
    opciones += `<option value="${insumo.IdInventario}" ${seleccionado}>${insumo.NombreProducto}</option>`;
  });

  div.innerHTML = `
    <select class="sel-insumo-receta" style="flex:2; padding:10px; border:2.5px solid #eae1db; border-radius:8px; outline:none; font-family:inherit; color:#3e2723; background:#fafafa;">${opciones}</select>
    <input type="number" class="inp-cantidad-receta" placeholder="Cant. (kg/l)" step="0.001" min="0" value="${cantidad}" required
      style="flex:1; padding:10px; border:2.5px solid #eae1db; border-radius:8px; outline:none; text-align:center; font-family:inherit; box-sizing:border-box; color:#3e2723; background:#fafafa;">
    <button type="button" class="btn-eliminar-fila-receta"
      style="background:#e53935; color:white; border:none; border-radius:8px; width:38px; height:38px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:1.4rem; font-weight:bold; outline:none; transition:all 0.2s;">&times;</button>
  `;

  div.querySelector('.btn-eliminar-fila-receta').addEventListener('click', () => div.remove());

  document.getElementById('recetaIngredientesContainer').appendChild(div);
}


// Evento para agregar filas vacías en el modal de receta
if (btnRecetaAgregarIngrediente) {
  btnRecetaAgregarIngrediente.addEventListener('click', () => {
    agregarFilaIngredienteReceta();
  });
}

// Cerrar modal de receta
if (btnCloseReceta) {
  btnCloseReceta.addEventListener('click', () => {
    recetaModal.style.display = 'none';
  });
}

if (btnCancelarReceta) {
  btnCancelarReceta.addEventListener('click', () => {
    recetaModal.style.display = 'none';
  });
}

// Cerrar al hacer clic fuera del modal de receta
window.addEventListener('click', (event) => {
  if (event.target === recetaModal) {
    recetaModal.style.display = 'none';
  }
});

// Guardar la receta editada
if (formReceta) {
  formReceta.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idProducto = parseInt(document.getElementById('recetaNombreProducto').dataset.id, 10);
    const recetaIngredientes = [];

    document.querySelectorAll('.fila-ingrediente-receta').forEach(row => {
      const idInsumo = row.querySelector('.sel-insumo-receta').value;
      const cantidad = row.querySelector('.inp-cantidad-receta').value;
      if (idInsumo && cantidad) {
        recetaIngredientes.push({
          IdInventario: parseInt(idInsumo, 10),
          CantidadInsumo: parseFloat(cantidad)
        });
      }
    });

    showLoader('Guardando receta...');

    try {
      const res = await fetch(`${API_URL}/api/inventario/productos/${idProducto}/receta`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Receta: recetaIngredientes })
      });

      const data = await res.json();
      hideLoader();

      if (res.ok && data.success) {
        alert('✅ Receta actualizada correctamente en la base de datos.');
        recetaModal.style.display = 'none';
      } else {
        alert('❌ Error al actualizar la receta: ' + data.message);
      }
    } catch (err) {
      hideLoader();
      console.error(err);
      alert('❌ Error de conexión al guardar la receta.');
    }
  });
}*/