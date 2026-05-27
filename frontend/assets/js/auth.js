const API_URL = 'http://localhost:3000';

document.getElementById('loginForm')
  .addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      alert('Por favor ingresa tu correo y contraseña');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('sesionActiva', 'true');
        localStorage.setItem('usuarioId', data.usuario.IdUsuario);
        localStorage.setItem('usuarioNombre', data.usuario.Nombre);
        localStorage.setItem('usuarioRol', data.usuario.Rol);
        localStorage.setItem('usuarioEmail', data.usuario.Correo);
        localStorage.setItem('mostrarAlertaStock', 'true');

        alert(`¡Bienvenido, ${data.usuario.Nombre}!`, () => {
          const rol = data.usuario.Rol;

          if (rol === 'Administrador' || rol === 'Cajero/Mesero') {
            window.location.href = 'pages/inicio/Inicio.html';
          } else if (rol === 'Encargado de inventario') {
            window.location.href = 'pages/Inventario/inventario_menu.html';
          } else {
            window.location.href = 'pages/inicio/Inicio.html';
          }
        });

      } else {
        alert(data.message || 'Correo o contraseña incorrectos');
      }

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Error de conexión. Asegúrate de que el servidor esté corriendo.');
    }
  });