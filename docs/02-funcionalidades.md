# ✨ Funcionalidades del Sitio y la Plataforma

En este documento se explican las capacidades interactivas desarrolladas para **ESENCIA**, qué problema resuelven y cómo mejoran la experiencia de los clientes y del equipo.

---

## 1. 📬 Formulario de Contacto Directo (Sin redirigir a correo)

* **Ubicación:** `/contacto`
* **¿Qué problema había antes?** Los botones antiguos utilizaban enlaces tipo `mailto:`, lo que obligaba al usuario a abrir una aplicación externa (como Outlook, Apple Mail o la app de correo del celular). Si el usuario no tenía configurada esa aplicación, el botón simplemente no hacía nada o fallaba.
* **¿Cómo funciona ahora?**
  1. El cliente escribe su nombre, correo, teléfono y consulta en pantalla.
  2. Al pulsar **"ENVIAR MENSAJE DIRECTO"**, el mensaje viaja de inmediato a nuestro servidor mediante una conexión segura (AJAX).
  3. El mensaje se guarda en la base de datos para que la gerencia pueda revisarlo desde el panel admin.
  4. En pantalla aparece una notificación dorada de confirmación: *"¡Gracias por escribirnos! Hemos recibido tu mensaje en el estudio y te responderemos en breve."*
  5. Si el sitio se subiera a un servidor estático sin Node.js, tiene un respaldo inteligente que envía el formulario directamente por correo mediante AJAX sin recargar la página.

---

## 2. 🗂️ Portafolio 100% Conectado a la Base de Datos

* **Ubicación:** `/portafolio`
* **¿Qué problema había antes?** Los proyectos estaban "pegados" a mano en el archivo HTML. Si se agregaba o borraba un proyecto en el panel de control, en la página pública no cambiaba nada.
* **¿Cómo funciona ahora?**
  1. Cada vez que alguien entra a la página, el sitio le pregunta a la base de datos: *"¿Qué proyectos están activos en este momento?"*.
  2. El navegador construye al instante las tarjetas visuales con sus imágenes, títulos y categorías.
  3. Los **botones de filtro** (ej. *Identidad Visual*, *Redes Sociales*, *Sostenibilidad*) se generan automáticamente según las categorías reales que existan en la base de datos.
  4. **Ventana de Detalle (Modal Lightbox):** Al hacer clic sobre cualquier proyecto, se abre una ventana elegante con la fotografía ampliada, el nombre del cliente y una descripción detallada, acompañada del botón *"Cotizar proyecto similar"* que lleva al usuario directamente al formulario.

---

## 3. 🔐 Inicio de Sesión y Panel Administrativo (Admin)

* **Ubicaciones:** `/login` y `/admin`
* **¿Para qué sirve?** Es el área privada del estudio para gestionar el negocio sin necesidad de tocar código.
* **Características:**
  * **Acceso seguro:** Protegido por usuario y contraseña mediante llaves criptográficas de sesión (tokens JWT).
  * **Bandeja de Entrada de Clientes:** Muestra la lista de mensajes recibidos desde el formulario de contacto con fecha, hora, teléfono y servicio de interés. Permite marcar mensajes leídos o borrarlos.
  * **Gestor de Portafolio:** Permite publicar nuevos proyectos (título, categoría, cliente, descripción y foto) o eliminar proyectos antiguos con un solo clic. Cualquier cambio impacta el portafolio público al instante.

---

## 4. 🎬 Control Humano del Video (Sin reproducción automática)

* **Ubicación:** `/quienes-somos`
* **¿Qué problema había antes?** El video del estudio se reproducía solo en cuanto el usuario entraba a la página, consumiendo datos móviles, distrayendo la lectura o reproduciendo sonido inesperado.
* **¿Cómo funciona ahora?**
  * El video espera respetuosamente a que el usuario decida reproducirlo pulsando el botón de Play.
  * Incluye controles nativos de pausa, volumen, avance y pantalla completa.

---

## 5. 🎨 Iconografía Profesional con Tabler Icons

* **¿Qué problema había antes?** Se utilizaban emojis del sistema operativo (como 📁, ✉️, 📞). Los emojis se ven infantiles en marcas de lujo y cambian de forma y color según el celular (Android, iPhone o Windows).
* **¿Cómo funciona ahora?**
  * Se implementó el catálogo vectorial de **Tabler Icons**.
  * Todos los iconos (flechas doradas, sobres de correo, teléfonos, botones de menú, candados) tienen un trazo fino, uniforme y coherente con la identidad visual dorada y oscura de ESENCIA.

---

## 6. 🎯 Cotizador Inteligente desde Servicios

* **Ubicación:** `/productos`
* En cada tarjeta de servicio (*Logos*, *Eslóganes*, *Posts*, *Videos*), el botón de cotización pasa el parámetro exacto hacia el formulario de contacto:
  * Si el cliente pulsa *"Cotizar Logo"*, viaja a `/contacto?service=Diseño+de+Logo` y el campo *"Servicio de interés"* del formulario se selecciona automáticamente por él.
