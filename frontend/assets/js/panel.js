const API_URL = 'http://localhost:3000';

const userRole = localStorage.getItem('usuarioRol');



document.getElementById('btnCerrarSesion')
  ?.addEventListener('click', function (e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = '../../InicioDeSesion.html';
  });


document.addEventListener('DOMContentLoaded', () => {
  
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
    // ELIMINADO: btnAddProduct no existe en Panel.html
  }
  
  // Mostrar botón de reportes para Admin y Encargado de inventario
  /*const btnReportes = document.getElementById('btnReportes');
  if (btnReportes && (userRole === 'Administrador' || userRole === 'Encargado de inventario')) {
    btnReportes.style.display = 'inline-flex';
  }*/
 /* const rol = localStorage.getItem('usuarioRol');

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
  }*/
  
  loadOrderList();
  setupModales();
  setupTopProductos();
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const orderListDiv = document.getElementById('orderList');
const orderDetailContent = document.getElementById('orderDetailContent');

async function loadOrderList() {
  try {
    const response = await fetch(`${API_URL}/api/pedidos`);
    if (!response.ok) throw new Error('Error al cargar la lista de pedidos');

    const orders = await response.json();
    orderListDiv.innerHTML = '';

    orders.forEach(order => {
      const row = document.createElement('div');
      row.className = 'order-row';
      row.dataset.id = order.IdPedido;
      row.innerHTML = `
        <div>#${order.IdPedido}</div>
        <div>${order.NombreCliente}</div>
        <div>${formatDate(order.Fecha)}</div>
        <div style="font-weight: 600; color: #5d4037;">$${parseFloat(order.Total).toFixed(2)}</div>
        <div><span class="status-badge ${order.Estado.toLowerCase()}">${order.Estado}</span></div>
      `;

      row.addEventListener('click', () => {
        document.querySelectorAll('.order-row').forEach(r => r.classList.remove('active'));
        row.classList.add('active');
        showOrderDetail(order.IdPedido, order);
      });

      orderListDiv.appendChild(row);
    });

  } catch (error) {
    orderListDiv.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
  }
}

async function showOrderDetail(orderId, orderSummary) {
  orderDetailContent.innerHTML = '<p>Cargando detalles...</p>';
  const activeRow = document.querySelector(`.order-row[data-id="${orderId}"]`);

  try {
    const response = await fetch(`${API_URL}/api/pedidos/${orderId}/detalle`);
    if (!response.ok) throw new Error('Error al cargar detalles');

    const details = await response.json();

    let detailsHTML = `
      <h4>Pedido #${orderId}</h4>
      <p><strong>Mesa:</strong> ${orderSummary.NombreCliente}</p>
      <p><strong>Estado:</strong> ${orderSummary.Estado}</p>
      <p><strong>Tomado por:</strong> ${orderSummary.NombreUsuario}</p>
      <hr>
      <table class="detail-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant.</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${details.map(item => `
            <tr>
              <td>${item.NombreProducto}</td>
              <td>x${item.Cantidad}</td>
              <td>$${parseFloat(item.Subtotal).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <hr>
      <div style="text-align: right; font-size: 1.1em;">
        <div><strong>Subtotal:</strong> $${(parseFloat(orderSummary.Total) - parseFloat(orderSummary.IVA)).toFixed(2)}</div>
        <div><strong>IVA (16%):</strong> $${parseFloat(orderSummary.IVA).toFixed(2)}</div>
        <div style="font-size:1.2em; font-weight:bold; border-top:1px solid #ccc; padding-top:5px;">
          <strong>TOTAL:</strong> $${parseFloat(orderSummary.Total).toFixed(2)}
        </div>
      </div>
    `;

    if (orderSummary.Estado === 'Pendiente') {
      detailsHTML += `
        <button id="completeOrderBtn"
          style="background-color:#4CAF50; color:white; padding:10px 15px; border:none; border-radius:4px; cursor:pointer; margin-top:15px; width:100%;">
          PEDIDO COMPLETADO
        </button>
        <button id="sendTicketBtn"
          style="background-color:#2196F3; color:white; padding:10px 15px; border:none; border-radius:4px; cursor:pointer; margin-top:10px; width:100%;">
          <i class="fas fa-ticket-alt"></i> ENVIAR TICKET
        </button>
      `;
    } else {
      detailsHTML += `
        <p style="color:green; font-weight:bold; margin-top:15px;">✅ Pedido Finalizado.</p>
        <button id="sendTicketBtn"
          style="background-color:#2196F3; color:white; padding:10px 15px; border:none; border-radius:4px; cursor:pointer; margin-top:10px; width:100%;">
          <i class="fas fa-ticket-alt"></i> ENVIAR TICKET
        </button>
      `;
    }

    orderDetailContent.innerHTML = detailsHTML;

    document.getElementById('completeOrderBtn')
      ?.addEventListener('click', () => {
        confirm(`¿Marcar el Pedido #${orderId} como COMPLETADO?`).then((accepted) => {
          if (accepted) {
            markOrderAsCompleted(orderId, activeRow);
          }
        });
      });

    document.getElementById('sendTicketBtn')
      ?.addEventListener('click', () => prepareTicketEmail(orderId, orderSummary, details));

  } catch (error) {
    orderDetailContent.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
  }
}

