# ✨ ESENCIA Studio — Plataforma Web & Identidad Visual

Bienvenido al repositorio oficial del sitio web y plataforma de gestión de **ESENCIA Studio**.

Este proyecto combina una vitrina pública de alta estética para marcas y empresas con un motor backend ligero que gestiona prospectos de clientes y proyectos de portafolio mediante una base de datos segura y un panel de administración privado.

---

## 🌟 Características Principales

- **URLs Limpias y Amigables:** Navegación profesional sin extensiones `.html` (ej. `/portafolio`, `/contacto`, `/quienes-somos`) con redirección permanente 301 para enlaces antiguos.
- **Portafolio 100% Conectado a Base de Datos:** Galería dinámica que consulta proyectos en tiempo real, genera filtros de categoría automáticos y despliega un modal _lightbox_ con detalles del proyecto.
- **Formulario de Contacto Directo en Página:** Los clientes envían cotizaciones sin ser redirigidos a clientes de correo externos (`mailto:`). Los mensajes se almacenan en la base de datos y se notifican en pantalla.
- **Panel Administrativo con Seguridad:** Módulo de autenticación con JSON Web Tokens (JWT) y cifrado Bcrypt para consultar mensajes recibidos y publicar o eliminar proyectos del portafolio.
- **Base de Datos Agnóstica (Dual):**
  - **Local:** Utiliza **SQLite** (`data/esencia.sqlite`) sin necesidad de configurar servidores de base de datos externos.
  - **Producción:** Se conecta automáticamente a **PostgreSQL** al detectar la variable `DATABASE_URL` (ideal para Render o Neon).
- **Diseño Visual e Iconografía:** Paleta oscura y dorada de lujo con tipografía _serif_, animaciones fluidas y el catálogo vectorial de **Tabler Icons** (cero emojis).
- **Control del Video:** Presentación multimedia del estudio con controles interactivos nativos y sin reproducción automática intrusiva.

---

## 🌳 Estructura del Repositorio

```text
sofiwis/
├── docs/                      # 📚 Documentación detallada en español para todo el equipo
│   ├── README.md              # Índice de guías
│   ├── 01-organizacion-de-archivos.md
│   ├── 02-funcionalidades.md
│   ├── 03-stack-tecnologico.md
│   └── 04-guia-de-uso-y-administracion.md
│
├── public/                    # 🌐 Archivos estáticos servidos al navegador (Frontend)
│   ├── css/                   # Hojas de estilo (styles.css, quienes-somos.css)
│   ├── js/                    # JavaScript del cliente (main.js)
│   ├── img/                   # Fotografías, videos, logotipos e iconos
│   ├── index.html             # / (Inicio)
│   ├── quienes-somos.html     # /quienes-somos
│   ├── productos.html         # /productos
│   ├── portafolio.html        # /portafolio
│   ├── contacto.html          # /contacto
│   ├── login.html             # /login
│   └── admin.html             # /admin
│
├── data/                      # 💾 Almacén local de SQLite
├── db.js                      # Capa unificada de base de datos (SQLite / PostgreSQL)
├── server.js                  # Servidor Express, enrutador y APIs REST
├── package.json               # Dependencias y scripts de Node.js
└── README.md                  # Este archivo
```

---

## 🚀 Inicio Rápido (Local)

### Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).
- Gestor de paquetes `npm`.

### Instalación

1. Clona el repositorio o abre la carpeta en tu terminal:
   ```bash
   cd sofiwis
   ```

2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```

4. Abre tu navegador en:
   - **Sitio Web Público:** [http://localhost:3000](http://localhost:3000)
   - **Acceso Administrativo:** [http://localhost:3000/login](http://localhost:3000/login)

---

## 🔐 Credenciales del Panel de Administración

El sistema inicializa automáticamente un usuario administrador predeterminado si la base de datos está vacía:

- **Usuario:** `admin`
- **Contraseña:** `admin123`

---

## ⚙️ Variables de Entorno (Opcionales)

El servidor funciona directamente sin necesidad de archivo `.env`. Si deseas personalizar la configuración para producción (por ejemplo, en Render):

| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `PORT` | Puerto en el que escucha el servidor | `3000` |
| `DATABASE_URL` | Cadena de conexión para PostgreSQL (activa el modo Postgres) | `undefined` (utiliza SQLite local) |
| `JWT_SECRET` | Clave secreta para firmar los tokens de sesión de administración | Clave interna predeterminada |

---

## 🌐 Despliegue en Render

1. Sube tus cambios a GitHub:
   ```bash
   git push origin main
   ```
2. En [Render](https://render.com), crea un **Web Service**:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** `Node`
3. (Opcional) Si creas una base de datos PostgreSQL en Render, añade la variable de entorno `DATABASE_URL` en la configuración del servicio.

---

## 📖 Documentación Adicional

Para explicaciones más profundas redactadas en lenguaje sencillo y amigable para perfiles técnicos y no técnicos, consulta la carpeta [`docs/`](./docs/README.md):

- [1. Organización de Carpetas y Archivos](./docs/01-organizacion-de-archivos.md)
- [2. Funcionalidades del Sitio](./docs/02-funcionalidades.md)
- [3. Stack Tecnológico](./docs/03-stack-tecnologico.md)
- [4. Guía de Uso y Administración](./docs/04-guia-de-uso-y-administracion.md)

---

© 2026 **ESENCIA Studio**. Todos los derechos reservados.
