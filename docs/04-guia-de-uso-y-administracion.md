# 📖 Guía de Uso y Administración

Esta guía explica paso a paso cómo operar el sitio web en el día a día, tanto en tu computadora personal como en internet.

---

## 💻 1. Cómo encender el sitio en tu computadora

1. Abre tu terminal de comandos en la carpeta del proyecto:
   ```bash
   cd /Volumes/X9_Pro/Development/projects/personal/sofiwis
   ```
2. Ejecuta el comando de inicio:
   ```bash
   npm start
   ```
3. Verás un mensaje en pantalla indicándote la dirección:
   ```text
   ===============================================
   ✨ ESENCIA Studio Server funcionando en:
   👉 http://localhost:3000
   👉 Panel Admin: http://localhost:3000/login
   ===============================================
   ```
4. Abre tu navegador preferido (Chrome, Safari, Edge) y entra en:
   * **Sitio web:** [http://localhost:3000](http://localhost:3000)
   * **Panel administrativo:** [http://localhost:3000/login](http://localhost:3000/login)

---

## 🔑 2. Cómo ingresar al Panel de Administración

1. Dirígete a la ruta `/login` (o haz clic en el botón superior **"ACCESO"** en la barra de navegación).
2. Ingresa las credenciales maestras:
   * **Usuario:** `admin`
   * **Contraseña:** `admin123`
3. Al pulsar **"INGRESAR AL PANEL"**, serás redirigido automáticamente a `/admin`.
4. Nota: El botón de la barra de navegación cambiará a **"PANEL ADMIN"** en color dorado mientras tu sesión siga abierta.

---

## 📥 3. Gestión de Mensajes de Clientes

Dentro del Panel de Administración, en la pestaña **"Mensajes Recibidos"**:
* Verás una lista organizada por orden de llegada con todos los prospectos que han enviado el formulario de cotización.
* Podrás ver:
  * Nombre completo y correo electrónico.
  * Número de teléfono / WhatsApp (puedes hacer clic para iniciar una llamada o chat).
  * El servicio que solicitaron cotizar (ej. *Diseño de Logo*, *Branding Completo*).
  * El texto íntegro de la consulta del cliente.
* **Acciones:** Puedes marcar cada mensaje como *Leído* o presionar el botón de papelera para eliminar mensajes antiguos.

---

## 🖼️ 4. Cómo publicar un nuevo Proyecto en el Portafolio

Dentro del Panel de Administración, en la pestaña **"Gestión de Portafolio"**:
1. En la columna izquierda encontrarás el formulario **"Publicar Nuevo Proyecto"**:
   * **Título del Proyecto:** El nombre de la marca o campaña (ej. *Café Origen Santo*).
   * **Categoría:** Selecciona una categoría existente (*Identidad Visual*, *Redes Sociales*, *Branding & Sostenibilidad*) o escribe una nueva categoría.
   * **Nombre del Cliente:** El nombre de la empresa o emprendedor.
   * **Ruta o URL de la Imagen:**
     * Puedes usar una imagen interna guardada en la carpeta de imágenes: `/img/nombre-de-tu-foto.jpg`.
     * O puedes pegar un enlace directo de internet: `https://ejemplo.com/foto.jpg`.
   * **Descripción del Proyecto:** Breve explicación del concepto creativo y valor aportado.
2. Pulsa el botón **"PUBLICAR EN EL PORTAFOLIO"**.
3. ¡Listo! El proyecto se guardará en la base de datos y aparecerá instantáneamente en la página pública `/portafolio`. Si creaste una categoría nueva, se creará un nuevo botón de filtro automáticamente.

---

## 🗑️ 5. Cómo eliminar un proyecto

1. En la misma pestaña de portafolio, ve a la columna derecha donde se listan los proyectos actuales.
2. Cada tarjeta tiene un botón rojo con icono de papelera: **"Eliminar"**.
3. Haz clic en él y confirma la acción en la alerta del navegador. El proyecto se borrará de la base de datos y ya no aparecerá en el sitio público.

---

## 🚀 6. Publicar cambios en internet (Render)

Cuando realices modificaciones en el código o agregues nuevas funciones y quieras que se reflejen en la versión pública en internet:

1. Guarda los cambios con Git:
   ```bash
   git add .
   git commit -m "feat: descripción de tus cambios"
   ```
2. Envía la actualización a GitHub:
   ```bash
   git push origin main
   ```
3. Render detectará automáticamente el nuevo commit en GitHub y desplegará la versión actualizada en un par de minutos sin interrumpir el servicio.
