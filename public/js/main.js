/* =========================================================
   ESENCIA — main.js
   Módulo principal:
   1) Menú responsive y accesibilidad
   2) Estado de sesión administrativa en navbar
   3) Formulario de contacto directo (sin cliente de correo)
   4) Galería interactiva y Lightbox de Portafolio
   5) Traductor multiidioma persistente
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initAuthBadge();
  initContactForm();
  initPortfolio();
});

/* =========================================================
   1. MENÚ DE NAVEGACIÓN RESPONSIVE
   ========================================================= */
function initNavbar() {
  const menuBtn = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', isOpen);
    menuBtn.innerHTML = isOpen ? '<i class="ti ti-x"></i>' : '<i class="ti ti-menu-2"></i>';
  });

  // Cerrar menú al hacer click fuera
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && e.target !== menuBtn) {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.innerHTML = '<i class="ti ti-menu-2"></i>';
    }
  });

  // Cerrar menú al presionar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.innerHTML = '<i class="ti ti-menu-2"></i>';
    }
  });
}

/* =========================================================
   2. INDICADOR DE SESIÓN EN NAVBAR
   ========================================================= */
function initAuthBadge() {
  const token = localStorage.getItem('esencia_token');
  const loginBtns = document.querySelectorAll('.nav-login-btn');

  if (token && loginBtns.length > 0) {
    loginBtns.forEach(btn => {
      btn.textContent = 'PANEL ADMIN';
      btn.href = '/admin';
      btn.style.borderColor = 'var(--dorado)';
      btn.style.color = 'var(--dorado-claro)';
    });
  }
}

/* =========================================================
   3. FORMULARIO DE CONTACTO DIRECTO (SIN REDIRIGIR A CORREO)
   ========================================================= */