async function markOrderAsCompleted(orderId, rowElement) {
  showLoader('Completando pedido...');
  try {
    const response = await fetch(`${API_URL}/api/pedidos/${orderId}/completar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });

    hideLoader();

    if (!response.ok) throw new Error('Fallo la actualización en el servidor.');

    if (rowElement) rowElement.style.display = 'none';
    orderDetailContent.innerHTML = '<p style="color:green; font-weight:bold;">Orden completada y archivada.</p>';
    alert(`🎉 Pedido #${orderId} marcado como COMPLETADO.`);

  } catch (error) {
    hideLoader();
    alert(`Error: No se pudo completar el pedido. ${error.message}`);
  }
}

async function prepareTicketEmail(orderId, orderSummary, details) {
  const modalEmail = document.getElementById('modalEmail');
  const emailMessage = document.getElementById('emailMessage');
  const emailForm = document.getElementById('emailForm');
  const inputEmail = document.getElementById('inputEmail');

  modalEmail.style.display = 'flex';
  emailForm.style.display = 'none';
  emailMessage.textContent = 'Verificando información del cliente...';

  try {
    const response = await fetch(`${API_URL}/api/pedidos/${orderId}/cliente`);
    const clienteData = await response.json();

    if (clienteData.email) {
      emailMessage.innerHTML = `
        <div style="background:#e8f5e9; padding:15px; border-radius:8px; border:1px solid #a5d6a7;">
          <p style="margin:0; color:#2e7d32;">
            <i class="fas fa-check-circle"></i>
            El ticket se enviará a: <strong>${clienteData.email}</strong>
          </p>
          <p style="margin:10px 0 0 0; font-size:0.9em;">Cliente: ${clienteData.nombre}</p>
        </div>
      `;
      emailForm.style.display = 'block';
      inputEmail.value = clienteData.email;
      inputEmail.style.display = 'none';
      document.getElementById('btnEnviarTicket').onclick =
        () => sendTicketEmail(orderId, clienteData.email, orderSummary, details);

    } else {
      emailMessage.innerHTML = `
        <div style="background:#fff3e0; padding:15px; border-radius:8px; border:1px solid #ffb74d;">
          <p style="margin:0; color:#e65100;">
            <i class="fas fa-info-circle"></i>
            El cliente <strong>${clienteData.nombre}</strong> no tiene email registrado.
          </p>
          <p style="margin:10px 0 0 0; font-size:0.9em;">
            Por favor, ingresa un correo para enviar el ticket.
          </p>
        </div>
      `;
      emailForm.style.display = 'block';
      inputEmail.style.display = 'block';
      inputEmail.value = '';
      inputEmail.focus();
      document.getElementById('btnEnviarTicket').onclick = () => {
        const email = inputEmail.value.trim();
        if (!email || !validateEmail(email)) {
          alert('Por favor ingresa un correo electrónico válido.');
          return;
        }
        sendTicketEmail(orderId, email, orderSummary, details);
      };
    }

  } catch (error) {
    emailMessage.innerHTML = `
      <div style="background:#ffebee; padding:15px; border-radius:8px; border:1px solid #ef5350;">
        <p style="margin:0; color:#c62828;">
          <i class="fas fa-exclamation-triangle"></i>
          Error al cargar información del cliente.
        </p>
      </div>
    `;
  }
}

async function sendTicketEmail(orderId, email, orderSummary, details) {
  const btnEnviar = document.getElementById('btnEnviarTicket');
  const originalText = btnEnviar.innerHTML;

  showLoader('Enviando ticket...');
  try {
    btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    btnEnviar.disabled = true;

    const response = await fetch(`${API_URL}/api/pedidos/enviar-ticket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, email, orderSummary, details })
    });

    const result = await response.json();
    hideLoader();

    if (result.success) {
      alert('✅ Ticket enviado correctamente a: ' + email);
      document.getElementById('modalEmail').style.display = 'none';
    } else {
      throw new Error(result.message || 'Error al enviar el ticket');
    }

  } catch (error) {
    hideLoader();
    alert('❌ Error al enviar el ticket: ' + error.message);
  } finally {
    btnEnviar.innerHTML = originalText;
    btnEnviar.disabled = false;
  }
}

document.getElementById('btnReportes')
  ?.addEventListener('click', loadReport);

async function loadReport() {
  const modal = document.getElementById('modalReportes');
  const tabla = document.getElementById('tablaReporte');

  modal.style.display = 'flex';
  tabla.innerHTML = '<p>Cargando...</p>';

  try {
    const res = await fetch(`${API_URL}/api/pedidos/completados`);
    const pedidos = await res.json();

    let totalGeneral = 0;

    const filas = pedidos.map(p => {
      totalGeneral += parseFloat(p.Total);
      return `
        <tr>
          <td>#${p.IdPedido}</td>
          <td>${p.NombreCliente}</td>
          <td>${new Date(p.Fecha).toLocaleString('es-MX')}</td>
          <td>$${parseFloat(p.Total).toFixed(2)}</td>
          <td>${p.NombreUsuario}</td>
        </tr>
      `;
    }).join('');

    tabla.innerHTML = `
      <table class="detail-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Mesa</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Usuario</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
      <hr>
      <h3 style="text-align:right; color:#5a3d31;">
        TOTAL VENDIDO: $${totalGeneral.toFixed(2)}
      </h3>
    `;

  } catch (error) {
    tabla.innerHTML = `<p style="color:red;">Error al cargar reporte.</p>`;
  }
}

function setupTopProductos() {
  const modalTop = document.getElementById('modalTopProductos');
  const btnTop = document.getElementById('btnTopProductos');
  const closeTop = document.getElementById('closeTopProductos');

  if (btnTop) {
    btnTop.addEventListener('click', () => {
      modalTop.style.display = 'flex';

      const hoy = new Date();
      const ayer = new Date();
      ayer.setDate(hoy.getDate() - 1);

      document.getElementById('fechaFin').value = hoy.toISOString().split('T')[0];
      document.getElementById('fechaInicio').value = ayer.toISOString().split('T')[0];

      cargarTopProductos();
    });
  }

  if (closeTop) {
    closeTop.addEventListener('click', () => modalTop.style.display = 'none');
  }
}

async function cargarTopProductos() {
  const fInicio = document.getElementById('fechaInicio').value;
  const fFin = document.getElementById('fechaFin').value;
  const tbody = document.getElementById('tablaTopProductos');

  if (!fInicio || !fFin) {
    alert('Selecciona ambas fechas.');
    return;
  }

  tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Calculando...</td></tr>';

  try {
    const response = await fetch(`${API_URL}/api/reportes/top`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inicio: fInicio, fin: fFin })
    });

    const lista = await response.json();
    tbody.innerHTML = '';

    if (lista.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No hubo ventas.</td></tr>';
      return;
    }

    const medallas = ['🥇', '🥈', '🥉', ''];

    lista.forEach((item, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="padding:10px; border-bottom:1px solid #eee;">${medallas[index] || ''}${item.Nombre}</td>
        <td style="padding:10px; text-align:center; border-bottom:1px solid #eee;">${item.TotalVendidos}</td>
        <td style="padding:10px; text-align:right; border-bottom:1px solid #eee; font-weight:bold;">
          $${parseFloat(item.DineroGenerado).toFixed(2)}
        </td>
      `;
      tbody.appendChild(row);
    });

  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="3" style="color:red; text-align:center;">Error al consultar.</td></tr>';
  }
}

function setupModales() {
  document.getElementById('closeReportes')
    ?.addEventListener('click', () => {
      document.getElementById('modalReportes').style.display = 'none';
    });

  document.getElementById('closeEmail')
    ?.addEventListener('click', () => {
      document.getElementById('modalEmail').style.display = 'none';
    });

  document.getElementById('btnCancelarEmail')
    ?.addEventListener('click', () => {
      document.getElementById('modalEmail').style.display = 'none';
    });

  window.addEventListener('click', (event) => {
    const modales = ['modalTopProductos', 'modalReportes', 'modalEmail'];
    modales.forEach(id => {
      const modal = document.getElementById(id);
      if (modal && event.target === modal) modal.style.display = 'none';
    });
  });
}