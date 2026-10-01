const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'esencia_super_secret_jwt_key_2026';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redirección 301 automática de URLs con .html a URLs limpias
app.use((req, res, next) => {
  if (req.path.endsWith('.html') && req.path !== '/index.html') {
    const cleanPath = req.path.slice(0, -5);
    const query = req.url.slice(req.path.length);
    return res.redirect(301, cleanPath + query);
  }
  next();
});

// Servir frontend estático desde /public con soporte nativo de extensiones limpias
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html']
}));


// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado. Por favor inicia sesión.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Sesión inválida o expirada. Inicia sesión nuevamente.' });
    }
    req.user = decoded;
    next();
  });
}

// =========================================================
// PUBLIC API ROUTES
// =========================================================

// 1. Contact Form submission (directly from page, no mail client)
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Por favor ingresa tu nombre completo.' });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Por favor ingresa un correo electrónico válido.' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Por favor escribe tu mensaje o consulta.' });
    }

    const savedMessage = await db.addMessage({
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : 'No especificado',
      service: service ? service.trim() : 'General',
      message: message.trim()
    });

    return res.status(201).json({
      success: true,
      message: '¡Gracias por escribirnos! Hemos recibido tu mensaje directamente en el estudio ESENCIA y te responderemos en breve.',
      data: { id: savedMessage.id, date: savedMessage.date }
    });
  } catch (error) {
    console.error('Error al guardar mensaje:', error);
    return res.status(500).json({ error: 'Error interno al procesar el mensaje' });
  }
});

// 2. Public Portfolio listing
app.get('/api/portfolio', async (req, res) => {
  try {
    const projects = await db.getProjects();
    res.json({ success: true, projects });
  } catch (error) {
    console.error('Error al listar proyectos:', error);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
});

// 3. Admin Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Ingresa tu usuario y contraseña.' });
    }

    const user = await db.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    const validPassword = bcrypt.compareSync(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    // Generate JWT token valid for 7 days
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno en el servidor' });
  }
});

// =========================================================
// PROTECTED ADMIN ROUTES
// =========================================================

// Verify current session
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar sesión' });
  }
});

// Get all contact form messages
app.get('/api/admin/messages', authenticateToken, async (req, res) => {
  try {
    const messages = await db.getMessages();
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

// Mark message as read/unread
app.patch('/api/admin/messages/:id/read', authenticateToken, async (req, res) => {
  try {
    const { isRead } = req.body;
    const updated = await db.markMessageRead(req.params.id, isRead !== undefined ? isRead : true);
    if (!updated) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }
    res.json({ success: true, message: updated });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar mensaje' });
  }
});

// Delete message
app.delete('/api/admin/messages/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await db.deleteMessage(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Mensaje no encontrado o ya eliminado' });
    }
    res.json({ success: true, message: 'Mensaje eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar mensaje' });
  }
});

// Add project to portfolio
app.post('/api/portfolio', authenticateToken, async (req, res) => {
  try {
    const { title, category, client, description, image } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ error: 'Título, categoría y descripción son requeridos.' });
    }

    const newProject = await db.addProject({
      title: title.trim(),
      category: category.trim(),
      client: client ? client.trim() : 'Cliente confidencial',
      description: description.trim(),
      image: image && image.trim() ? image.trim() : 'img/servicio-logos.jpg',
      featured: true
    });

    res.status(201).json({ success: true, project: newProject });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear proyecto' });
  }
});

// Delete project from portfolio
app.delete('/api/portfolio/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await db.deleteProject(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    res.json({ success: true, message: 'Proyecto eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar proyecto' });
  }
});

// Start server with automatic port fallback if port is in use
if (require.main === module) {
  async function startServer(portToTry) {
    try {
      await db.init();
    } catch (dbErr) {
      console.error('Error al inicializar la base de datos:', dbErr);
    }

    const server = app.listen(portToTry, () => {
      console.log(`===============================================`);
      console.log(`✨ ESENCIA Studio Server funcionando en:`);
      console.log(`👉 http://localhost:${portToTry}`);
      console.log(`👉 Panel Admin: http://localhost:${portToTry}/login`);
      console.log(`===============================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ El puerto ${portToTry} está en uso por otra app (como Next.js).`);
        const nextPort = Number(portToTry) + 1;
        console.log(`🔄 Iniciando automáticamente en el puerto ${nextPort}...`);
        startServer(nextPort);
      } else {
        console.error('Error al iniciar el servidor:', err);
      }
    });
  }

  startServer(PORT);
}

module.exports = app;