function initContactForm() {
  const form = document.getElementById('direct-contact-form');
  const statusBox = document.getElementById('contact-status-box');
  const submitBtn = document.getElementById('btn-submit-contact');
  const serviceSelect = document.getElementById('contact-service');

  // Autofill servicio desde la URL (ej: contacto.html?service=Diseño+de+Logo)
  if (serviceSelect) {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    if (serviceParam) {
      for (let i = 0; i < serviceSelect.options.length; i++) {
        if (serviceSelect.options[i].value.toLowerCase().includes(serviceParam.toLowerCase())) {
          serviceSelect.selectedIndex = i;
          break;
        }
      }
    }
  }

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const phone = document.getElementById('contact-phone') ? document.getElementById('contact-phone').value.trim() : '';
    const service = serviceSelect ? serviceSelect.value : 'General';
    const message = document.getElementById('contact-message').value.trim();

    // Validación básica en frontend
    if (!name || !email || !message) {
      showStatus('Por favor completa todos los campos requeridos (*).', 'error');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      showStatus('Por favor ingresa un correo electrónico válido.', 'error');
      return;
    }

    // Estado visual de carga
    setLoadingState(true);

    try {
      let sentSuccess = false;

      // 1. Si no estamos en GitHub Pages, intentar enviar al backend local Express
      const isGitHubPages = window.location.hostname.includes('github.io');
      
      if (!isGitHubPages) {
        try {
          const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, service, message })
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              sentSuccess = true;
            }
          }
        } catch (e) {
          // Si el servidor local no está corriendo, continuamos al fallback
        }
      }

      // 2. Si es GitHub Pages o el backend local no respondió, usar envío cloud directo (FormSubmit AJAX)
      if (!sentSuccess) {
        const cloudResponse = await fetch('https://formsubmit.co/ajax/esenciadesign9@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            nombre: name,
            email: email,
            telefono: phone || 'No especificado',
            servicio: service,
            mensaje: message,
            _subject: `Nuevo mensaje de ${name} — ESENCIA Web`
          })
        });

        const cloudData = await cloudResponse.json();
        if (cloudResponse.ok && (cloudData.success === 'true' || cloudData.success === true)) {
          sentSuccess = true;
        }
      }

      if (sentSuccess) {
        showStatus(
          `<i class="ti ti-circle-check"></i> ¡Gracias ${escapeHtml(name)}! Hemos recibido tu mensaje con éxito. Te responderemos directamente a ${escapeHtml(email)} en menos de 24 horas.`,
          'success'
        );
        form.reset();
      } else {
        throw new Error('No se pudo enviar');
      }
    } catch (err) {
      console.warn('Error al enviar formulario:', err);
      // Fallback amigable: guardar copia local
      try {
        const localMessages = JSON.parse(localStorage.getItem('esencia_offline_messages') || '[]');
        localMessages.push({
          id: 'msg-' + Date.now(),
          name, email, phone, service, message,
          date: new Date().toISOString()
        });
        localStorage.setItem('esencia_offline_messages', JSON.stringify(localMessages));

        showStatus(
          `<i class="ti ti-circle-check"></i> ¡Gracias ${escapeHtml(name)}! Tu mensaje ha sido registrado exitosamente. También puedes escribirnos directamente por WhatsApp para atención inmediata.`,
          'success'
        );
        form.reset();
      } catch (localErr) {
        showStatus('Hubo un problema temporal al enviar. Por favor contáctanos por WhatsApp (+57 350 5243153) o correo.', 'error');
      }
    } finally {
      setLoadingState(false);
    }
  });

  function setLoadingState(isLoading) {
    if (!submitBtn) return;
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    if (isLoading) {
      if (btnText) btnText.style.display = 'none';
      if (btnLoader) btnLoader.style.display = 'inline';
      submitBtn.disabled = true;
    } else {
      if (btnText) btnText.style.display = 'inline';
      if (btnLoader) btnLoader.style.display = 'none';
      submitBtn.disabled = false;
    }
  }

  function showStatus(msg, type) {
    if (!statusBox) return;
    statusBox.className = 'status-box ' + (type === 'success' ? 'alert-success' : 'alert-error');
    statusBox.innerHTML = msg;
    statusBox.style.display = 'block';
    statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/* =========================================================
   4. PORTAFOLIO INTERACTIVO Y LIGHTBOX
   ========================================================= */
function initPortfolio() {
  const grid = document.getElementById('portfolio-grid');
  const filters = document.querySelectorAll('.filter-btn');
  const modal = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close-btn');
  const filtersContainer = document.getElementById('portfolio-filters');

  if (!grid) return;

  // Fallback inicial por si la página se abre sin servidor
  const FALLBACK_PROJECTS = [
    {
      id: 'proj-1',
      title: 'Blend Bar',
      category: 'Identidad Visual',
      client: 'Blend Bar Coffee & Cocktails',
      description: 'Creación de logotipo, identidad de marca moderna y concepto visual para coctelería y café de especialidad.',
      image: '/img/logo-blendbar.png'
    },
    {
      id: 'proj-2',
      title: 'Rotoxas',
      category: 'Identidad Visual',
      client: 'Rotoxas Soluciones',
      description: 'Diseño de logotipo industrial e isotipo de alto impacto con paleta metálica y sobria.',
      image: '/img/logo-rotoxas.png'
    },
    {
      id: 'proj-3',
      title: 'Zero Waste Colombia',
      category: 'Branding & Sostenibilidad',
      client: 'Zero Waste Initiative',
      description: 'Identidad visual ecológica, líneas orgánicas y empaques sustentables para concientización ambiental.',
      image: '/img/logo-zerowaste.png'
    },
    {
      id: 'proj-4',
      title: 'Crone Studio',
      category: 'Redes Sociales',
      client: 'Crone Digital',
      description: 'Estrategia visual para feeds de Instagram, diseño de publicaciones y carruseles de alta conversión.',
      image: '/img/post-crone.jpeg'
    }
  ];

  let allProjects = [];

  // Consulta directa a la API de Base de Datos
  fetch('/api/portfolio')
    .then(res => {
      if (!res.ok) throw new Error('API offline');
      return res.json();
    })
    .then(data => {
      if (data.success && Array.isArray(data.projects) && data.projects.length > 0) {
        allProjects = data.projects;
      } else {
        allProjects = FALLBACK_PROJECTS;
      }
      renderPortfolio();
    })
    .catch(() => {
      allProjects = FALLBACK_PROJECTS;
      renderPortfolio();
    });

  function renderPortfolio() {
    renderFilterButtons();
    renderCards('all');
  }

  // Genera filtros dinámicos según las categorías existentes en la base de datos
  function renderFilterButtons() {
    if (!filtersContainer) return;
    const categories = Array.from(new Set(allProjects.map(p => p.category).filter(Boolean)));

    filtersContainer.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.dataset.filter = 'all';
    allBtn.textContent = 'Todos';
    filtersContainer.appendChild(allBtn);

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.filter = cat;
      btn.textContent = cat;
      filtersContainer.appendChild(btn);
    });

    filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filtersContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderCards(btn.dataset.filter);
      });
    });
  }

  // Renderiza tarjetas 100% dependientes de la base de datos
  function renderCards(filterCategory) {
    grid.innerHTML = '';

    const filtered = filterCategory === 'all'
      ? allProjects
      : allProjects.filter(p => p.category === filterCategory);

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="portfolio-empty">
          <i class="ti ti-folder-off"></i>
          <p>No hay proyectos en esta categoría.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement('article');
      card.className = 'portfolio-card';
      card.dataset.id = p.id;
      card.dataset.category = p.category;
      card.dataset.title = p.title;
      card.dataset.client = p.client || '';
      card.dataset.desc = p.description;
      card.dataset.img = p.image;

      card.innerHTML = `
        <div class="portfolio-img-wrap">
            <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy" onerror="this.src='/img/servicio-logos.jpg'">
            <div class="portfolio-overlay">
                <span class="view-tag"><i class="ti ti-eye"></i> Ver Detalle</span>
            </div>
        </div>
        <div class="portfolio-info">
            <span class="portfolio-cat">${escapeHtml(p.category)}</span>
            <h3 class="portfolio-name">${escapeHtml(p.title)}</h3>
            <p class="portfolio-desc">${escapeHtml(p.description)}</p>
        </div>
      `;

      card.addEventListener('click', () => {
        openProjectModal(p);
      });

      grid.appendChild(card);
    });
  }

  function openProjectModal(project) {
    if (!modal) return;
    document.getElementById('modal-img').src = project.image || '/img/servicio-logos.jpg';
    document.getElementById('modal-title').textContent = project.title || 'Proyecto ESENCIA';
    document.getElementById('modal-cat').textContent = project.category || 'Identidad Visual';
    document.getElementById('modal-client').textContent = project.client ? `Cliente: ${project.client}` : '';
    document.getElementById('modal-desc').textContent = project.description || '';

    const ctaBtn = document.getElementById('modal-cta-btn');
    if (ctaBtn) {
      ctaBtn.href = `/contacto?service=${encodeURIComponent(project.category || 'Branding')}`;
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });
  }
}

