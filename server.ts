import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Module, Controller, Get, Post, Delete, Body, Param, Injectable, Inject, NestModule, MiddlewareConsumer } from '@nestjs/common';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import mysql from 'mysql2/promise';
import { initDb, run, all, get } from './server/db.js';

// RESILIENT DUAL-MODE DATABASE SERVICE (MYSQL EXCLUSIVE OR LOCAL FALLBACK)
@Injectable()
export class DatabaseService {
  private isMySQL = false;
  private pool: mysql.Pool | null = null;

  constructor() {
    this.initialize();
  }

  async initialize() {
    // 1. Initialize local JSON database/schema fallback first to ensure local data is populated
    try {
      console.log('[NestJS] Initializing local JSON database/schema fallback...');
      await initDb();
    } catch (e) {
      console.error('[NestJS] Local fallback database initialization error:', e);
    }

    // 2. Prepare MySQL connection options
    const mysqlUri = process.env.MYSQL_URI;
    const mysqlHost = process.env.MYSQL_HOST;

    let hasConfig = false;
    let poolConfig: mysql.PoolOptions = {
      connectTimeout: 5000,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    if (mysqlUri && mysqlUri.trim() !== '') {
      poolConfig.uri = mysqlUri;
      hasConfig = true;
    } else if (mysqlHost && mysqlHost.trim() !== '') {
      poolConfig.host = mysqlHost;
      poolConfig.port = Number(process.env.MYSQL_PORT || 3306);
      poolConfig.user = process.env.MYSQL_USER;
      poolConfig.password = process.env.MYSQL_PASSWORD;
      poolConfig.database = process.env.MYSQL_DATABASE;
      hasConfig = true;
    }

    // Auto-detect and configure SSL connection (required by Aiven and other managed MySQL cloud service providers)
    const isLocalhost = (mysqlHost && (mysqlHost.includes('localhost') || mysqlHost.includes('127.0.0.1'))) ||
                        (mysqlUri && (mysqlUri.includes('localhost') || mysqlUri.includes('127.0.0.1')));
    
    const isAiven = (mysqlHost && (mysqlHost.includes('aiven') || mysqlHost.includes('aivencloud.com'))) ||
                    (mysqlUri && (mysqlUri.includes('aiven') || mysqlUri.includes('aivencloud.com')));

    const forceSsl = process.env.MYSQL_SSL === 'true';

    // Enable SSL if forced, or is an Aiven host, or is an external connection
    if (hasConfig && (forceSsl || isAiven || (!isLocalhost && isLocalhost !== undefined))) {
      console.log('[NestJS] Setup: Enabling SSL/TLS connection options for Aiven / external managed MySQL database...');
      poolConfig.ssl = {
        rejectUnauthorized: false
      };
    }

    // 3. Attempt connection and migrations
    if (hasConfig) {
      try {
        console.log('[NestJS] Connecting to MySQL database...');
        this.pool = mysql.createPool(poolConfig);
        
        // Test connection
        const conn = await this.pool.getConnection();
        conn.release();

        console.log('[NestJS] SUCCESS: Connected to MySQL database.');

        // Initialize/Migrate tables on MySQL if they don't exist
        await this.runMigrations();

        this.isMySQL = true;

        // Seed default dataset inside MySQL if empty
        await this.seedMySQLIfEmpty();
      } catch (err: any) {
        console.error('[NestJS] ERROR: MySQL connection failed. Falling back to local JSON database.', err.message);
        this.isMySQL = false;
        this.pool = null;
      }
    } else {
      console.log('[NestJS] NOTICE: No MySQL environment variables config detected. Carrying on with local JSON database fallback.');
      this.isMySQL = false;
    }
  }

  private async runMigrations() {
    if (!this.pool) return;
    console.log('[NestJS] Verification of tables (migrations) inside MySQL database...');
    
    // Profile table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS profile (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        title VARCHAR(255),
        photo LONGTEXT,
        email VARCHAR(255),
        location VARCHAR(255)
      ) ENGINE=InnoDB;
    `);
    try {
      await this.pool.query('ALTER TABLE profile MODIFY COLUMN photo LONGTEXT;');
    } catch (e) {
      console.warn('[NestJS] Could not alter profile photo column to LONGTEXT:', e);
    }

    // Projects table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        longDescription TEXT,
        category VARCHAR(100),
        tags TEXT,
        image LONGTEXT,
        demoUrl VARCHAR(1000),
        githubUrl VARCHAR(1000),
        featured INT DEFAULT 0,
        role VARCHAR(255)
      ) ENGINE=InnoDB;
    `);
    try {
      await this.pool.query('ALTER TABLE projects MODIFY COLUMN image LONGTEXT;');
    } catch (e) {
      console.warn('[NestJS] Could not alter projects image column to LONGTEXT:', e);
    }

