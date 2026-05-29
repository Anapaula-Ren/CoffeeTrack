const API_URL = 'http://localhost:3000';
// =============================================
// VALIDACIÓN DE ROLES PARA OCULTAR ENLACES
// =============================================
const userRole = localStorage.getItem('usuarioRol');

// Ocultar enlaces según el rol (esto debe ejecutarse inmediatamente)
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
}
// =============================================

const MAPA_IMAGENES_DEFAULT = {
  // Bebidas
  "café molido": "imagenes/cafe_molido.jpeg",
  "leche entera": "imagenes/leche_entera.jpg",
  "leche deslactosada": "imagenes/leche_deslactosada.jpg",
  "leche de almendras": "imagenes/leche_almendra.jpg",
  "azúcar estándar": "imagenes/azucar_estandar.jpg",
  "stevia": "imagenes/stevia.jpeg",
  "jarabe de vainilla": "imagenes/jarabe_vainilla.jpg",
  "jarabe de chocolate": "imagenes/jarabe_chocolate.jpg",
  "té negro": "imagenes/te_negro.jpg",
  "agua": "imagenes/agua.jpg",
  "crema para batir": "imagenes/crema_para_batir.jpg",
  "canela molida": "imagenes/canela_molida.jpg",

  // Comidas
  "sandwich de jamón y queso": "imagenes/sandwich_jamon_queso.jpg",
  "wrap de pollo": "imagenes/wrap_pollo.jpg",
  "croissant": "imagenes/croissant.jpg",
  "muffin": "imagenes/muffin.jpg",
  "brownie": "imagenes/brownie.jpg",
  "dona": "imagenes/dona.jpg",

  // Envases
  "bebida caliente": "imagenes/vaso_caliente.jpg",
  "bebida fría": "imagenes/vaso_frio.jpg",
  "servilletas": "imagenes/servilletas.jpg",
  "manga aislante": "imagenes/manga_aislante.jpg",
  "popotes": "imagenes/popotes.jpg",

  // Limpieza
  "bolsa de basura": "imagenes/bolsa_basura.jpg",
  "esponja": "imagenes/esponja.jpg",
  "desinfectante": "imagenes/desinfectante.jpg",
  "microfibra": "imagenes/microfibra.jpg"
};

