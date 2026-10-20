const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Check if PostgreSQL connection URL is provided
const isPostgres = Boolean(process.env.DATABASE_URL);

let pgPool = null;
let sqliteDb = null;

// Allowed admin emails (strict whitelist)
const ALLOWED_ADMIN_EMAILS = [
  'angelavalanta2009@gmail.com',
  'esenciadesign9@gmail.com'
];

// Initial seed data
const DEFAULT_ADMINS = [
  {
    id: 'admin-esencia',
    username: 'esenciadesign9@gmail.com',
    email: 'esenciadesign9@gmail.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    name: 'Sofía — Directora ESENCIA',
    role: 'admin'
  },
  {
    id: 'admin-personal',
    username: 'angelavalanta2009@gmail.com',
    email: 'angelavalanta2009@gmail.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    name: 'Angela Valanta — ESENCIA',
    role: 'admin'
  }
];

const DEFAULT_PROJECTS = [];

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

    // Ensure only authorized admin emails exist in PostgreSQL
    await pgPool.query('DELETE FROM users WHERE LOWER(email) != $1 AND LOWER(email) != $2', [
      ALLOWED_ADMIN_EMAILS[0],
      ALLOWED_ADMIN_EMAILS[1]
    ]);
    for (const admin of DEFAULT_ADMINS) {
      const existing = await pgPool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [admin.email]);
      if (existing.rows.length === 0) {
        await pgPool.query(
          'INSERT INTO users (id, username, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5, $6)',
          [admin.id, admin.username, admin.email, admin.passwordHash, admin.name, admin.role]
        );
        console.log(`✅ Administrador autorizado ${admin.email} registrado en PostgreSQL.`);
      }
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

    // Ensure only authorized admin emails exist in SQLite
    sqliteDb.prepare('DELETE FROM users WHERE LOWER(email) != ? AND LOWER(email) != ?').run(
      ALLOWED_ADMIN_EMAILS[0],
      ALLOWED_ADMIN_EMAILS[1]
    );
    for (const admin of DEFAULT_ADMINS) {
      const existing = sqliteDb.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(admin.email);
      if (!existing) {
        sqliteDb.prepare(`
          INSERT INTO users (id, username, email, password_hash, name, role)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(admin.id, admin.username, admin.email, admin.passwordHash, admin.name, admin.role);
        console.log(`✅ Administrador autorizado ${admin.email} registrado en SQLite.`);
      }
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
    const image = project.image || '/img/esencia-logo.png';

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
  },

  async getProjectById(id) {
    if (isPostgres) {
      const res = await pgPool.query('SELECT * FROM projects WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      const p = res.rows[0];
      return {
        id: p.id,
        title: p.title,
        category: p.category,
        client: p.client,
        description: p.description,
        image: p.image,
        featured: Boolean(p.featured),
        createdAt: p.created_at
      };
    } else {
      const p = sqliteDb.prepare('SELECT * FROM projects WHERE id = ?').get(id);
      if (!p) return null;
      return {
        id: p.id,
        title: p.title,
        category: p.category,
        client: p.client,
        description: p.description,
        image: p.image,
        featured: Boolean(p.featured),
        createdAt: p.created_at
      };
    }
  },

  async updateProject(id, project) {
    const title = (project.title || '').trim();
    const category = (project.category || '').trim();
    const client = (project.client || 'Cliente confidencial').trim();
    const description = (project.description || '').trim();
    const image = (project.image && project.image.trim()) ? project.image.trim() : '/img/esencia-logo.png';

    if (isPostgres) {
      const res = await pgPool.query(
        'UPDATE projects SET title = $1, category = $2, client = $3, description = $4, image = $5 WHERE id = $6',
        [title, category, client, description, image, id]
      );
      return res.rowCount > 0;
    } else {
      const info = sqliteDb.prepare(`
        UPDATE projects 
        SET title = ?, category = ?, client = ?, description = ?, image = ? 
        WHERE id = ?
      `).run(title, category, client, description, image, id);
      return info.changes > 0;
    }
  },

  ALLOWED_ADMIN_EMAILS,

  isEmailAllowed(email) {
    if (!email) return false;
    return ALLOWED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
  },

  async updatePasswordByEmail(email, newPassword) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!ALLOWED_ADMIN_EMAILS.includes(cleanEmail)) return false;
    const hash = bcrypt.hashSync(newPassword, 10);
    if (isPostgres) {
      const res = await pgPool.query('UPDATE users SET password_hash = $1 WHERE LOWER(email) = LOWER($2)', [hash, cleanEmail]);
      return res.rowCount > 0;
    } else {
      const info = sqliteDb.prepare('UPDATE users SET password_hash = ? WHERE LOWER(email) = LOWER(?)').run(hash, cleanEmail);
      return info.changes > 0;
    }
  }
};

module.exports = db;
