const API_URL = 'http://localhost:3000';

function verificarSesion() {
  const sesionActiva = localStorage.getItem('sesionActiva');
  if (!sesionActiva) {
    window.location.href = '../../InicioDeSesion.html';
  }
}

function configurarNavegacion() {
  const rol = localStorage.getItem('usuarioRol');

  const linkUsuarios = document.getElementById('linkUsuarios');
  const linkPanel    = document.querySelector('nav a[href*="Panel.html"]');
  const linkPedidos  = document.querySelector('nav a[href*="GestionPedidos.html"]');

  if (rol === 'Encargado de inventario') {
    if (linkPanel)    linkPanel.style.display    = 'none';
    if (linkPedidos)  linkPedidos.style.display  = 'none';
    if (linkUsuarios) linkUsuarios.style.display = 'none';

  } else if (rol === 'Cajero/Mesero') {
    if (linkUsuarios) linkUsuarios.style.display = 'none';

  } else if (rol === 'Administrador') {
    if (linkUsuarios) linkUsuarios.style.display = 'inline-block';
  }
}

function mostrarUsuario() {
  const nombre      = localStorage.getItem('usuarioNombre');
  const spanUsuario = document.getElementById('nombreUsuario');
  if (spanUsuario && nombre) {
    spanUsuario.textContent = `Hola, ${nombre}`;
  }
}

function cerrarSesion() {
  localStorage.removeItem('sesionActiva');
  localStorage.removeItem('usuarioId');
  localStorage.removeItem('usuarioNombre');
  localStorage.removeItem('usuarioRol');
  localStorage.removeItem('usuarioEmail');
  localStorage.removeItem('mostrarAlertaStock');
  window.location.href = '../../InicioDeSesion.html';
}

async function verificarStockBajoAlInicio() {
  try {
    const rol = localStorage.getItem('usuarioRol');

    if (rol !== 'Administrador' && rol !== 'Encargado de inventario') return;

    const response = await fetch(`${API_URL}/api/inventario/vistas/stock-critico`);
    if (!response.ok) return;

    const stockBajo = await response.json();
    if (stockBajo.length > 0) {
      mostrarAlertaStockBajo(stockBajo);
    }

  } catch (error) {
    console.error('Error al verificar stock bajo:', error);
  }
}

function mostrarAlertaStockBajo(stockBajo) {
  const productosCriticos = stockBajo.filter(p => p.Estado === 'CRÍTICO');
  const productosBajos    = stockBajo.filter(p => p.Estado === 'BAJO');

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
  alert(mensaje);
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Iniciando página principal...');

  verificarSesion();
  configurarNavegacion();
  mostrarUsuario();

  document.getElementById('btnCerrarSesion')
    ?.addEventListener('click', function(e) {
      e.preventDefault();
      cerrarSesion();
    });

  if (localStorage.getItem('mostrarAlertaStock') === 'true') {
    verificarStockBajoAlInicio();
    localStorage.removeItem('mostrarAlertaStock');
  }
});