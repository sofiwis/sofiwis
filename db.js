const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Check if PostgreSQL connection URL is provided
const isPostgres = Boolean(process.env.DATABASE_URL);

let pgPool = null;
let sqliteDb = null;

// Initial seed data
const DEFAULT_ADMIN = {
  id: 'admin-1',
  username: 'admin',
  email: 'admin@esencia.com',
  passwordHash: bcrypt.hashSync('admin123', 10),
  name: 'Sofía — Directora ESENCIA',
  role: 'admin'
};

const DEFAULT_PROJECTS = [
  {
    id: 'proj-1',
    title: 'Blend Bar',
    category: 'Identidad Visual',
    client: 'Blend Bar Coffee & Cocktails',
    description: 'Creación de logotipo, identidad de marca moderna y concepto visual para coctelería y café de especialidad.',
    image: '/img/logo-blendbar.png',
    featured: 1
  },
  {
    id: 'proj-2',
    title: 'Rotoxas',
    category: 'Identidad Visual',
    client: 'Rotoxas Soluciones',
    description: 'Diseño de logotipo industrial e isotipo de alto impacto con paleta metálica y sobria.',
    image: '/img/logo-rotoxas.png',
    featured: 1
  },
  {
    id: 'proj-3',
    title: 'Zero Waste Colombia',
    category: 'Branding & Sostenibilidad',
    client: 'Zero Waste Initiative',
    description: 'Identidad visual ecológica, líneas orgánicas y empaques sustentables para concientización ambiental.',
    image: '/img/logo-zerowaste.png',
    featured: 1
  },
  {
    id: 'proj-4',
    title: 'Crone Studio',
    category: 'Redes Sociales',
    client: 'Crone Digital',
    description: 'Estrategia visual para feeds de Instagram, diseño de publicaciones y carruseles de alta conversión.',
    image: '/img/post-crone.jpeg',
    featured: 1
  }
];

const DEFAULT_MESSAGES = [
  {
    id: 'msg-demo-1',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@ejemplo.com',
    phone: '+57 310 9876543',
    service: 'Diseño de Logo',
    message: 'Hola equipo de ESENCIA, nos encantaría renovar la identidad de nuestra marca de café orgánico.',
    date: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    is_read: 0
  }
];