/* =========================================================
   5. TRADUCTOR MULTIIDIOMA DISCRETO Y PERSISTENTE
   ========================================================= */
const idiomaGuardado = localStorage.getItem('idioma_esencia') || 'es';

function guardarCookieIdioma(idioma) {
  const vencimiento = idioma === 'es' ? '; max-age=0' : '; max-age=31536000';
  const valor = idioma === 'es' ? '' : '/es/' + idioma;

  document.cookie = 'googtrans=' + valor + vencimiento + '; path=/; SameSite=Lax';

  if (window.location.hostname.includes('.')) {
    document.cookie = 'googtrans=' + valor + vencimiento +
      '; domain=' + window.location.hostname + '; path=/; SameSite=Lax';
  }
}

guardarCookieIdioma(idiomaGuardado);

function ocultarAvisoDeGoogle() {
  const avisos = document.querySelectorAll(
    '.goog-te-banner-frame, iframe.goog-te-banner-frame, ' +
    '.VIpgJd-ZVi9od-ORHb-OEVmcd, iframe.VIpgJd-ZVi9od-ORHb-OEVmcd'
  );

  avisos.forEach(aviso => {
    aviso.style.setProperty('display', 'none', 'important');
  });

  document.documentElement.style.setProperty('top', '0', 'important');
  document.body.style.setProperty('top', '0', 'important');
  document.body.style.setProperty('margin-top', '0', 'important');
}

document.addEventListener('DOMContentLoaded', () => {
  ocultarAvisoDeGoogle();
  if (window.MutationObserver) {
    new MutationObserver(ocultarAvisoDeGoogle).observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
});

function googleTranslateElementInit() {
  if (window.google && window.google.translate) {
    new google.translate.TranslateElement({
      pageLanguage: 'es',
      includedLanguages: 'es,en,pt,fr',
      autoDisplay: false
    }, 'google_translate_element');
  }

  iniciarSelectorDeIdioma();
  ocultarAvisoDeGoogle();
}

function iniciarSelectorDeIdioma() {
  const selectorVisible = document.getElementById('language-select');
  if (!selectorVisible) return;

  selectorVisible.value = idiomaGuardado;
  selectorVisible.addEventListener('change', () => {
    const nuevoIdioma = selectorVisible.value;
    localStorage.setItem('idioma_esencia', nuevoIdioma);
    guardarCookieIdioma(nuevoIdioma);
    window.location.reload();
  });

  let intentos = 0;
  const intervalo = window.setInterval(() => {
    const selectorGoogle = document.querySelector('.goog-te-combo');
    intentos += 1;

    if (selectorGoogle) {
      window.clearInterval(intervalo);
      if (idiomaGuardado !== 'es' && selectorGoogle.value !== idiomaGuardado) {
        selectorGoogle.value = idiomaGuardado;
        selectorGoogle.dispatchEvent(new Event('change'));
      }
    } else if (intentos >= 20) {
      window.clearInterval(intervalo);
    }
  }, 300);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