function renderizarProductos(productos) {
  const contenedor = document.querySelector('.inventario');
  if (!contenedor) return;

  contenedor.innerHTML = ''; // Limpiar el contenedor estático o previo

  if (productos.length === 0) {
    contenedor.innerHTML = `
      <div class="sin-productos" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #a1887f;">
        <i class="fa-solid fa-box-open" style="font-size: 48px; margin-bottom: 12px; display: block; opacity: 0.6;"></i>
        <p style="font-size: 18px; font-weight: 500;">No hay productos en esta categoría</p>
        <p style="font-size: 14px; opacity: 0.8; margin-top: 4px;">Usa el botón "Agregar Producto" en la parte superior para añadir uno nuevo.</p>
      </div>
    `;
    return;
  }

  const rol = localStorage.getItem('usuarioRol');
  const esCajero = rol === 'Cajero/Mesero';

  productos.forEach(prod => {
    const nombre = prod.NombreProducto;
    const cantidad = parseFloat(prod.Cantidad) || 0;

    // Obtener la imagen correcta
    let imagenUrl = prod.ImagenUrl;
    if (!imagenUrl) {
      const nombreNorm = nombre?.trim().toLowerCase();
      imagenUrl = MAPA_IMAGENES_DEFAULT[nombreNorm] || '';
    }

    const imgHTML = imagenUrl
      ? `<img src="${imagenUrl}" alt="${nombre}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
         <div class="producto-sin-imagen" style="display:none"><i class="fa-solid fa-box"></i></div>`
      : `<div class="producto-sin-imagen"><i class="fa-solid fa-box"></i></div>`;

    const div = document.createElement('div');
    div.className = 'producto producto-visible';
    div.innerHTML = `
      <h3 class="nombre_del_producto">${nombre}</h3>
      ${imgHTML}
      <p>Cantidad: <input type="number" readonly class="cantidad_producto" value="${cantidad}"></p>
      <div class="botones">
        <button class="btn_editar" title="Editar cantidad"><i class="fa-solid fa-pencil"></i></button>
        <button class="btn_ordenar" title="Ordenar"><i class="fa-solid fa-plus"></i></button>
        <button class="btn_eliminar" title="Eliminar producto"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    contenedor.appendChild(div);

    // Configurar listeners individuales
    const btnEditar = div.querySelector('.btn_editar');
    const btnOrdenar = div.querySelector('.btn_ordenar');
    const btnEliminar = div.querySelector('.btn_eliminar');

    if (esCajero) {
      [btnEditar, btnOrdenar, btnEliminar].forEach(btn => {
        if (btn) {
          btn.disabled = true;
          btn.style.opacity = '0.4';
          btn.style.cursor = 'not-allowed';
          btn.onclick = (e) => {
            e.stopPropagation();
            alert('Acceso de modificación restringido al rol de Cajero/Mesero');
          };
        }
      });
    } else {
      if (btnEditar) btnEditar.onclick = () => { productoActual = div; abrirModal(nombre); };
      if (btnOrdenar) btnOrdenar.onclick = () => abrirModalOrdenar(nombre);
      if (btnEliminar) btnEliminar.onclick = () => abrirModalEliminar(nombre, div);
    }
  });

  // Re-enlazar listeners globales
  document.getElementById('btnReporteInventario')?.replaceWith(
    document.getElementById('btnReporteInventario').cloneNode(true)
  );
  document.getElementById('btnReporteInventario')
    ?.addEventListener('click', abrirModalReporte);
}

const modal = document.getElementById('modal_editar');
const spanCerrar = document.getElementsByClassName('cerrar')[0];
const btnCancelar = document.querySelector('.btn_cancelar');
const formModal = document.getElementById('form_modal');
const inputNombreProducto = document.getElementById('nombre_producto');
const cantidadTotalInput = document.getElementById('cantidad_total');
const contenedorInventario = document.querySelector('.inventario');

const ordenModal = document.getElementById('ordenModal');
const closeButton = ordenModal?.querySelector('.close-button');
const ordenForm = document.getElementById('ordenForm');
const productoTitulo = document.getElementById('productoTitulo');
const ordenProductoNombre = document.getElementById('ordenProductoNombre');
const ordenDestinoInput = document.getElementById('ordenDestino');

let productoActual = null;
let productoNombreActual = null;

function configurarRestriccionesPorRol() {
  const rol = localStorage.getItem('usuarioRol');
  console.log(`🔐 Rol detectado: ${rol}`);

  if (!rol) {
    console.warn('⚠️ No se encontró rol de usuario');
    return;
  }

  const usuariosLink = document.getElementById('linkUsuarios');
  const btnReporteInventario = document.getElementById('btnReporteInventario');

  if (rol === 'Administrador') {
    if (usuariosLink) usuariosLink.style.display = 'inline-block';
    if (btnReporteInventario) btnReporteInventario.style.display = 'block';

  } else if (rol === 'Encargado de inventario') {
    if (usuariosLink) usuariosLink.style.display = 'none';
    if (btnReporteInventario) btnReporteInventario.style.display = 'block';

  } else if (rol === 'Cajero/Mesero') {
    if (usuariosLink) usuariosLink.style.display = 'none';
    if (btnReporteInventario) btnReporteInventario.style.display = 'none';
  }
}

function deshabilitarFuncionesInventario() {
  const rol = localStorage.getItem('usuarioRol');
  const rolesNoPermitidos = ['Cajero/Mesero'];

  if (rolesNoPermitidos.includes(rol)) {
    document.querySelectorAll('.btn_editar, .btn_ordenar').forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.4';
      btn.style.cursor = 'not-allowed';
      btn.onclick = (e) => {
        e.stopPropagation();
        alert('Acceso de modificación restringido al rol de ' + rol);
      };
    });
    return true;
  }
  return false;
}

function obtenerCategoriaActual() {
  const nombreArchivo = window.location.pathname.split('/').pop();

  const mapeoCategorias = {
    'inventario_bebidas.html': 1,
    'inventario_comidas.html': 2,
    'inventario_envases.html': 3,
    'inventario_limpieza.html': 4,
    'inventario_menu.html': 1
  };

  return mapeoCategorias[nombreArchivo] || 1;
}

async function cargarProductos() {
  try {
    const categoriaId = obtenerCategoriaActual();
    console.log(`🔍 Cargando productos de categoría ${categoriaId}...`);

    const response = await fetch(`${API_URL}/api/inventario/categoria/${categoriaId}`);

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const productos = await response.json();
    console.log(`✅ ${productos.length} productos recibidos`);

    renderizarProductos(productos);

  } catch (error) {
    console.error('❌ Error al cargar productos:', error);
    mostrarErrorCarga(error);
  }
}

async function obtenerIdProducto(nombreProducto) {
  try {
    const categoriaId = obtenerCategoriaActual();
    const response = await fetch(`${API_URL}/api/inventario/categoria/${categoriaId}`);
    const productos = await response.json();

    const producto = productos.find(p =>
      p.NombreProducto?.trim().toLowerCase() === nombreProducto.trim().toLowerCase()
    );

    return producto ? producto.IdInventario : null;

  } catch (error) {
    console.error('Error al obtener ID del producto:', error);
    return null;
  }
}

async function obtenerConfiguracionProducto(idProducto) {
  try {
    const response = await fetch(`${API_URL}/api/inventario/producto/${idProducto}`);

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const data = await response.json();

    if (data.success) {
      return {
        id: data.producto.IdInventario,
        nombre: data.producto.NombreProducto,
        cantidadActual: parseFloat(data.producto.Cantidad) || 0
      };
    } else {
      throw new Error(data.message);
    }

  } catch (error) {
    console.error('❌ Error al obtener configuración:', error);
    alert('Error al cargar los datos del producto');
    return null;
  }
}

async function abrirModal(nombreProducto) {
  try {
    const idProducto = await obtenerIdProducto(nombreProducto);
    if (!idProducto) {
      alert('Error: No se encontró el producto en la base de datos');
      return;
    }

    const config = await obtenerConfiguracionProducto(idProducto);
    if (!config) {
      alert('No se pudieron cargar los datos del producto');
      return;
    }

    productoNombreActual = nombreProducto;
    inputNombreProducto.value = config.nombre;
    cantidadTotalInput.value = config.cantidadActual;

    setTimeout(() => {
      cantidadTotalInput.focus();
      cantidadTotalInput.select();
    }, 100);

    modal.style.display = 'flex';

  } catch (error) {
    console.error('❌ Error al abrir modal:', error);
    alert('Error al abrir el editor: ' + error.message);
  }
}

async function actualizarProducto(nombreProducto, nuevaCantidad) {
  try {
    const idProducto = await obtenerIdProducto(nombreProducto);
    if (!idProducto) {
      alert('Error: No se encontró el producto en la base de datos');
      return;
    }

    showLoader('Actualizando inventario...');

    const response = await fetch(`${API_URL}/api/inventario/producto/${idProducto}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidad: nuevaCantidad })
    });

    const data = await response.json();
    hideLoader();

    if (data.success) {
      if (productoActual) {
        const inputCantidad = productoActual.querySelector('.cantidad_producto');
        if (inputCantidad) inputCantidad.value = nuevaCantidad;
      }
      cerrarModal();
      alert('¡Inventario actualizado correctamente!');
    } else {
      throw new Error(data.message || 'Error al actualizar el producto');
    }

  } catch (error) {
    hideLoader();
    console.error('❌ Error al actualizar producto:', error);
    alert('Error al actualizar el producto: ' + error.message);
  }
}

