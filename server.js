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

// Serve static assets from project root
app.use(express.static(__dirname));

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
app.post('/api/contact', (req, res) => {
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

  const savedMessage = db.addMessage({
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
});

// 2. Public Portfolio listing
app.get('/api/portfolio', (req, res) => {
  try {
    const projects = db.getProjects();
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
});

// 3. Admin Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Ingresa tu usuario y contraseña.' });
  }

  const user = db.getUserByUsername(username);
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
});

// =========================================================
// PROTECTED ADMIN ROUTES
// =========================================================

// Verify current session
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.getUserById(req.user.id);
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
});

// Get all contact form messages
app.get('/api/admin/messages', authenticateToken, (req, res) => {
  const messages = db.getMessages();
  res.json({ success: true, messages });
});

// Mark message as read/unread
app.patch('/api/admin/messages/:id/read', authenticateToken, (req, res) => {
  const { isRead } = req.body;
  const updated = db.markMessageRead(req.params.id, isRead !== undefined ? isRead : true);
  if (!updated) {
    return res.status(404).json({ error: 'Mensaje no encontrado' });
  }
  res.json({ success: true, message: updated });
});

// Delete message
app.delete('/api/admin/messages/:id', authenticateToken, (req, res) => {
  const deleted = db.deleteMessage(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Mensaje no encontrado o ya eliminado' });
  }
  res.json({ success: true, message: 'Mensaje eliminado' });
});

// Add project to portfolio
app.post('/api/portfolio', authenticateToken, (req, res) => {
  const { title, category, client, description, image } = req.body;

  if (!title || !category || !description) {
    return res.status(400).json({ error: 'Título, categoría y descripción son requeridos.' });
  }

  const newProject = db.addProject({
    title: title.trim(),
    category: category.trim(),
    client: client ? client.trim() : 'Cliente confidencial',
    description: description.trim(),
    image: image && image.trim() ? image.trim() : 'img/servicio-logos.jpg',
    featured: true
  });

  res.status(201).json({ success: true, project: newProject });
});

// Delete project from portfolio
app.delete('/api/portfolio/:id', authenticateToken, (req, res) => {
  const deleted = db.deleteProject(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Proyecto no encontrado' });
  }
  res.json({ success: true, message: 'Proyecto eliminado con éxito' });
});

// Start server with automatic port fallback if port is in use
if (require.main === module) {
  function startServer(portToTry) {
    const server = app.listen(portToTry, () => {
      console.log(`===============================================`);
      console.log(`✨ ESENCIA Studio Server funcionando en:`);
      console.log(`👉 http://localhost:${portToTry}`);
      console.log(`👉 Panel Admin: http://localhost:${portToTry}/login.html`);
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