    // Skills table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS skills (
        name VARCHAR(255) PRIMARY KEY,
        level INT,
        category VARCHAR(100),
        icon VARCHAR(100)
      ) ENGINE=InnoDB;
    `);

    // Experiences table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS experiences (
        id VARCHAR(50) PRIMARY KEY,
        role VARCHAR(255),
        company VARCHAR(255),
        duration VARCHAR(100),
        description TEXT,
        skills TEXT
      ) ENGINE=InnoDB;
    `);

    // Contacts table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        subject VARCHAR(255),
        message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    
    console.log('[NestJS] Tables successfully checked/created.');
  }

  private async seedMySQLIfEmpty() {
    if (!this.pool) return;
    try {
      // 1. Seed Profile
      const [rowsProfile]: any = await this.pool.query('SELECT COUNT(*) as count FROM profile');
      if (rowsProfile && rowsProfile[0] && rowsProfile[0].count === 0) {
        console.log('[NestJS] Seeding empty MySQL with default profile setup...');
        await this.pool.query(
          'INSERT INTO profile (name, title, photo, email, location) VALUES (?, ?, ?, ?, ?)',
          [
            'Tia Doueu',
            'Architecte Logiciel & Développeur Web',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
            'doueu.tia@uvci.edu.ci',
            'Abidjan, Côte d\'Ivoire'
          ]
        );
      }

      // 2. Seed Projects
      const [rowsProjects]: any = await this.pool.query('SELECT COUNT(*) as count FROM projects');
      if (rowsProjects && rowsProjects[0] && rowsProjects[0].count === 0) {
        console.log('[NestJS] Seeding empty MySQL with default projects list...');
        const initialProjects = [
          [
            '1',
            'Orbit - Moteur d\'Interface Collaboratif',
            'Une plateforme SaaS de prototypage et de collaboration d\'interface en temps réel basée sur WebSockets.',
            'Orbit redéfinit les espaces de travail de conception de code. Il permet à plusieurs développeurs et designers de manipuler des composants de l\'interface utilisateur en temps réel, de synchroniser l\'état via des WebSockets haute performance et de générer du code React/Tailwind nettoyé instantanément.',
            'Fullstack',
            'React, Node.js, WebSockets, Tailwind CSS, Framer Motion',
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
            '#',
            '#',
            1,
            'Lead Fullstack Developer'
          ],
          [
            '2',
            'Aura - Streaming Audio Décentralisé',
            'Une application Web3 de streaming musical qui rémunère équitablement les créateurs via des protocoles intelligents.',
            'Aura élimine les intermédiaires de diffusion. Grâce aux contrats intelligents sur le réseau Ethereum, chaque écoute déclenche un micro-paiement direct à l\'artiste. Comprend un lecteur audio hautement personnalisé et réactif.',
            'Web3',
            'Solidity, Ethers.js, Next.js, Tailwind, Motion',
            'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
            '#',
            '#',
            1,
            'Blockchain & Frontend Engineer'
          ],
          [
            '3',
            'Helix - Client GUI Redis ultra-rapide',
            'Un outil de bureau moderne pour visualiser, éditer et surveiller efficacement les bases de données Redis.',
            'Helix est un compagnon de développement moderne conçu pour les ingénieurs système. Il propose une recherche instantanée, des visualisations graphiques de la mémoire, un tableau de bord de performance en direct et un éditeur de clés intuitif, le tout enveloppé dans une esthétique cyberpunk.',
            'Frontend',
            'TypeScript, React, Tauri, Recharts, Tailwind',
            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
            '#',
            '#',
            0,
            'UI/UX Creator'
          ],
          [
            '4',
            'Synthetix - Synthétiseur Audio Interactif',
            'Une console audio web interactive permettant de composer des mélodies en manipulant des ondes géométriques.',
            'Synthetix exploite l\'API Web Audio pour créer un synthétiseur modulaire complet utilisable en ligne. L\'utilisateur manipule un canevas interactif pour altérer les fréquences, les filtres et les harmoniques avec un retour visuel en temps réel.',
            'Frontend',
            'HTML5 Web Audio, React, Canvas, TypeScript, Motion',
            'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
            '#',
            '#',
            0,
            'Creative Developer'
          ]
        ];
        for (const proj of initialProjects) {
          await this.pool.query(
            'INSERT INTO projects (id, title, description, longDescription, category, tags, image, demoUrl, githubUrl, featured, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            proj
          );
        }
      }

      // 3. Seed Skills
      const [rowsSkills]: any = await this.pool.query('SELECT COUNT(*) as count FROM skills');
      if (rowsSkills && rowsSkills[0] && rowsSkills[0].count === 0) {
        console.log('[NestJS] Seeding empty MySQL with default skill items...');
        const initialSkills = [
          ['React / Next.js', 95, 'Frontend', 'ReactIcon'],
          ['TypeScript', 90, 'Frontend', 'FileCodeIcon'],
          ['Tailwind CSS', 98, 'Frontend', 'PaletteIcon'],
          ['Framer Motion', 92, 'Frontend', 'SparklesIcon'],
          ['Node.js / Express', 88, 'Backend', 'ServerIcon'],
          ['GraphQL / REST APIs', 85, 'Backend', 'CpuIcon'],
          ['PostgreSQL & Prisma', 80, 'Backend', 'DatabaseIcon'],
          ['Redis', 75, 'Backend', 'LayersIcon'],
          ['Docker', 82, 'DevOps & Tools', 'BoxIcon'],
          ['CI/CD & GitHub Actions', 78, 'DevOps & Tools', 'WorkflowIcon'],
          ['Vercel / AWS', 80, 'DevOps & Tools', 'CloudIcon'],
          ['Git & Terminal', 95, 'DevOps & Tools', 'TerminalIcon'],
          ['HTML5 / CSS3', 95, 'Languages', 'CodeIcon'],
          ['JavaScript ES6+', 95, 'Languages', 'BracesIcon'],
          ['Python', 70, 'Languages', 'BinaryIcon']
        ];
        for (const skill of initialSkills) {
          await this.pool.query(
            'INSERT INTO skills (name, level, category, icon) VALUES (?, ?, ?, ?)',
            skill
          );
        }
      }

      // 4. Seed Experiences
      const [rowsExperiences]: any = await this.pool.query('SELECT COUNT(*) as count FROM experiences');
      if (rowsExperiences && rowsExperiences[0] && rowsExperiences[0].count === 0) {
        console.log('[NestJS] Seeding empty MySQL with default experiences...');
        const initialExperiences = [
          [
            'exp1',
            'Ingénieur Frontend Creative',
            'PixelForge Studios',
            '2024 - Présent',
            'Conception et développement d\'expériences immersives 3D et 2D pour des clients internationaux.\nOptimisation des performances de rendu de pages complexes, augmentant le score Lighthouse de 65 à 95+.\nMise en place de systèmes de design unifiés réutilisables basés sur Tailwind CSS et React.',
            'React, Next.js, Framer Motion, Tailwind, Performance'
          ],
          [
            'exp2',
            'Développeur Fullstack React / Node',
            'NexusTech SaaS Solutions',
            '2022 - 2024',
            'Ingénierie de fonctionnalités collaboratives sur un outil d\'automatisation d\'entreprise.\nConception d\'API RESTful robustes gérant plus de 10k requêtes par minute en production.\nMise à niveau de la base de code existante vers TypeScript, améliorant la stabilité du produit.',
            'Node.js, Express, TypeScript, PostgreSQL, Docker'
          ],
          [
            'exp3',
            'Développeur UI Junior',
            'Novative Code',
            '2020 - 2022',
            'Intégration d\'interfaces responsives au pixel près à partir de maquettes Figma complexes.\nCréation de microsites interactifs événementiels fluides et animés.\nParticipation aux revues de code et amélioration de l\'accessibilité numérique (WCAG).',
            'JavaScript, HTML/CSS, Responsive Design, Sass, Figma'
          ]
        ];
        for (const exp of initialExperiences) {
          await this.pool.query(
            'INSERT INTO experiences (id, role, company, duration, description, skills) VALUES (?, ?, ?, ?, ?, ?)',
            exp
          );
        }
      }
    } catch (e) {
      console.error('[NestJS] Error seeding default MySQL items:', e);
    }
  }

  // Profile methods
  async getProfile() {
    if (this.isMySQL && this.pool) {
      try {
        const [rows]: any = await this.pool.query('SELECT * FROM profile ORDER BY id DESC LIMIT 1');
        return rows[0] || {};
      } catch (err) {
        console.error('[NestJS] MySQL query error in getProfile:', err);
      }
    }
    return await get('SELECT * FROM profile ORDER BY id DESC LIMIT 1') || {};
  }

  async updateProfile(data: any) {
    if (this.isMySQL && this.pool) {
      try {
        const [rows]: any = await this.pool.query('SELECT id FROM profile LIMIT 1');
        if (rows && rows.length > 0) {
          await this.pool.query(
            'UPDATE profile SET name = ?, title = ?, photo = ?, email = ?, location = ? WHERE id = ?',
            [data.name, data.title, data.photo, data.email, data.location, rows[0].id]
          );
        } else {
          await this.pool.query(
            'INSERT INTO profile (name, title, photo, email, location) VALUES (?, ?, ?, ?, ?)',
            [data.name, data.title, data.photo, data.email, data.location]
          );
        }
        return { success: true };
      } catch (err) {
        console.error('[NestJS] MySQL query error in updateProfile:', err);
      }
    }
    // JSON fallback
    const row = await get('SELECT id FROM profile LIMIT 1');
    if (row) {
      await run(
        'UPDATE profile SET name = ?, title = ?, photo = ?, email = ?, location = ? WHERE id = ?',
        [data.name, data.title, data.photo, data.email, data.location, row.id]
      );
    } else {
      await run(
        'INSERT INTO profile (name, title, photo, email, location) VALUES (?, ?, ?, ?, ?)',
        [data.name, data.title, data.photo, data.email, data.location]
      );
    }
    return { success: true };
  }

  // Projects methods
  async getProjects() {
    if (this.isMySQL && this.pool) {
      try {
        const [rows] = await this.pool.query('SELECT * FROM projects');
        return rows;
      } catch (err) {
        console.error('[NestJS] MySQL query error in getProjects:', err);
      }
    }
    return await all('SELECT * FROM projects');
  }

  async saveProject(data: any) {
    if (this.isMySQL && this.pool) {
      try {
        const [exists]: any = await this.pool.query('SELECT id FROM projects WHERE id = ?', [data.id]);
        if (exists && exists.length > 0) {
          await this.pool.query(
            'UPDATE projects SET title = ?, description = ?, longDescription = ?, category = ?, tags = ?, image = ?, demoUrl = ?, githubUrl = ?, featured = ?, role = ? WHERE id = ?',
            [data.title, data.description, data.longDescription, data.category, data.tags, data.image, data.demoUrl, data.githubUrl, data.featured ? 1 : 0, data.role, data.id]
          );
        } else {
          await this.pool.query(
            'INSERT INTO projects (id, title, description, longDescription, category, tags, image, demoUrl, githubUrl, featured, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [data.id, data.title, data.description, data.longDescription, data.category, data.tags, data.image, data.demoUrl, data.githubUrl, data.featured ? 1 : 0, data.role]
          );
        }
        return { success: true };
      } catch (err) {
        console.error('[NestJS] MySQL query error in saveProject:', err);
      }
    }
    // Fallback
    const exists = await get('SELECT id FROM projects WHERE id = ?', [data.id]);
    if (exists) {
      await run(
        'UPDATE projects SET title = ?, description = ?, longDescription = ?, category = ?, tags = ?, image = ?, demoUrl = ?, githubUrl = ?, featured = ?, role = ? WHERE id = ?',
        [data.title, data.description, data.longDescription, data.category, data.tags, data.image, data.demoUrl, data.githubUrl, data.featured ? 1 : 0, data.role, data.id]
      );
    } else {
      await run(
        'INSERT INTO projects (id, title, description, longDescription, category, tags, image, demoUrl, githubUrl, featured, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [data.id, data.title, data.description, data.longDescription, data.category, data.tags, data.image, data.demoUrl, data.githubUrl, data.featured ? 1 : 0, data.role]
      );
    }
    return { success: true };
  }

  async deleteProject(id: string) {
    if (this.isMySQL && this.pool) {
      try {
        await this.pool.query('DELETE FROM projects WHERE id = ?', [id]);
        return { success: true };
      } catch (err) {
        console.error('[NestJS] MySQL query error in deleteProject:', err);
      }
    }
    await run('DELETE FROM projects WHERE id = ?', [id]);
    return { success: true };
  }

  // Skills methods
  async getSkills() {
    if (this.isMySQL && this.pool) {
      try {
        const [rows] = await this.pool.query('SELECT * FROM skills');
        return rows;
      } catch (err) {
        console.error('[NestJS] MySQL query error in getSkills:', err);
      }
    }
    return await all('SELECT * FROM skills');
  }

  async saveSkill(data: any) {
    if (this.isMySQL && this.pool) {
      try {
        const [exists]: any = await this.pool.query('SELECT name FROM skills WHERE name = ?', [data.name]);
        if (exists && exists.length > 0) {
          await this.pool.query('UPDATE skills SET level = ?, category = ?, icon = ? WHERE name = ?', [data.level, data.category, data.icon, data.name]);
        } else {
          await this.pool.query('INSERT INTO skills (name, level, category, icon) VALUES (?, ?, ?, ?)', [data.name, data.level, data.category, data.icon]);
        }
        return { success: true };
      } catch (err) {
        console.error('[NestJS] MySQL query error in saveSkill:', err);
      }
    }
    // Fallback
    const exists = await get('SELECT name FROM skills WHERE name = ?', [data.name]);
    if (exists) {
      await run('UPDATE skills SET level = ?, category = ?, icon = ? WHERE name = ?', [data.level, data.category, data.icon, data.name]);
    } else {
      await run('INSERT INTO skills (name, level, category, icon) VALUES (?, ?, ?, ?)', [data.name, data.level, data.category, data.icon]);
    }
    return { success: true };
  }

  async deleteSkill(name: string) {
    if (this.isMySQL && this.pool) {
      try {
        await this.pool.query('DELETE FROM skills WHERE name = ?', [name]);
        return { success: true };
      } catch (err) {
        console.error('[NestJS] MySQL query error in deleteSkill:', err);
      }
    }
    await run('DELETE FROM skills WHERE name = ?', [name]);
    return { success: true };
  }

  // Experiences methods
  async getExperiences() {
    if (this.isMySQL && this.pool) {
      try {
        const [rows] = await this.pool.query('SELECT * FROM experiences');
        return rows;
      } catch (err) {
        console.error('[NestJS] MySQL query error in getExperiences:', err);
      }
    }
    return await all('SELECT * FROM experiences');
  }

  async saveExperience(data: any) {
    if (this.isMySQL && this.pool) {
      try {
        const [exists]: any = await this.pool.query('SELECT id FROM experiences WHERE id = ?', [data.id]);
        if (exists && exists.length > 0) {
          await this.pool.query(
            'UPDATE experiences SET role = ?, company = ?, duration = ?, description = ?, skills = ? WHERE id = ?',
            [data.role, data.company, data.duration, data.description, data.skills, data.id]
          );
        } else {
          await this.pool.query(
            'INSERT INTO experiences (id, role, company, duration, description, skills) VALUES (?, ?, ?, ?, ?, ?)',
            [data.id, data.role, data.company, data.duration, data.description, data.skills]
          );
        }
        return { success: true };
      } catch (err) {
        console.error('[NestJS] MySQL query error in saveExperience:', err);
      }
    }
    // Fallback
    const exists = await get('SELECT id FROM experiences WHERE id = ?', [data.id]);
    if (exists) {
      await run(
        'UPDATE experiences SET role = ?, company = ?, duration = ?, description = ?, skills = ? WHERE id = ?',
        [data.role, data.company, data.duration, data.description, data.skills, data.id]
      );
    } else {
      await run(
        'INSERT INTO experiences (id, role, company, duration, description, skills) VALUES (?, ?, ?, ?, ?, ?)',
        [data.id, data.role, data.company, data.duration, data.description, data.skills]
      );
    }
    return { success: true };
  }

  async deleteExperience(id: string) {
    if (this.isMySQL && this.pool) {
      try {
        await this.pool.query('DELETE FROM experiences WHERE id = ?', [id]);
        return { success: true };
      } catch (err) {
        console.error('[NestJS] MySQL query error in deleteExperience:', err);
      }
    }
    await run('DELETE FROM experiences WHERE id = ?', [id]);
    return { success: true };
  }

  // Contacts methods
  async getContacts() {
    if (this.isMySQL && this.pool) {
      try {
        const [rows] = await this.pool.query('SELECT * FROM contacts ORDER BY timestamp DESC');
        return rows;
      } catch (err) {
        console.error('[NestJS] MySQL query error in getContacts:', err);
      }
    }
    return await all('SELECT * FROM contacts ORDER BY timestamp DESC');
  }

  async saveContact(data: any) {
    let saved = false;
    if (this.isMySQL && this.pool) {
      try {
        await this.pool.query(
          'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
          [data.name, data.email, data.subject || '', data.message]
        );
        saved = true;
      } catch (err) {
        console.error('[NestJS] MySQL query error in saveContact:', err);
      }
    }
    
    if (!saved) {
      // Fallback
      await run(
        'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
        [data.name, data.email, data.subject || '', data.message]
      );
    }

    // Auto routing of email to roland.tia@epitech.eu asynchronously (non-blocking) in background
    if (data.autoSendEmail !== false) {
      const emailTo = 'roland.tia@epitech.eu';
      const msgData = {
        name: data.name,
        email: data.email,
        _subject: data.subject || 'Nouveau message de votre Portfolio',
        message: data.message,
        _honey: '' // Anti-spam honeypot
      };

      // Execute in background IIFE so it doesn't block the HTTP response
      (async () => {
        try {
          console.log('[NestJS] Background forwarding contact message to roland.tia@epitech.eu via FormSubmit...');
          const response = await fetch(`https://formsubmit.co/ajax/${emailTo}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(msgData)
          });
          const resBody = await response.json();
          console.log('[NestJS] FormSubmit background email sending result:', resBody);
        } catch (err) {
          console.error('[NestJS] Error forwarding email via FormSubmit in background:', err);
        }
      })();
    }

    return { success: true };
  }

  getDatabaseStatus() {
    return {
      isMySQL: this.isMySQL,
      isMongo: false,
      connectionState: this.isMySQL ? 1 : 0,
      connectionStateName: this.isMySQL ? 'connecté (MySQL)' : 'déconnecté',
      host: this.pool ? (process.env.MYSQL_HOST || 'via URI MySQL') : 'Aucun',
      databaseName: this.pool ? (process.env.MYSQL_DATABASE || 'Base MySQL') : 'Aucun'
    };
  }
}

// NESTJS CONTROLLER FOR REST APIS
@Controller('api')
export class ApiController {
  // Use explicit Inject statement to fully secure DI compilation in all bundlers (e.g. esbuild)
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService
  ) {}

  @Get('health')
  getHealth() {
    return { 
      status: 'ok', 
      engine: 'NestJS', 
      time: new Date(),
      database: this.dbService.getDatabaseStatus()
    };
  }

  // 1. Profile Endpoints
  @Get('profile')
  async getProfile() {
    return await this.dbService.getProfile();
  }

  @Post('profile')
  async updateProfile(@Body() body: any) {
    return await this.dbService.updateProfile(body);
  }

  // 2. Projects Endpoints
  @Get('projects')
  async getProjects() {
    const raw: any = await this.dbService.getProjects();
    return raw.map((r: any) => {
      const tags = r.tags ? (typeof r.tags === 'string' ? r.tags.split(',').map((t: string) => t.trim()) : r.tags) : [];
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        longDescription: r.longDescription,
        category: r.category,
        tags,
        image: r.image,
        demoUrl: r.demoUrl,
        githubUrl: r.githubUrl,
        featured: r.featured === 1 || r.featured === true,
        role: r.role
      };
    });
  }

  @Post('projects')
  async postProject(@Body() body: any) {
    const data = {
      ...body,
      tags: Array.isArray(body.tags) ? body.tags.join(', ') : body.tags
    };
    return await this.dbService.saveProject(data);
  }

  @Delete('projects/:id')
  async deleteProject(@Param('id') id: string) {
    return await this.dbService.deleteProject(id);
  }

  // 3. Skills Endpoints
  @Get('skills')
  async getSkills() {
    return await this.dbService.getSkills();
  }

  @Post('skills')
  async saveSkill(@Body() body: any) {
    return await this.dbService.saveSkill(body);
  }

  @Delete('skills/:name')
  async deleteSkill(@Param('name') name: string) {
    return await this.dbService.deleteSkill(name);
  }

  // 4. Experiences Endpoints
  @Get('experiences')
  async getExperiences() {
    const raw: any = await this.dbService.getExperiences();
    return raw.map((r: any) => {
      const description = r.description ? (typeof r.description === 'string' ? r.description.split('\n') : r.description) : [];
      const skills = r.skills ? (typeof r.skills === 'string' ? r.skills.split(',').map((s: string) => s.trim()) : r.skills) : [];
      return {
        id: r.id,
        role: r.role,
        company: r.company,
        duration: r.duration,
        description,
        skills
      };
    });
  }

  @Post('experiences')
  async postExperience(@Body() body: any) {
    const data = {
      ...body,
      description: Array.isArray(body.description) ? body.description.join('\n') : body.description,
      skills: Array.isArray(body.skills) ? body.skills.join(', ') : body.skills
    };
    return await this.dbService.saveExperience(data);
  }

  @Delete('experiences/:id')
  async deleteExperience(@Param('id') id: string) {
    return await this.dbService.deleteExperience(id);
  }

  // 5. Contacts Endpoints
  @Get('contacts')
  async getContacts() {
    return await this.dbService.getContacts();
  }

  @Post('contacts')
  async saveContact(@Body() body: any) {
    return await this.dbService.saveContact(body);
  }
}

// MAIN APP MODULE
@Module({
  controllers: [ApiController],
  providers: [DatabaseService],
})
export class AppModule {}

// NESTJS AND VITE BOOTSTRAPPER IN-PROCESS
async function startServer() {
  const PORT = 3000;
  
  // Create NestJS app instance with Express underlying engine
  const app = await NestFactory.create(AppModule);
  
  // Enable JSON request body parsing inside the Express engine with larger limits for base64 images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Set up front-end asset piping
  if (process.env.NODE_ENV !== 'production') {
    // Development Mode: Pipe incoming HTTP requests via Vite's real-time SPA middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    const expressInstance = app.getHttpAdapter().getInstance();
    expressInstance.use((req: any, res: any, next: any) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      vite.middlewares(req, res, next);
    });
  } else {
    // Production Mode: Serve standard built static files and map route fallbacks
    const distPath = path.join(process.cwd(), 'dist');
    const expressInstance = app.getHttpAdapter().getInstance();
    expressInstance.use(express.static(distPath));
    expressInstance.get('*all', (req, res, next) => {
      // Allow NestJS native routers handling of /api pathings
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind and boot the unified stack on Port 3000
  await app.listen(PORT, '0.0.0.0');
  console.log(`[NestJS] Unified backend server is now running on http://localhost:${PORT}`);
}

startServer();
