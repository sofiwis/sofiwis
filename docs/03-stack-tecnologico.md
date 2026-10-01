# 🛠️ Stack Tecnológico

El término **"Stack Tecnológico"** se refiere al conjunto de herramientas, lenguajes de programación y programas que se combinaron para construir la plataforma.

A continuación se explica cada componente usando comparaciones de la vida real.

---

## 1. Node.js y Express (El Motor del Servidor)

- **¿Qué es?** Es la máquina que está detrás de escena, escuchando cuando alguien en internet escribe la dirección del sitio.
- **Analogía:** Imagina al **mesero principal** de un restaurante. Cuando un comensal pide ver el portafolio, el mesero va a la cocina, le pide al cocinero los platos correspondientes y se los entrega elegantemente al cliente en su mesa.
- **Ventaja:** Es extremadamente rápido, consume muy poca memoria y es el estándar de la industria para servidores modernos en la nube.

---

## 2. Base de Datos Híbrida: SQLite y PostgreSQL (El Archivador Inteligente)

- **¿Qué es?** El lugar seguro donde se guardan permanentemente los mensajes de los clientes y los proyectos del portafolio.
- **¿Por qué es "híbrida" o inteligente?**
  - **En tu computadora (Local):** Utiliza **SQLite** (`data/esencia.sqlite`). Es como un cuaderno digital ultrarrápido que vive dentro de la misma carpeta del proyecto. No necesitas instalar ni configurar servidores complicados para que funcione.
  - **En internet (Render o la Nube):** Si configuras una base de datos en la nube (como PostgreSQL o Neon), el sistema la detecta en un segundo y se conecta a ella de forma automática sin que tengas que reprogramar nada.
- **Ventaja:** Facilidad máxima para probar en local y robustez profesional para producción en internet.

---

## 3. JWT y Bcrypt (La Cerradura de Seguridad)

- **¿Qué son?** Las herramientas que protegen el acceso al panel administrativo.
- **Bcrypt:** Es un triturador matemático. Cuando creas una contraseña, no se guarda como texto simple (como `admin123`). Se convierte en una huella digital ilegible. Si alguien intentara ver el archivo de la base de datos, jamás podría descifrar tu clave.
- **JWT (JSON Web Token):** Es como la **manilla VIP** o tarjeta electrónica de un hotel. Cuando inicias sesión correctamente, el servidor te entrega una tarjeta digital firmada. Mientras lleves esa tarjeta en tu navegador, podrás ver y editar los proyectos sin tener que escribir tu clave en cada clic.

---

## 4. HTML5 y CSS3 Moderno (El Esqueleto y el Vestuario)

- **HTML5:** Es la estructura del edificio: las paredes, los textos, las imágenes y los botones.
- **CSS3:** Es el diseño de interiores: el fondo oscuro y elegante (`#040509`), los destellos dorados (`#b98a50`), la tipografía serif sofisticada, los efectos de brillo al pasar el mouse por encima y la adaptación automática para pantallas de teléfonos, tablets y computadoras.

---

## 5. JavaScript Nativo / Vanilla JS (Los Músculos y Reflejos)

- **¿Qué es?** El código que le da vida y movimiento a la página sin recargar la pantalla.
- **¿Por qué "Vanilla" (sin frameworks pesados como React o Angular)?**
  - Al no usar librerías gigantescas, la página web de ESENCIA pesa muy pocos kilobytes y carga en milésimas de segundo, incluso con conexiones de internet lentas en celulares.
  - Controla el carrusel de imágenes, el modal lightbox del portafolio, el menú desplegable en celulares y el envío transparente del formulario.

---

## 6. Tabler Icons (La Iconografía)

- **¿Qué es?** Una librería de iconos vectoriales limpios y modernos desarrollada para interfaces digitales profesionales.
- **Ventaja:** Nunca se pixela, tiene un peso imperceptible y combina armónicamente con la paleta de colores de la marca.