function cerrarModal() {
  modal.style.display = 'none';
  productoNombreActual = null;
  productoActual = null;
  formModal.reset();
}

async function cargarReporteInventario() {
  try {
    const response = await fetch(`${API_URL}/api/inventario/vistas/inventario-completo`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const inventario = await response.json();
    generarHTMLReporte(inventario);

  } catch (error) {
    console.error('❌ Error al cargar reporte:', error);
    mostrarErrorReporte(error);
  }
}

function generarHTMLReporte(inventario) {
  const tabla = document.getElementById('tablaReporteInventario');
  if (!tabla) return;

  inventario.sort((a, b) => (parseInt(a.ID) || 0) - (parseInt(b.ID) || 0));

  tabla.innerHTML = `
    <div class="reporte-header">
      <h3>Todos los Productos</h3>
      <button id="btnStockBajo" class="btn-stock-bajo">
        <i class="fas fa-exclamation-triangle"></i> Ver Stock Bajo
      </button>
    </div>
    <div class="tabla-contenedor">
      <table class="detail-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          ${inventario.map(item => `
            <tr>
              <td>${item.ID || 'N/A'}</td>
              <td>${item.Nombre || 'Sin nombre'}</td>
              <td>${item.Categoria}</td>
              <td>${parseFloat(item.Cantidad) || 0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('btnStockBajo')
    ?.addEventListener('click', cargarStockBajo);
}

async function cargarStockBajo() {
  try {
    const response = await fetch(`${API_URL}/api/inventario/vistas/stock-critico`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const stockBajo = await response.json();

    if (stockBajo.length === 0) {
      mostrarMensajeSinStockBajo();
    } else {
      generarHTMLStockBajo(stockBajo);
    }

  } catch (error) {
    console.error('❌ Error al cargar stock bajo:', error);
    mostrarErrorReporte(error);
  }
}

function generarHTMLStockBajo(stockBajo) {
  const tabla = document.getElementById('tablaReporteInventario');
  if (!tabla) return;

  tabla.innerHTML = `
    <div class="reporte-header">
      <h3 style="color: #dc3545;">
        <i class="fas fa-exclamation-triangle"></i> Productos con Stock Bajo
      </h3>
      <button id="btnTodosProductos" class="btn-todos-productos">
        <i class="fas fa-list"></i> Ver Todos
      </button>
    </div>
    <div class="tabla-contenedor">
      <table class="detail-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Cantidad</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${stockBajo.map(item => `
            <tr>
              <td>${item.ID || 'N/A'}</td>
              <td>${item.Nombre || 'Sin nombre'}</td>
              <td>${item.Categoria}</td>
              <td>${parseFloat(item.Cantidad) || 0}</td>
              <td class="${item.Estado === 'CRÍTICO' ? 'estado-critico' : 'estado-bajo'}">
                ${item.Estado || 'BAJO'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div class="alerta-stock">
      <i class="fas fa-info-circle"></i>
      <strong>Total:</strong> ${stockBajo.length} producto(s) con stock bajo
    </div>
  `;

  document.getElementById('btnTodosProductos')
    ?.addEventListener('click', cargarReporteInventario);
}

function mostrarMensajeSinStockBajo() {
  const tabla = document.getElementById('tablaReporteInventario');
  if (!tabla) return;

  tabla.innerHTML = `
    <div class="mensaje-exito">
      <i class="fas fa-check-circle"></i>
      <h3>¡Excelente!</h3>
      <p>No hay productos con stock bajo</p>
      <button onclick="cargarReporteInventario()" class="btn-todos-productos">
        <i class="fas fa-list"></i> Ver Todos los Productos
      </button>
    </div>
  `;
}

function mostrarErrorReporte(error) {
  const tabla = document.getElementById('tablaReporteInventario');
  if (!tabla) return;

  tabla.innerHTML = `
    <div style="color: red; text-align: center; padding: 20px;">
      <h3>Error al cargar el reporte</h3>
      <p>${error.message}</p>
      <button onclick="cargarReporteInventario()" class="btn-reportes">
        Reintentar
      </button>
    </div>
  `;
}

function abrirModalReporte() {
  const modalReporte = document.getElementById('modalReporteInventario');
  if (modalReporte) {
    modalReporte.style.display = 'flex';
    cargarReporteInventario();
  }
}

function cerrarModalReporte() {
  const modalReporte = document.getElementById('modalReporteInventario');
  if (modalReporte) modalReporte.style.display = 'none';
}

function abrirModalOrdenar(nombreProducto) {
  if (productoTitulo && ordenProductoNombre) {
    productoTitulo.textContent = nombreProducto;
    ordenProductoNombre.value = nombreProducto;
    document.getElementById('ordenCantidad').value = 1;
    document.getElementById('ordenMotivo').value = '';
    ordenModal.style.display = 'flex';
  }
}

async function enviarOrdenCorreo(orderData) {
  showLoader('Enviando orden de compra...');
  try {
    const response = await fetch(`${API_URL}/api/inventario/ordenar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();
    hideLoader();

    if (response.ok && data.success) {
      alert(`✅ ${data.message}`);
      ordenModal.style.display = 'none';
    } else {
      alert(`❌ Error al enviar orden: ${data.message || 'Error desconocido'}`);
    }

  } catch (error) {
    hideLoader();
    console.error('Error al enviar orden:', error);
    alert('❌ Error de conexión. Verifique el servidor.');
  }
}

function cerrarModalOrdenar() {
  ordenModal.style.display = 'none';
}

// =============================================
//  AGREGAR PRODUCTO
// =============================================
function abrirModalAgregar() {
  const modalAgregar = document.getElementById('modalAgregarProducto');
  if (modalAgregar) {
    document.getElementById('formAgregarProducto').reset();
    resetearPrevisualizacion();
    modalAgregar.style.display = 'flex';
    setTimeout(() => document.getElementById('nuevoNombreProducto').focus(), 100);
  }
}

function cerrarModalAgregar() {
  const modalAgregar = document.getElementById('modalAgregarProducto');
  if (modalAgregar) {
    modalAgregar.style.display = 'none';
    document.getElementById('formAgregarProducto').reset();
    resetearPrevisualizacion();
  }
}

function resetearPrevisualizacion() {
  const prev = document.getElementById('previewImagen');
  const wrap = document.getElementById('previewWrap');
  if (prev) prev.src = '';
  if (wrap) wrap.style.display = 'none';
}

async function crearNuevoProducto(nombre, cantidad, imagenUrl) {
  const categoriaId = obtenerCategoriaActual();
  showLoader('Agregando producto...');
  try {
    const response = await fetch(`${API_URL}/api/inventario/producto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        IdCategoriaInventario: categoriaId,
        NombreProducto: nombre,
        Cantidad: cantidad,
        ImagenUrl: imagenUrl || null
      })
    });

    const data = await response.json();
    hideLoader();

    if (data.success) {
      cerrarModalAgregar();
      mostrarToast(`✅ "${nombre}" agregado al inventario`);
      cargarProductos();
    } else {
      throw new Error(data.message || 'Error al crear el producto');
    }
  } catch (error) {
    hideLoader();
    console.error('❌ Error al crear producto:', error);
    alert('Error al crear el producto: ' + error.message);
  }
}

function agregarTarjetaProducto(nombre, cantidad, imagenUrl) {
  const contenedor = document.querySelector('.inventario');
  if (!contenedor) return;

  const imgHTML = imagenUrl
    ? `<img src="${imagenUrl}" alt="${nombre}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div class="producto-sin-imagen" style="display:none"><i class="fa-solid fa-box"></i></div>`
    : `<div class="producto-sin-imagen"><i class="fa-solid fa-box"></i></div>`;

  const div = document.createElement('div');
  div.className = 'producto producto-nuevo';
  div.innerHTML = `
    <h3 class="nombre_del_producto">${nombre}</h3>
    ${imgHTML}
    <p>Cantidad: <input type="number" readonly class="cantidad_producto" value="${cantidad}"></p>
    <div class="botones">
      <button class="btn_editar" title="Editar cantidad"><i class="fa-solid fa-pencil"></i></button>
      <button class="btn_ordenar" title="Ordenar"><i class="fa-solid fa-plus"></i></button>
      <button class="btn_eliminar" title="Eliminar producto"><i class="fa-solid fa-trash"></i></button>
    </div>
  `;
  contenedor.appendChild(div);

  div.querySelector('.btn_editar').onclick = () => { productoActual = div; abrirModal(nombre); };
  div.querySelector('.btn_ordenar').onclick = () => abrirModalOrdenar(nombre);
  div.querySelector('.btn_eliminar').onclick = () => abrirModalEliminar(nombre, div);

  requestAnimationFrame(() => div.classList.add('producto-visible'));
}

// =============================================
//  ELIMINAR PRODUCTO
// =============================================
let productoAEliminar = null;
let elementoAEliminar = null;

function abrirModalEliminar(nombre, elemento) {
  productoAEliminar = nombre;
  elementoAEliminar = elemento;

  const modalEliminar = document.getElementById('modalEliminarProducto');
  if (modalEliminar) {
    document.getElementById('nombreProductoEliminar').textContent = nombre;
    modalEliminar.style.display = 'flex';
  }
}

function cerrarModalEliminar() {
  const modalEliminar = document.getElementById('modalEliminarProducto');
  if (modalEliminar) modalEliminar.style.display = 'none';
  productoAEliminar = null;
  elementoAEliminar = null;
}

async function confirmarEliminarProducto() {
  if (!productoAEliminar) return;

  const btnConfirmar = document.getElementById('btnConfirmarEliminar');
  if (btnConfirmar) {
    btnConfirmar.disabled = true;
    btnConfirmar.textContent = 'Eliminando...';
  }

  showLoader('Eliminando producto...');

  try {
    const idProducto = await obtenerIdProducto(productoAEliminar);
    if (!idProducto) {
      hideLoader();
      alert('Error: No se encontró el producto en la base de datos');
      cerrarModalEliminar();
      return;
    }

    const response = await fetch(`${API_URL}/api/inventario/producto/${idProducto}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    hideLoader();

    if (data.success) {
      const nombreEliminado = productoAEliminar;
      cerrarModalEliminar();
      alert(`🗑️ Producto "${nombreEliminado}" eliminado con éxito`);
      location.reload();
    } else {
      throw new Error(data.message || 'Error al eliminar el producto');
    }
  } catch (error) {
    hideLoader();
    console.error('❌ Error al eliminar producto:', error);
    alert('Error al eliminar el producto: ' + error.message);
    cerrarModalEliminar();
  } finally {
    if (btnConfirmar) {
      btnConfirmar.disabled = false;
      btnConfirmar.textContent = 'Sí, eliminar';
    }
  }
}

// =============================================
//  TOAST DE NOTIFICACIÓN
// =============================================
function mostrarToast(mensaje) {
  let toast = document.getElementById('inventario-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'inventario-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.classList.add('toast-visible');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('toast-visible'), 3500);
}

function agregarEventListeners() {
  const seAplicaronRestricciones = deshabilitarFuncionesInventario();
  if (seAplicaronRestricciones) return;

  document.getElementById('btnReporteInventario')
    ?.addEventListener('click', abrirModalReporte);

  document.querySelectorAll('.btn_editar').forEach(boton => {
    boton.onclick = function () {
      productoActual = this.closest('.producto');
      const nombre = productoActual.querySelector('.nombre_del_producto')?.textContent?.trim();
      if (nombre) {
        abrirModal(nombre);
      } else {
        alert('Error: No se pudo obtener el nombre del producto');
      }
    };
  });

  document.querySelectorAll('.btn_ordenar').forEach(boton => {
    boton.onclick = function () {
      const nombre = this.closest('.producto')
        ?.querySelector('.nombre_del_producto')?.textContent?.trim();
      if (nombre) {
        abrirModalOrdenar(nombre);
      } else {
        alert('Error: No se pudo obtener el nombre del producto');
      }
    };
  });

  document.querySelectorAll('.btn_eliminar').forEach(boton => {
    boton.onclick = function () {
      const elemento = this.closest('.producto');
      const nombre = elemento?.querySelector('.nombre_del_producto')?.textContent?.trim();
      if (nombre) {
        abrirModalEliminar(nombre, elemento);
      } else {
        alert('Error: No se pudo obtener el nombre del producto');
      }
    };
  });
}

if (formModal) {
  formModal.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!productoNombreActual) {
      alert('Error: No hay un producto seleccionado');
      return;
    }

    const nuevaCantidad = parseFloat(cantidadTotalInput.value);

    if (isNaN(nuevaCantidad) || nuevaCantidad < 0) {
      alert('Por favor ingrese una cantidad válida');
      return;
    }

    await actualizarProducto(productoNombreActual, nuevaCantidad);
  });
}

if (ordenForm) {
  ordenForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    await enviarOrdenCorreo({
      producto: ordenProductoNombre.value,
      cantidad: parseInt(document.getElementById('ordenCantidad').value, 10),
      motivo: document.getElementById('ordenMotivo').value,
      destino: ordenDestinoInput.value,
      usuarioNombre: localStorage.getItem('usuarioNombre') || 'Usuario Cafetería'
    });
  });
}

// Form Agregar Producto
document.getElementById('formAgregarProducto')?.addEventListener('submit', async function (e) {
  e.preventDefault();
  const nombre = document.getElementById('nuevoNombreProducto').value.trim();
  const cantidad = parseFloat(document.getElementById('nuevaCantidadProducto').value) || 0;
  const imagenUrl = document.getElementById('nuevaImagenUrl')?.value.trim() || '';
  if (!nombre) {
    alert('Por favor ingresa el nombre del producto');
    return;
  }
  if (cantidad <= 0) {
    alert('No se puede agregar un producto con stock menor o igual a 0');
    return;
  }
  const btnSubmit = this.querySelector('button[type="submit"]');
  if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...'; }
  await crearNuevoProducto(nombre, cantidad, imagenUrl);
  if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Agregar Producto'; }
});

// Previsualización de imagen en vivo
document.getElementById('nuevaImagenUrl')?.addEventListener('input', function () {
  const url = this.value.trim();
  const prev = document.getElementById('previewImagen');
  const wrap = document.getElementById('previewWrap');
  if (!prev || !wrap) return;
  if (url) {
    prev.src = url;
    wrap.style.display = 'block';
    prev.onerror = () => { wrap.style.display = 'none'; prev.src = ''; };
    prev.onload = () => { wrap.style.display = 'block'; };
  } else {
    wrap.style.display = 'none';
    prev.src = '';
  }
});

// Botón confirmar eliminar
document.getElementById('btnConfirmarEliminar')?.addEventListener('click', confirmarEliminarProducto);

// Botón agregar en encabezado
document.getElementById('btnAgregarProducto')?.addEventListener('click', abrirModalAgregar);

if (spanCerrar) spanCerrar.addEventListener('click', cerrarModal);
if (btnCancelar) btnCancelar.addEventListener('click', cerrarModal);
if (closeButton) closeButton.addEventListener('click', cerrarModalOrdenar);

document.getElementById('closeReporteInventario')
  ?.addEventListener('click', cerrarModalReporte);

window.addEventListener('click', function (e) {
  if (e.target === modal) cerrarModal();
  if (e.target === ordenModal) cerrarModalOrdenar();
  if (e.target === document.getElementById('modalReporteInventario')) {
    cerrarModalReporte();
  }
  if (e.target === document.getElementById('modalAgregarProducto')) cerrarModalAgregar();
  if (e.target === document.getElementById('modalEliminarProducto')) cerrarModalEliminar();
});

function mostrarErrorCarga(error) {
  if (document.querySelectorAll('.producto').length === 0) {
    contenedorInventario.innerHTML = `
      <div class="error-carga">
        <h3>Error al cargar el inventario</h3>
        <p>${error.message}</p>
        <button onclick="cargarProductos()">Reintentar</button>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀 Inicializando sistema de inventario...');

  configurarRestriccionesPorRol();

  document.getElementById('closeReporteInventario')
    ?.addEventListener('click', cerrarModalReporte);

  const esMenuInventario = window.location.pathname.includes('inventario_menu');

  if (esMenuInventario) {
    verificarStockBajoAlEntrarInventario();

    document.getElementById('btnReporteInventario')
      ?.addEventListener('click', abrirModalReporte);

  } else {
    setTimeout(() => cargarProductos(), 100);
  }
});

async function verificarStockBajoAlEntrarInventario() {
  try {
    const rol = localStorage.getItem('usuarioRol');
    if (rol !== 'Administrador' && rol !== 'Encargado de inventario') return;

    const response = await fetch(`${API_URL}/api/inventario/vistas/stock-critico`);
    if (!response.ok) return;

    const stockBajo = await response.json();
    if (stockBajo.length > 0) mostrarAlertaStockBajo(stockBajo);

  } catch (error) {
    console.error('Error al verificar stock bajo:', error);
  }
}

function showCustomAlert(title, message) {
  const existingAlert = document.getElementById('custom-premium-alert');
  if (existingAlert) existingAlert.remove();

  const container = document.createElement('div');
  container.id = 'custom-premium-alert';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100000;
    opacity: 0;
    transition: opacity 0.3s ease;
    font-family: 'Poppins', 'Inter', sans-serif;
  `;

  const formattedMessage = message
    .replace(/\n/g, '<br>')
    .replace(/🔴 PRODUCTOS CRÍTICOS:/g, '<strong style="color: #d32f2f; font-size: 1.12rem; display: block; margin-top: 10px; margin-bottom: 5px;"><i class="fa-solid fa-circle-exclamation"></i> PRODUCTOS CRÍTICOS:</strong>')
    .replace(/🟡 PRODUCTOS BAJOS:/g, '<strong style="color: #fbc02d; font-size: 1.12rem; display: block; margin-top: 15px; margin-bottom: 5px;"><i class="fa-solid fa-triangle-exclamation"></i> PRODUCTOS BAJOS:</strong>')
    .replace(/🚨 ATENCIÓN - STOCK BAJO/g, '<span style="display:none;"></span>')
    .replace(/• /g, '<span style="color: #8d6e63; font-weight: bold; margin-left: 5px;">• </span>');

  const alertBox = document.createElement('div');
  alertBox.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 16px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
    transform: translateY(30px);
    transition: transform 0.3s ease;
    border: 2px solid #5d4037;
    text-align: center;
  `;

  alertBox.innerHTML = `
    <div style="background: linear-gradient(135deg, #5d4037, #3e2723); padding: 18px 25px; border-radius: 12px 12px 0 0; margin: -30px -30px 20px -30px; display: flex; align-items: center; justify-content: center; gap: 10px; color: white;">
      <i class="fa-solid fa-triangle-exclamation" style="color: #ffb74d; font-size: 1.5rem;"></i>
      <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600; text-shadow: 0 1px 3px rgba(0,0,0,0.3);">${title}</h3>
    </div>
    <div style="text-align: left; color: #4e342e; line-height: 1.6; font-size: 0.98rem; max-height: 350px; overflow-y: auto; padding: 5px; margin-bottom: 25px;">
      ${formattedMessage}
    </div>
    <button id="close-premium-alert-btn" style="
      background: linear-gradient(135deg, #8d6e63, #5d4037);
      color: white;
      border: none;
      padding: 12px 25px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(93, 64, 55, 0.25);
      transition: all 0.2s ease;
      width: 100%;
      outline: none;
    ">Aceptar</button>
  `;

  container.appendChild(alertBox);
  document.body.appendChild(container);

  requestAnimationFrame(() => {
    container.style.opacity = '1';
    alertBox.style.transform = 'translateY(0)';
  });

  const closeAlert = () => {
    container.style.opacity = '0';
    alertBox.style.transform = 'translateY(30px)';
    setTimeout(() => container.remove(), 300);
  };

  document.getElementById('close-premium-alert-btn').addEventListener('click', closeAlert);
  container.addEventListener('click', (e) => {
    if (e.target === container) closeAlert();
  });
}

function mostrarAlertaStockBajo(stockBajo) {
  const productosCriticos = stockBajo.filter(p => p.Estado === 'CRÍTICO');
  const productosBajos = stockBajo.filter(p => p.Estado === 'BAJO');

  let mensaje = '🚨 ATENCIÓN - STOCK BAJO\n\n';

  if (productosCriticos.length > 0) {
    mensaje += '🔴 PRODUCTOS CRÍTICOS:\n';
    productosCriticos.forEach(p => {
      mensaje += `• ${p.Nombre}: ${p.Cantidad} unidades\n`;
    });
    mensaje += '\n';
  }

  if (productosBajos.length > 0) {
    mensaje += '🟡 PRODUCTOS BAJOS:\n';
    productosBajos.forEach(p => {
      mensaje += `• ${p.Nombre}: ${p.Cantidad} unidades\n`;
    });
  }

  mensaje += '\n⚠️ Por favor, revisa el inventario y genera las órdenes necesarias.';
  showCustomAlert('🚨 ATENCIÓN - STOCK BAJO', mensaje);
}

