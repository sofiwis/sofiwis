// ==========================================================================
// ESENCIA - MAIN JAVASCRIPT (MAIN.JS)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Menú Hamburguesa Móvil
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navbarNav = document.getElementById('navbarNav');

  if (hamburgerBtn && navbarNav) {
    hamburgerBtn.addEventListener('click', () => {
      navbarNav.classList.toggle('show');
      
      // Cambiar icono entre barras y equis (X)
      const icon = hamburgerBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Cerrar menú al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!hamburgerBtn.contains(e.target) && !navbarNav.contains(e.target)) {
        navbarNav.classList.remove('show');
        const icon = hamburgerBtn.querySelector('i');
        if (icon && icon.classList.contains('fa-xmark')) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      }
    });
  }

  // 2. Feedback visual al pulsar el botón "COMENZAR"
  const btnComenzar = document.getElementById('btnComenzar');
  if (btnComenzar) {
    btnComenzar.addEventListener('click', (e) => {
      // Efecto sutil antes de navegar
      btnComenzar.style.opacity = '0.7';
    });
  }
});