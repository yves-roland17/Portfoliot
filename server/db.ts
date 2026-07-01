import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.json');

interface Profile {
  id: number;
  name: string;
  title: string;
  photo: string;
  email: string;
  location: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  tags: string;
  image: string;
  demoUrl: string;
  githubUrl: string;
  featured: number;
  role: string;
}

interface Skill {
  name: string;
  level: number;
  category: string;
  icon: string;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}

interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string; // Store as comma/newline separated string or JSON string to replicate typical table entries
  skills: string; // Store as comma/newline separated string
}

interface Category {
  id: string;
  name: string;
}

interface DatabaseState {
  profile: Profile[];
  projects: Project[];
  skills: Skill[];
  contacts: Contact[];
  experiences: Experience[];
  categories: Category[];
}

let dbData: DatabaseState = {
  profile: [],
  projects: [],
  skills: [],
  contacts: [],
  experiences: [],
  categories: []
};

let writing = false;
let writeQueue: (() => void)[] = [];

async function saveDb() {
  if (writing) {
    return new Promise<void>((resolve) => {
      writeQueue.push(resolve);
    });
  }
  writing = true;
  try {
    await fs.writeFile(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write database.json:', err);
  } finally {
    writing = false;
    if (writeQueue.length > 0) {
      const next = writeQueue.shift();
      if (next) {
        next();
      }
    }
  }
}

async function loadDb() {
  try {
    const content = await fs.readFile(dbPath, 'utf8');
    dbData = JSON.parse(content);
    if (!dbData.profile) dbData.profile = [];
    if (!dbData.projects) dbData.projects = [];
    if (!dbData.skills) dbData.skills = [];
    if (!dbData.contacts) dbData.contacts = [];
    if (!dbData.experiences) dbData.experiences = [];
    if (!dbData.categories) dbData.categories = [];
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      console.error('Failed to read database.json:', err);
    }
  }
}