// Initialize Database (Postgres or SQLite)
async function initDb() {
  if (isPostgres) {
    const { Pool } = require('pg');
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });

    console.log('🐘 Conectando a base de datos PostgreSQL...');

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(64) UNIQUE NOT NULL,
        email VARCHAR(128) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name VARCHAR(128) NOT NULL,
        role VARCHAR(32) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        email VARCHAR(128) NOT NULL,
        phone VARCHAR(64),
        service VARCHAR(128),
        message TEXT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(128) NOT NULL,
        category VARCHAR(128) NOT NULL,
        client VARCHAR(128),
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        featured BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed admin if not present
    const userRes = await pgPool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userRes.rows[0].count, 10) === 0) {
      await pgPool.query(
        'INSERT INTO users (id, username, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5, $6)',
        [DEFAULT_ADMIN.id, DEFAULT_ADMIN.username, DEFAULT_ADMIN.email, DEFAULT_ADMIN.passwordHash, DEFAULT_ADMIN.name, DEFAULT_ADMIN.role]
      );
      console.log('✅ Usuario administrador inicial creado en PostgreSQL.');
    }

    // Seed projects if not present
    const projRes = await pgPool.query('SELECT COUNT(*) FROM projects');
    if (parseInt(projRes.rows[0].count, 10) === 0) {
      for (const p of DEFAULT_PROJECTS) {
        await pgPool.query(
          'INSERT INTO projects (id, title, category, client, description, image, featured) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [p.id, p.title, p.category, p.client, p.description, p.image, true]
        );
      }
      console.log('✅ Proyectos iniciales sembrados en PostgreSQL.');
    }

    // Seed demo message
    const msgRes = await pgPool.query('SELECT COUNT(*) FROM messages');
    if (parseInt(msgRes.rows[0].count, 10) === 0) {
      const m = DEFAULT_MESSAGES[0];
      await pgPool.query(
        'INSERT INTO messages (id, name, email, phone, service, message, date, is_read) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [m.id, m.name, m.email, m.phone, m.service, m.message, m.date, false]
      );
    }

    console.log('✨ Base de datos PostgreSQL inicializada con éxito.');
  } else {
    // Local SQLite database
    const Database = require('better-sqlite3');
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(dataDir, 'esencia.sqlite');
    sqliteDb = new Database(dbPath);
    sqliteDb.pragma('journal_mode = WAL');

    console.log(`📦 Usando base de datos SQLite en: ${dbPath}`);

    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        service TEXT,
        message TEXT NOT NULL,
        date TEXT DEFAULT CURRENT_TIMESTAMP,
        is_read INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        client TEXT,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        featured INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed admin if not present
    const userCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount === 0) {
      sqliteDb.prepare(`
        INSERT INTO users (id, username, email, password_hash, name, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(DEFAULT_ADMIN.id, DEFAULT_ADMIN.username, DEFAULT_ADMIN.email, DEFAULT_ADMIN.passwordHash, DEFAULT_ADMIN.name, DEFAULT_ADMIN.role);
      console.log('✅ Usuario administrador inicial creado en SQLite.');
    }

    // Seed projects if not present
    const projCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM projects').get().count;
    if (projCount === 0) {
      const insertProj = sqliteDb.prepare(`
        INSERT INTO projects (id, title, category, client, description, image, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of DEFAULT_PROJECTS) {
        insertProj.run(p.id, p.title, p.category, p.client, p.description, p.image, p.featured);
      }
      console.log('✅ Proyectos iniciales sembrados en SQLite.');
    }

    // Seed demo message
    const msgCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM messages').get().count;
    if (msgCount === 0) {
      const m = DEFAULT_MESSAGES[0];
      sqliteDb.prepare(`
        INSERT INTO messages (id, name, email, phone, service, message, date, is_read)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(m.id, m.name, m.email, m.phone, m.service, m.message, m.date, m.is_read);
    }

    console.log('✨ Base de datos SQLite lista para operar.');
  }
}

// Unified DAO
const db = {
  init: initDb,

  async getUserByUsername(username) {
    if (isPostgres) {
      const res = await pgPool.query(
        'SELECT * FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1) LIMIT 1',
        [username]
      );
      if (res.rows.length === 0) return null;
      const u = res.rows[0];
      return {
        id: u.id,
        username: u.username,
        email: u.email,
        passwordHash: u.password_hash,
        name: u.name,
        role: u.role
      };
    } else {
      const u = sqliteDb.prepare(
        'SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1'
      ).get(username, username);
      if (!u) return null;
      return {
        id: u.id,
        username: u.username,
        email: u.email,
        passwordHash: u.password_hash,
        name: u.name,
        role: u.role
      };
    }
  },

  async getUserById(id) {
    if (isPostgres) {
      const res = await pgPool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
      if (res.rows.length === 0) return null;
      const u = res.rows[0];
      return { id: u.id, username: u.username, email: u.email, name: u.name, role: u.role };
    } else {
      const u = sqliteDb.prepare('SELECT * FROM users WHERE id = ? LIMIT 1').get(id);
      if (!u) return null;
      return { id: u.id, username: u.username, email: u.email, name: u.name, role: u.role };
    }
  },

  // Messages
  async getMessages() {
    if (isPostgres) {
      const res = await pgPool.query('SELECT * FROM messages ORDER BY date DESC');
      return res.rows.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        service: m.service,
        message: m.message,
        date: m.date,
        read: Boolean(m.is_read)
      }));
    } else {
      const rows = sqliteDb.prepare('SELECT * FROM messages ORDER BY date DESC').all();
      return rows.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        service: m.service,
        message: m.message,
        date: m.date,
        read: Boolean(m.is_read)
      }));
    }
  },

  async addMessage(msg) {
    const id = 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const date = new Date().toISOString();
    const phone = msg.phone || 'No especificado';
    const service = msg.service || 'General';

    if (isPostgres) {
      await pgPool.query(
        'INSERT INTO messages (id, name, email, phone, service, message, date, is_read) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [id, msg.name, msg.email, phone, service, msg.message, date, false]
      );
    } else {
      sqliteDb.prepare(`
        INSERT INTO messages (id, name, email, phone, service, message, date, is_read)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `).run(id, msg.name, msg.email, phone, service, msg.message, date);
    }

    return { id, name: msg.name, email: msg.email, phone, service, message: msg.message, date, read: false };
  },

  async markMessageRead(id, isRead = true) {
    if (isPostgres) {
      const res = await pgPool.query(
        'UPDATE messages SET is_read = $1 WHERE id = $2 RETURNING *',
        [Boolean(isRead), id]
      );
      if (res.rows.length === 0) return null;
      const m = res.rows[0];
      return { id: m.id, read: Boolean(m.is_read) };
    } else {
      const info = sqliteDb.prepare('UPDATE messages SET is_read = ? WHERE id = ?').run(isRead ? 1 : 0, id);
      if (info.changes === 0) return null;
      return { id, read: Boolean(isRead) };
    }
  },

  async deleteMessage(id) {
    if (isPostgres) {
      const res = await pgPool.query('DELETE FROM messages WHERE id = $1', [id]);
      return res.rowCount > 0;
    } else {
      const info = sqliteDb.prepare('DELETE FROM messages WHERE id = ?').run(id);
      return info.changes > 0;
    }
  },

  // Projects
  async getProjects() {
    if (isPostgres) {
      const res = await pgPool.query('SELECT * FROM projects ORDER BY created_at DESC');
      return res.rows.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        client: p.client,
        description: p.description,
        image: p.image,
        featured: Boolean(p.featured),
        createdAt: p.created_at
      }));
    } else {
      const rows = sqliteDb.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
      return rows.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        client: p.client,
        description: p.description,
        image: p.image,
        featured: Boolean(p.featured),
        createdAt: p.created_at
      }));
    }
  },

  async addProject(project) {
    const id = 'proj-' + Date.now();
    const createdAt = new Date().toISOString();
    const client = project.client || 'Cliente confidencial';
    const image = project.image || '/img/servicio-logos.jpg';

    if (isPostgres) {
      await pgPool.query(
        'INSERT INTO projects (id, title, category, client, description, image, featured, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [id, project.title, project.category, client, project.description, image, true, createdAt]
      );
    } else {
      sqliteDb.prepare(`
        INSERT INTO projects (id, title, category, client, description, image, featured, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?)
      `).run(id, project.title, project.category, client, project.description, image, createdAt);
    }

    return {
      id,
      title: project.title,
      category: project.category,
      client,
      description: project.description,
      image,
      featured: true,
      createdAt
    };
  },

  async deleteProject(id) {
    if (isPostgres) {
      const res = await pgPool.query('DELETE FROM projects WHERE id = $1', [id]);
      return res.rowCount > 0;
    } else {
      const info = sqliteDb.prepare('DELETE FROM projects WHERE id = ?').run(id);
      return info.changes > 0;
    }
  }
};

module.exports = db;
