/* =========================================================
   ESENCIA — main.js
   Este archivo hace dos cosas:
   1) Abre y cierra el menú en celulares.
   2) Mantiene el idioma elegido en el traductor de Google
      cuando pasas de una página a otra.
   ========================================================= */


/* ---------- 1. MENÚ DE CELULAR ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var boton = document.querySelector('.menu-btn');
  var menu = document.querySelector('.nav-links');

  if (boton && menu) {
    boton.addEventListener('click', function () {
      menu.classList.toggle('open');            // muestra u oculta el menú
      boton.textContent = menu.classList.contains('open') ? '\u2715' : '\u2630';
    });
  }
});


/* ---------- 2. TRADUCTOR DISCRETO Y PERSISTENTE ---------- */
var idiomaGuardado = localStorage.getItem('idioma_esencia') || 'es';

function guardarCookieIdioma(idioma) {
  var vencimiento = idioma === 'es' ? '; max-age=0' : '; max-age=31536000';
  var valor = idioma === 'es' ? '' : '/es/' + idioma;

  document.cookie = 'googtrans=' + valor + vencimiento + '; path=/; SameSite=Lax';

  // También conserva la preferencia si el sitio usa un dominio propio.
  if (window.location.hostname.includes('.')) {
    document.cookie = 'googtrans=' + valor + vencimiento +
      '; domain=' + window.location.hostname + '; path=/; SameSite=Lax';
  }
}

guardarCookieIdioma(idiomaGuardado);

/* Google puede insertar una barra superior al terminar de traducir.
   La retiramos cada vez que aparezca y mantenemos la página en su posición. */
function ocultarAvisoDeGoogle() {
  var avisos = document.querySelectorAll(
    '.goog-te-banner-frame, iframe.goog-te-banner-frame, ' +
    '.VIpgJd-ZVi9od-ORHb-OEVmcd, iframe.VIpgJd-ZVi9od-ORHb-OEVmcd'
  );

  avisos.forEach(function (aviso) {
    aviso.style.setProperty('display', 'none', 'important');
  });

  document.documentElement.style.setProperty('top', '0', 'important');
  document.body.style.setProperty('top', '0', 'important');
  document.body.style.setProperty('margin-top', '0', 'important');
}

document.addEventListener('DOMContentLoaded', function () {
  ocultarAvisoDeGoogle();
  new MutationObserver(ocultarAvisoDeGoogle).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
});

function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'es',
    includedLanguages: 'es,en,pt,fr',
    autoDisplay: false
  }, 'google_translate_element');

  iniciarSelectorDeIdioma();
  ocultarAvisoDeGoogle();
}

function iniciarSelectorDeIdioma() {
  var selectorVisible = document.getElementById('language-select');
  if (!selectorVisible) return;

  selectorVisible.value = idiomaGuardado;
  selectorVisible.addEventListener('change', function () {
    var nuevoIdioma = selectorVisible.value;
    localStorage.setItem('idioma_esencia', nuevoIdioma);
    guardarCookieIdioma(nuevoIdioma);
    window.location.reload();
  });

  // El selector original de Google permanece oculto; este intervalo espera
  // a que esté listo y le aplica la preferencia guardada.
  var intentos = 0;
  var intervalo = window.setInterval(function () {
    var selectorGoogle = document.querySelector('.goog-te-combo');
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
