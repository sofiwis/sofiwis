# 📁 Organización de Carpetas y Archivos

Para que un proyecto sea fácil de mantener y seguro, debe estar ordenado como una oficina profesional: la vitrina accesible para el público por un lado, y los archivos internos, bodegas y servidores por el otro.

---

## 🌳 Estructura General del Proyecto

```text
sofiwis/
├── docs/                      # Guías y manuales de documentación en español
│   ├── README.md              # Índice principal
│   ├── 01-organizacion-de-archivos.md
│   ├── 02-funcionalidades.md
│   ├── 03-stack-tecnologico.md
│   └── 04-guia-de-uso-y-administracion.md
│
├── public/                    # LA VITRINA: Todo lo que el navegador web del usuario puede ver
│   ├── css/                   # Estilos, colores, tipografías y diseño visual
│   │   ├── styles.css         # Hoja de estilos principal del sitio
│   │   └── quienes-somos.css  # Ajustes de diseño de la sección de fundadora/valores
│   ├── js/                    # Interactividad en pantalla
│   │   └── main.js            # Lógica de filtros, menú móvil, modal y formularios
│   ├── img/                   # Fotografías, videos, logotipos e iconos
│   ├── index.html             # Página de bienvenida (Inicio)
│   ├── quienes-somos.html     # Misión, visión, valores y fundadora
│   ├── productos.html         # Lista de servicios (Logos, Eslogan, Posts, Videos)
│   ├── portafolio.html        # Galería dinámica de proyectos
│   ├── contacto.html          # Formulario directo de cotización y WhatsApp
│   ├── login.html             # Pantalla de acceso al área administrativa
│   └── admin.html             # Panel de control de mensajes y proyectos
│
├── data/                      # BODEGA LOCAL: Donde se guarda la base de datos SQLite
│   └── esencia.sqlite         # El archivo físico con tus datos si estás trabajando en local
│
├── db.js                      # EL ARCHIVADOR: Lógica para hablar con la base de datos
├── server.js                  # EL MOTOR: El servidor web Express que procesa las peticiones
├── package.json               # LISTA DE HERRAMIENTAS: Lista de librerías requeridas por Node.js
└── .gitignore                 # Filtro para evitar subir archivos pesados o secretos a Git
```

---

## 🏢 ¿Por qué separamos la carpeta `public/` del resto?

Imagina un restaurante elegante:
- El **comedor y las mesas** son la carpeta `public/`: es el espacio diseñado para los clientes. Aquí están los menús (HTML), la decoración y luces (CSS), la música (JS) y los cuadros en las paredes (imágenes).
- La **cocina y la caja fuerte** son los archivos de la raíz (`server.js`, `db.js`, `data/`): ningún cliente debe poder entrar libremente a la cocina a manipular las recetas o ver la contabilidad.

Separar la carpeta `public/` garantiza que el navegador del usuario únicamente pueda descargar los elementos visuales que necesita, protegiendo las contraseñas, la base de datos y la programación interna del servidor.

---

## 🔗 ¿Por qué quitamos el `.html` de las direcciones web? (URLs Limpias)

Antes, para visitar el portafolio, el cliente tenía que ver una dirección larga y técnica:
- ❌ `https://esencia.onrender.com/portafolio.html`

Ahora, la dirección es limpia, moderna y profesional:
- ✅ `https://esencia.onrender.com/portafolio`

### Ventajas de las URLs Limpias:
1. **Confianza y Marca:** Da la apariencia de una marca consolidada y un software moderno (como Instagram, Airbnb o Notion), en vez de un archivo escolar suelto.
2. **Posicionamiento en Google (SEO):** A los motores de búsqueda les resulta más fácil clasificar e indexar direcciones sencillas y legibles.
3. **Fáciles de Compartir:** Es mucho más cómodo enviar por WhatsApp o escribir en una tarjeta de presentación: `esencia.com/contacto`.
4. **Compatibilidad Total:** Si alguien tenía guardado el enlace antiguo con `.html`, el servidor lo detecta automáticamente y lo redirige a la versión moderna sin errores.