export async function run(sql: string, params: any[] = []): Promise<{ id: number; changes: number }> {
  await loadDb();
  let changes = 0;
  let lastID = 0;

  const sqlNormalized = sql.trim().replace(/\s+/g, ' ');

  // 1. UPDATE profile
  if (/UPDATE profile SET/i.test(sqlNormalized)) {
    const [name, title, photo, email, location, id] = params;
    const item = dbData.profile.find(p => p.id === Number(id));
    if (item) {
      item.name = name;
      item.title = title;
      item.photo = photo;
      item.email = email;
      item.location = location;
      changes = 1;
      lastID = id;
    }
  }
  // 2. INSERT INTO profile
  else if (/INSERT INTO profile/i.test(sqlNormalized)) {
    const [name, title, photo, email, location] = params;
    const newId = dbData.profile.length > 0 ? Math.max(...dbData.profile.map(p => p.id)) + 1 : 1;
    dbData.profile.push({ id: newId, name, title, photo, email, location });
    changes = 1;
    lastID = newId;
  }
  // 3. UPDATE projects
  else if (/UPDATE projects SET/i.test(sqlNormalized)) {
    const [title, description, longDescription, category, tags, image, demoUrl, githubUrl, featured, role, id] = params;
    const item = dbData.projects.find(p => p.id === String(id));
    if (item) {
      item.title = title;
      item.description = description;
      item.longDescription = longDescription;
      item.category = category;
      item.tags = tags;
      item.image = image;
      item.demoUrl = demoUrl;
      item.githubUrl = githubUrl;
      item.featured = featured;
      item.role = role;
      changes = 1;
    }
  }
  // 4. INSERT INTO projects
  else if (/INSERT INTO projects/i.test(sqlNormalized)) {
    const [id, title, description, longDescription, category, tags, image, demoUrl, githubUrl, featured, role] = params;
    dbData.projects.push({ id: String(id), title, description, longDescription, category, tags, image, demoUrl, githubUrl, featured, role });
    changes = 1;
  }
  // 5. DELETE FROM projects WHERE id = ?
  else if (/DELETE FROM projects WHERE id = \?/i.test(sqlNormalized)) {
    const [id] = params;
    const initialLen = dbData.projects.length;
    dbData.projects = dbData.projects.filter(p => p.id !== String(id));
    changes = initialLen - dbData.projects.length;
  }
  // 6. UPDATE skills
  else if (/UPDATE skills SET/i.test(sqlNormalized)) {
    const [level, category, icon, name] = params;
    const item = dbData.skills.find(s => s.name === name);
    if (item) {
      item.level = level;
      item.category = category;
      item.icon = icon;
      changes = 1;
    }
  }
  // 7. INSERT INTO skills
  else if (/INSERT INTO skills/i.test(sqlNormalized)) {
    const [name, level, category, icon] = params;
    dbData.skills.push({ name, level, category, icon });
    changes = 1;
  }
  // 8. DELETE FROM skills WHERE name = ?
  else if (/DELETE FROM skills WHERE name = \?/i.test(sqlNormalized)) {
    const [name] = params;
    const initialLen = dbData.skills.length;
    dbData.skills = dbData.skills.filter(s => s.name !== name);
    changes = initialLen - dbData.skills.length;
  }
  // 9. INSERT INTO contacts
  else if (/INSERT INTO contacts/i.test(sqlNormalized)) {
    const [name, email, subject, message] = params;
    const newId = dbData.contacts.length > 0 ? Math.max(...dbData.contacts.map(c => c.id)) + 1 : 1;
    dbData.contacts.push({
      id: newId,
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString()
    });
    changes = 1;
    lastID = newId;
  }
  // 10. UPDATE experiences
  else if (/UPDATE experiences SET/i.test(sqlNormalized)) {
    const [role, company, duration, description, skills, id] = params;
    const item = dbData.experiences.find(e => e.id === String(id));
    if (item) {
      item.role = role;
      item.company = company;
      item.duration = duration;
      item.description = description;
      item.skills = skills;
      changes = 1;
    }
  }
  // 11. INSERT INTO experiences
  else if (/INSERT INTO experiences/i.test(sqlNormalized)) {
    const [id, role, company, duration, description, skills] = params;
    dbData.experiences.push({ id: String(id), role, company, duration, description, skills });
    changes = 1;
  }
  // 12. DELETE FROM experiences WHERE id = ?
  else if (/DELETE FROM experiences WHERE id = \?/i.test(sqlNormalized)) {
    const [id] = params;
    const initialLen = dbData.experiences.length;
    dbData.experiences = dbData.experiences.filter(e => e.id !== String(id));
    changes = initialLen - dbData.experiences.length;
  }
  // 13. UPDATE categories
  else if (/UPDATE categories SET/i.test(sqlNormalized)) {
    const [name, id] = params;
    const item = dbData.categories.find(c => c.id === String(id));
    if (item) {
      item.name = name;
      changes = 1;
    }
  }
  // 14. INSERT INTO categories
  else if (/INSERT INTO categories/i.test(sqlNormalized)) {
    const [id, name] = params;
    dbData.categories.push({ id: String(id), name });
    changes = 1;
  }
  // 15. DELETE FROM categories WHERE id = ?
  else if (/DELETE FROM categories WHERE id = \?/i.test(sqlNormalized)) {
    const [id] = params;
    const initialLen = dbData.categories.length;
    dbData.categories = dbData.categories.filter(c => c.id !== String(id));
    changes = initialLen - dbData.categories.length;
  }

  await saveDb();
  return { id: lastID, changes };
}

