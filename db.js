const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial state
const defaultState = {
  users: [
    {
      id: 'admin-1',
      username: 'admin',
      email: 'admin@esencia.com',
      // 'admin123' bcrypt hash
      passwordHash: bcrypt.hashSync('admin123', 10),
      name: 'Sofía — Directora ESENCIA',
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ],
  messages: [
    {
      id: 'msg-demo-1',
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@ejemplo.com',
      phone: '+57 310 9876543',
      service: 'Logos e Identidad Visual',
      message: 'Hola equipo de ESENCIA, nos encantaría renovar la identidad de nuestra marca de café orgánico. ¿Tienen disponibilidad este mes?',
      date: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      read: false
    }
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Blend Bar',
      category: 'Identidad Visual',
      client: 'Blend Bar Coffee & Cocktails',
      description: 'Creación de logotipo, identidad de marca moderna y concepto visual para coctelería y café de especialidad.',
      image: 'img/logo-blendbar.png',
      featured: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'proj-2',
      title: 'Rotoxas',
      category: 'Identidad Corporativa',
      client: 'Rotoxas Soluciones',
      description: 'Diseño de logotipo industrial e isotipo de alto impacto con paleta metálica y sobria.',
      image: 'img/logo-rotoxas.png',
      featured: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'proj-3',
      title: 'Zero Waste Colombia',
      category: 'Branding & Sostenibilidad',
      client: 'Zero Waste Initiative',
      description: 'Identidad visual ecológica, líneas orgánicas y empaques sustentables para concientización ambiental.',
      image: 'img/logo-zerowaste.png',
      featured: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'proj-4',
      title: 'Crone',
      category: 'Redes Sociales',
      client: 'Crone Studio',
      description: 'Estrategia visual para feeds de Instagram, diseño de publicaciones y carruseles de alta conversión.',
      image: 'img/post-crone.jpeg',
      featured: true,
      createdAt: new Date().toISOString()
    }
  ]
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultState, null, 2), 'utf8');
      return defaultState;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading db.json, returning defaultState:', error);
    return defaultState;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing db.json:', error);
    return false;
  }
}

// Helper methods
const db = {
  // Users
  getUserByUsername(username) {
    const data = readDb();
    return data.users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase());
  },

  getUserById(id) {
    const data = readDb();
    return data.users.find(u => u.id === id);
  },

  // Messages
  getMessages() {
    const data = readDb();
    return data.messages.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  addMessage(msg) {
    const data = readDb();
    const newMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      ...msg,
      date: new Date().toISOString(),
      read: false
    };
    data.messages.unshift(newMessage);
    writeDb(data);
    return newMessage;
  },

  markMessageRead(id, isRead = true) {
    const data = readDb();
    const msg = data.messages.find(m => m.id === id);
    if (msg) {
      msg.read = isRead;
      writeDb(data);
      return msg;
    }
    return null;
  },

  deleteMessage(id) {
    const data = readDb();
    const initialLen = data.messages.length;
    data.messages = data.messages.filter(m => m.id !== id);
    writeDb(data);
    return data.messages.length < initialLen;
  },

  // Projects
  getProjects() {
    const data = readDb();
    return data.projects;
  },

  addProject(project) {
    const data = readDb();
    const newProject = {
      id: 'proj-' + Date.now(),
      ...project,
      createdAt: new Date().toISOString()
    };
    data.projects.unshift(newProject);
    writeDb(data);
    return newProject;
  },

  deleteProject(id) {
    const data = readDb();
    const initialLen = data.projects.length;
    data.projects = data.projects.filter(p => p.id !== id);
    writeDb(data);
    return data.projects.length < initialLen;
  }
};

module.exports = db;
