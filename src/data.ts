import { Project, Skill, Experience } from './types';

export const projectsData: Project[] = [
  {
    id: '1',
    title: 'Orbit - Moteur d\'Interface Collaboratif',
    description: 'Une plateforme SaaS de prototypage et de collaboration d\'interface en temps réel basée sur WebSockets.',
    longDescription: 'Orbit redéfinit les espaces de travail de conception de code. Il permet à plusieurs développeurs et designers de manipuler des composants de l\'interface utilisateur en temps réel, de synchroniser l\'état via des WebSockets haute performance et de générer du code React/Tailwind nettoyé instantanément.',
    category: 'Fullstack',
    tags: ['React', 'Node.js', 'WebSockets', 'Tailwind CSS', 'Framer Motion'],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    demoUrl: '#',
    githubUrl: '#',
    featured: true,
    role: 'Lead Fullstack Developer'
  },
  {
    id: '2',
    title: 'Aura - Streaming Audio Décentralisé',
    description: 'Une application Web3 de streaming musical qui rémunère équitablement les créateurs via des protocoles intelligents.',
    longDescription: 'Aura élimine les intermédiaires de diffusion. Grâce aux contrats intelligents sur le réseau Ethereum, chaque écoute déclenche un micro-paiement direct à l\'artiste. Comprend un lecteur audio hautement personnalisé et réactif.',
    category: 'Web3',
    tags: ['Solidity', 'Ethers.js', 'Next.js', 'Tailwind', 'Motion'],
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
    demoUrl: '#',
    githubUrl: '#',
    featured: true,
    role: 'Blockchain & Frontend Engineer'
  },
  {
    id: '3',
    title: 'Helix - Client GUI Redis ultra-rapide',
    description: 'Un outil de bureau moderne pour visualiser, éditer et surveiller efficacement les bases de données Redis.',
    longDescription: 'Helix est un compagnon de développement moderne conçu pour les ingénieurs système. Il propose une recherche instantanée, des visualisations graphiques de la mémoire, un tableau de bord de performance en direct et un éditeur de clés intuitif, le tout enveloppé dans une esthétique cyberpunk.',
    category: 'Frontend',
    tags: ['TypeScript', 'React', 'Tauri', 'Recharts', 'Tailwind'],
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    demoUrl: '#',
    githubUrl: '#',
    featured: false,
    role: 'UI/UX Creator'
  },
  {
    id: '4',
    title: 'Synthetix - Synthétiseur Audio Interactif',
    description: 'Une console audio web interactive permettant de composer des mélodies en manipulant des ondes géométriques.',
    longDescription: 'Synthetix exploite l\'API Web Audio pour créer un synthétiseur modulaire complet utilisable en ligne. L\'utilisateur manipule un canevas interactif pour altérer les fréquences, les filtres et les harmoniques avec un retour visuel en temps réel.',
    category: 'Frontend',
    tags: ['HTML5 Web Audio', 'React', 'Canvas', 'TypeScript', 'Motion'],
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
    demoUrl: '#',
    githubUrl: '#',
    featured: false,
    role: 'Creative Developer'
  }
];

export const skillsData: Skill[] = [
  // Frontend
  { name: 'React / Next.js', level: 95, category: 'Frontend', icon: 'ReactIcon' },
  { name: 'TypeScript', level: 90, category: 'Frontend', icon: 'FileCodeIcon' },
  { name: 'Tailwind CSS', level: 98, category: 'Frontend', icon: 'PaletteIcon' },
  { name: 'Framer Motion', level: 92, category: 'Frontend', icon: 'SparklesIcon' },
  
  // Backend
  { name: 'Node.js / Express', level: 88, category: 'Backend', icon: 'ServerIcon' },
  { name: 'GraphQL / REST APIs', level: 85, category: 'Backend', icon: 'CpuIcon' },
  { name: 'PostgreSQL & Prisma', level: 80, category: 'Backend', icon: 'DatabaseIcon' },
  { name: 'Redis', level: 75, category: 'Backend', icon: 'LayersIcon' },
  
  // DevOps & Tools
  { name: 'Docker', level: 82, category: 'DevOps & Tools', icon: 'BoxIcon' },
  { name: 'CI/CD & GitHub Actions', level: 78, category: 'DevOps & Tools', icon: 'WorkflowIcon' },
  { name: 'Vercel / AWS', level: 80, category: 'DevOps & Tools', icon: 'CloudIcon' },
  { name: 'Git & Terminal', level: 95, category: 'DevOps & Tools', icon: 'TerminalIcon' },

  // Languages
  { name: 'HTML5 / CSS3', level: 95, category: 'Languages', icon: 'CodeIcon' },
  { name: 'JavaScript ES6+', level: 95, category: 'Languages', icon: 'BracesIcon' },
  { name: 'Python', level: 70, category: 'Languages', icon: 'BinaryIcon' }
];

export const experiencesData: Experience[] = [
  {
    id: 'exp1',
    role: 'Ingénieur Frontend Creative',
    company: 'PixelForge Studios',
    duration: '2024 - Présent',
    description: [
      'Conception et développement d\'expériences immersives 3D et 2D pour des clients internationaux.',
      'Optimisation des performances de rendu de pages complexes, augmentant le score Lighthouse de 65 à 95+.',
      'Mise en place de systèmes de design unifiés réutilisables basés sur Tailwind CSS et React.'
    ],
    skills: ['React', 'Next.js', 'Framer Motion', 'Tailwind', 'Performance']
  },
  {
    id: 'exp2',
    role: 'Développeur Fullstack React / Node',
    company: 'NexusTech SaaS Solutions',
    duration: '2022 - 2024',
    description: [
      'Ingénierie de fonctionnalités collaboratives sur un outil d\'automatisation d\'entreprise.',
      'Conception d\'API RESTful robustes gérant plus de 10k requêtes par minute en production.',
      'Mise à niveau de la base de code existante vers TypeScript, améliorant la stabilité du produit.'
    ],
    skills: ['Node.js', 'Express', 'TypeScript', 'PostgreSQL', 'Docker']
  },
  {
    id: 'exp3',
    role: 'Développeur UI Junior',
    company: 'Novative Code',
    duration: '2020 - 2022',
    description: [
      'Intégration d\'interfaces responsives au pixel près à partir de maquettes Figma complexes.',
      'Création de microsites interactifs événementiels fluides et animés.',
      'Participation aux revues de code et amélioration de l\'accessibilité numérique (WCAG).'
    ],
    skills: ['JavaScript', 'HTML/CSS', 'Responsive Design', 'Sass', 'Figma']
  }
];
