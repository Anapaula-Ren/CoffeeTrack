const API_URL = 'http://localhost:3000';

function verificarSesion() {
  const sesionActiva = localStorage.getItem('sesionActiva');
  if (!sesionActiva) {
    window.location.href = '../../InicioDeSesion.html';
  }
}

function configurarNavegacion() {
   const userRole = localStorage.getItem('usuarioRol');

  if (userRole === 'Encargado de inventario') {
    const pedidosLink = document.querySelector('nav a[href*="GestionPedidos.html"]');
    const panelLink = document.querySelector('nav a[href*="Panel.html"]');
    const linkUsuarios = document.getElementById('linkUsuarios');
    if (pedidosLink) pedidosLink.style.display = 'none';
    if (panelLink) panelLink.style.display = 'none';
    if (linkUsuarios) linkUsuarios.style.display = 'none';
  }
  
  if (userRole === 'Cajero/Mesero') {
    const inventarioLink = document.querySelector('nav a[href*="Inventario"]');
    const linkUsuarios = document.getElementById('linkUsuarios');
    if (inventarioLink) inventarioLink.style.display = 'none';
    if (linkUsuarios) linkUsuarios.style.display = 'none';
  }

  if (userRole === 'Administrador') {
    const linkUsuarios = document.getElementById('linkUsuarios');
    if (linkUsuarios) linkUsuarios.style.display = 'inline-block'; 
  }

  
}

function mostrarUsuario() {
  const nombre = localStorage.getItem('usuarioNombre');
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

document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀 Iniciando página principal...');

  verificarSesion();
  configurarNavegacion();
  mostrarUsuario();

  document.getElementById('btnCerrarSesion')
    ?.addEventListener('click', function (e) {
      e.preventDefault();
      cerrarSesion();
    });

  if (localStorage.getItem('mostrarAlertaStock') === 'true') {
    verificarStockBajoAlInicio();
    localStorage.removeItem('mostrarAlertaStock');
  }
});