export async function all(sql: string, params: any[] = []): Promise<any[]> {
  await loadDb();
  const sqlNormalized = sql.trim().replace(/\s+/g, ' ');

  // 1. SELECT COUNT
  if (/SELECT COUNT\(\*\) as count FROM (\w+)/i.test(sqlNormalized)) {
    const match = sqlNormalized.match(/SELECT COUNT\(\*\) as count FROM (\w+)/i);
    const tableName = match ? match[1].toLowerCase() : '';
    const list = (dbData as any)[tableName] || [];
    return [{ count: list.length }];
  }
  // 2. SELECT * FROM projects
  if (/SELECT \* FROM projects/i.test(sqlNormalized)) {
    return [...dbData.projects];
  }
  // 3. SELECT * FROM skills
  if (/SELECT \* FROM skills/i.test(sqlNormalized)) {
    return [...dbData.skills];
  }
  // 4. SELECT * FROM contacts
  if (/SELECT \* FROM contacts/i.test(sqlNormalized)) {
    return [...dbData.contacts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  // 5. SELECT * FROM experiences
  if (/SELECT \* FROM experiences/i.test(sqlNormalized)) {
    return [...dbData.experiences];
  }
  // 6. SELECT * FROM categories
  if (/SELECT \* FROM categories/i.test(sqlNormalized)) {
    return [...dbData.categories];
  }

  return [];
}

export async function get(sql: string, params: any[] = []): Promise<any> {
  await loadDb();
  const sqlNormalized = sql.trim().replace(/\s+/g, ' ');

  // 1. SELECT COUNT
  if (/SELECT COUNT\(\*\) as count FROM (\w+)/i.test(sqlNormalized)) {
    const match = sqlNormalized.match(/SELECT COUNT\(\*\) as count FROM (\w+)/i);
    const tableName = match ? match[1].toLowerCase() : '';
    const list = (dbData as any)[tableName] || [];
    return { count: list.length };
  }
  // 2. SELECT * FROM profile ORDER BY id DESC LIMIT 1
  if (/SELECT \* FROM profile ORDER BY id DESC LIMIT 1/i.test(sqlNormalized)) {
    return dbData.profile.length > 0 ? dbData.profile[dbData.profile.length - 1] : null;
  }
  // 3. SELECT id FROM profile LIMIT 1
  if (/SELECT id FROM profile LIMIT 1/i.test(sqlNormalized)) {
    return dbData.profile.length > 0 ? { id: dbData.profile[0].id } : null;
  }
  // 4. SELECT id FROM projects WHERE id = ?
  if (/SELECT .* FROM projects WHERE id = \?/i.test(sqlNormalized)) {
    const [id] = params;
    const item = dbData.projects.find(p => p.id === String(id));
    return item ? { id: item.id } : null;
  }
  // 5. SELECT name FROM skills WHERE name = ?
  if (/SELECT .* FROM skills WHERE name = \?/i.test(sqlNormalized)) {
    const [name] = params;
    const item = dbData.skills.find(s => s.name === name);
    return item ? { name: item.name } : null;
  }
  // 6. SELECT id FROM experiences WHERE id = ?
  if (/SELECT .* FROM experiences WHERE id = \?/i.test(sqlNormalized)) {
    const [id] = params;
    const item = dbData.experiences.find(e => e.id === String(id));
    return item ? { id: item.id } : null;
  }
  // 7. SELECT id FROM categories WHERE id = ?
  if (/SELECT .* FROM categories WHERE id = \?/i.test(sqlNormalized)) {
    const [id] = params;
    const item = dbData.categories.find(c => c.id === String(id));
    return item ? { id: item.id } : null;
  }

  return null;
}

export async function initDb() {
  await loadDb();

  // Seed default categories
  if (!dbData.categories || dbData.categories.length === 0) {
    dbData.categories = [
      { id: 'cat1', name: 'Frontend' },
      { id: 'cat2', name: 'Backend' },
      { id: 'cat3', name: 'DevOps & Tools' },
      { id: 'cat4', name: 'Languages' }
    ];
  }

  // Seed default structure
  if (dbData.profile.length === 0) {
    dbData.profile.push({
      id: 1,
      name: 'Tia Doueu',
      title: 'Architecte Logiciel & Développeur Web',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      email: 'doueu.tia@uvci.edu.ci',
      location: 'Abidjan, Côte d\'Ivoire'
    });
  }

  if (dbData.projects.length === 0) {
    dbData.projects = [
      {
        id: '1',
        title: 'Orbit - Moteur d\'Interface Collaboratif',
        description: 'Une plateforme SaaS de prototypage et de collaboration d\'interface en temps réel basée sur WebSockets.',
        longDescription: 'Orbit redéfinit les espaces de travail de conception de code. Il permet à plusieurs développeurs et designers de manipuler des composants de l\'interface utilisateur en temps réel, de synchroniser l\'état via des WebSockets haute performance et de générer du code React/Tailwind nettoyé instantanément.',
        category: 'Fullstack',
        tags: 'React, Node.js, WebSockets, Tailwind CSS, Framer Motion',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        demoUrl: '#',
        githubUrl: '#',
        featured: 1,
        role: 'Lead Fullstack Developer'
      },
      {
        id: '2',
        title: 'Aura - Streaming Audio Décentralisé',
        description: 'Une application Web3 de streaming musical qui rémunère équitablement les créateurs via des protocoles intelligents.',
        longDescription: 'Aura élimine les intermédiaires de diffusion. Grâce aux contrats intelligents sur le réseau Ethereum, chaque écoute déclenche un micro-paiement direct à l\'artiste. Comprend un lecteur audio hautement personnalisé et réactif.',
        category: 'Web3',
        tags: 'Solidity, Ethers.js, Next.js, Tailwind, Motion',
        image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
        demoUrl: '#',
        githubUrl: '#',
        featured: 1,
        role: 'Blockchain & Frontend Engineer'
      },
      {
        id: '3',
        title: 'Helix - Client GUI Redis ultra-rapide',
        description: 'Un outil de bureau moderne pour visualiser, éditer et surveiller efficacement les bases de données Redis.',
        longDescription: 'Helix est un compagnon de développement moderne conçu pour les ingénieurs système. Il propose une recherche instantanée, des visualisations graphiques de la mémoire, un tableau de bord de performance en direct et un éditeur de clés intuitif, le tout enveloppé dans une esthétique cyberpunk.',
        category: 'Frontend',
        tags: 'TypeScript, React, Tauri, Recharts, Tailwind',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        demoUrl: '#',
        githubUrl: '#',
        featured: 0,
        role: 'UI/UX Creator'
      },
      {
        id: '4',
        title: 'Synthetix - Synthétiseur Audio Interactif',
        description: 'Une console audio web interactive permettant de composer des mélodies en manipulant des ondes géométriques.',
        longDescription: 'Synthetix exploite l\'API Web Audio pour créer un synthétiseur modulaire complet utilisable en ligne. L\'utilisateur manipule un canevas interactif pour altérer les fréquences, les filtres et les harmoniques avec un retour visuel en temps réel.',
        category: 'Frontend',
        tags: 'HTML5 Web Audio, React, Canvas, TypeScript, Motion',
        image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
        demoUrl: '#',
        githubUrl: '#',
        featured: 0,
        role: 'Creative Developer'
      }
    ];
  }

  if (dbData.skills.length === 0) {
    dbData.skills = [
      { name: 'React / Next.js', level: 95, category: 'Frontend', icon: 'ReactIcon' },
      { name: 'TypeScript', level: 90, category: 'Frontend', icon: 'FileCodeIcon' },
      { name: 'Tailwind CSS', level: 98, category: 'Frontend', icon: 'PaletteIcon' },
      { name: 'Framer Motion', level: 92, category: 'Frontend', icon: 'SparklesIcon' },
      { name: 'Node.js / Express', level: 88, category: 'Backend', icon: 'ServerIcon' },
      { name: 'GraphQL / REST APIs', level: 85, category: 'Backend', icon: 'CpuIcon' },
      { name: 'PostgreSQL & Prisma', level: 80, category: 'Backend', icon: 'DatabaseIcon' },
      { name: 'Redis', level: 75, category: 'Backend', icon: 'LayersIcon' },
      { name: 'Docker', level: 82, category: 'DevOps & Tools', icon: 'BoxIcon' },
      { name: 'CI/CD & GitHub Actions', level: 78, category: 'DevOps & Tools', icon: 'WorkflowIcon' },
      { name: 'Vercel / AWS', level: 80, category: 'DevOps & Tools', icon: 'CloudIcon' },
      { name: 'Git & Terminal', level: 95, category: 'DevOps & Tools', icon: 'TerminalIcon' },
      { name: 'HTML5 / CSS3', level: 95, category: 'Languages', icon: 'CodeIcon' },
      { name: 'JavaScript ES6+', level: 95, category: 'Languages', icon: 'BracesIcon' },
      { name: 'Python', level: 70, category: 'Languages', icon: 'BinaryIcon' }
    ];
  }

  if (dbData.experiences.length === 0) {
    dbData.experiences = [
      {
        id: 'exp1',
        role: 'Ingénieur Frontend Creative',
        company: 'PixelForge Studios',
        duration: '2024 - Présent',
        description: 'Conception et développement d\'expériences immersives 3D et 2D pour des clients internationaux.\nOptimisation des performances de rendu de pages complexes, augmentant le score Lighthouse de 65 à 95+.\nMise en place de systèmes de design unifiés réutilisables basés sur Tailwind CSS et React.',
        skills: 'React, Next.js, Framer Motion, Tailwind, Performance'
      },
      {
        id: 'exp2',
        role: 'Développeur Fullstack React / Node',
        company: 'NexusTech SaaS Solutions',
        duration: '2022 - 2024',
        description: 'Ingénierie de fonctionnalités collaboratives sur un outil d\'automatisation d\'entreprise.\nConception d\'API RESTful robustes gérant plus de 10k requêtes par minute en production.\nMise à niveau de la base de code existante vers TypeScript, améliorant la stabilité du produit.',
        skills: 'Node.js, Express, TypeScript, PostgreSQL, Docker'
      },
      {
        id: 'exp3',
        role: 'Développeur UI Junior',
        company: 'Novative Code',
        duration: '2020 - 2022',
        description: 'Intégration d\'interfaces responsives au pixel près à partir de maquettes Figma complexes.\nCréation de microsites interactifs événementiels fluides et animés.\nParticipation aux revues de code et amélioration de l\'accessibilité numérique (WCAG).',
        skills: 'JavaScript, HTML/CSS, Responsive Design, Sass, Figma'
      }
    ];
  }

  await saveDb();
}
