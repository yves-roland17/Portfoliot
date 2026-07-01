import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Sparkles, LayoutGrid, Cpu, User, Plus, Trash2, Edit2, 
  Save, FolderHeart, ShieldAlert, KeyRound, AlertTriangle, Eye, Check,
  ExternalLink, Github, RefreshCw, ArrowRight, HelpCircle, Code, Briefcase,
  Camera
} from 'lucide-react';
import { Project, Skill, Experience as ExperienceType } from '../types';
import { UserProfile } from './ProfileModal';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  projects: Project[];
  onUpdateProjects: (proj: Project[]) => void;
  skills: Skill[];
  onUpdateSkills: (sk: Skill[]) => void;
  experiences: ExperienceType[];
  onUpdateExperiences: (exp: ExperienceType[]) => void;
  defaultAvatarUrl: string;
  onAuthChange?: (auth: boolean) => void;
}

export default function AdminPanel({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  projects,
  onUpdateProjects,
  skills,
  onUpdateSkills,
  experiences,
  onUpdateExperiences,
  defaultAvatarUrl,
  onAuthChange
}: AdminPanelProps) {
  // Simple password check for high-fidelity experience
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('td_dev_admin_auth') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'skills' | 'experiences'>('profile');

  // Custom non-blocking alert/confirm states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'project' | 'skill' | 'experience';
    id: string;
    title: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(current => current?.text === text ? null : current);
    }, 4000);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'project') {
      const updated = projects.filter(p => p.id !== deleteConfirm.id);
      onUpdateProjects(updated);
      showToast('Projet supprimé avec succès ! 🗑️', 'success');
    } else if (deleteConfirm.type === 'skill') {
      const updated = skills.filter(s => s.name !== deleteConfirm.id);
      onUpdateSkills(updated);
      showToast('Compétence supprimée avec succès ! 🗑️', 'success');
    } else if (deleteConfirm.type === 'experience') {
      const updated = experiences.filter(e => e.id !== deleteConfirm.id);
      onUpdateExperiences(updated);
      showToast('Expérience supprimée avec succès ! 🗑️', 'success');
    }

    setDeleteConfirm(null);
  };

  const [dbStatus, setDbStatus] = useState<{
    isMongo: boolean;
    isMySQL?: boolean;
    connectionState: number;
    connectionStateName: string;
    host: string;
    databaseName: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/health')
        .then(res => res.json())
        .then(data => {
          if (data && data.database) {
            setDbStatus(data.database);
          }
        })
        .catch(err => console.error('Erreur lors de la récupération du statut DB:', err));
    }
  }, [isOpen]);

  // FORM STATES

  // 1. Profile edit states
  const [profName, setProfName] = useState(profile.name);
  const [profTitle, setProfTitle] = useState(profile.title);
  const [profEmail, setProfEmail] = useState(profile.email);
  const [profLocation, setProfLocation] = useState(profile.location);
  const [profPhoto, setProfPhoto] = useState(profile.photo);

  // 2. Projects CRUD states
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projLongDesc, setProjLongDesc] = useState('');
  const [projCategory, setProjCategory] = useState<'Frontend' | 'Backend' | 'Fullstack' | 'Web3'>('Frontend');
  const [projTags, setProjTags] = useState('');
  const [projImage, setProjImage] = useState('');
  const [projDemoUrl, setProjDemoUrl] = useState('');
  const [projGithubUrl, setProjGithubUrl] = useState('');
  const [projFeatured, setProjFeatured] = useState(false);
  const [projRole, setProjRole] = useState('');
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isExtractingScreenshot, setIsExtractingScreenshot] = useState(false);
  const [screenshotService, setScreenshotService] = useState<'microlink' | 'thumio'>('microlink');

  // 3. Skills CRUD states
  const [editingSkillName, setEditingSkillName] = useState<string | null>(null);
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState<number>(80);
  const [skillCategory, setSkillCategory] = useState<'Frontend' | 'Backend' | 'DevOps & Tools' | 'Web Design' | 'Languages'>('Frontend');
  const [skillIcon, setSkillIcon] = useState('CodeIcon');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // 4. Experiences CRUD states
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [expRole, setExpRole] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expDuration, setExpDuration] = useState('');
  const [expDescription, setExpDescription] = useState(''); // Newline separated points
  const [expSkills, setExpSkills] = useState(''); // Comma separated tags
  const [isAddingExperience, setIsAddingExperience] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'tiadoueu@') {
      setIsAuthenticated(true);
      setAuthError('');
      localStorage.setItem('td_dev_admin_auth', 'true');
      if (onAuthChange) onAuthChange(true);
    } else {
      setAuthError('Mot de passe incorrect.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('td_dev_admin_auth');
    if (onAuthChange) onAuthChange(false);
  };

  // Profile Save Actions
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: profName,
      title: profTitle,
      email: profEmail,
      location: profLocation,
      photo: profPhoto
    });
    // Add brief animation or indication
    showToast('Profil enregistré avec succès ! 🎉', 'success');
  };

  // PROJECTS CRUD OPERATIONS
  const handleStartAddProject = () => {
    setEditingProjectId(null);
    setProjTitle('');
    setProjDesc('');
    setProjLongDesc('');
    setProjCategory('Frontend');
    setProjTags('React, Tailwind');
    setProjImage('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600');
    setProjDemoUrl('#');
    setProjGithubUrl('#');
    setProjFeatured(false);
    setProjRole('Développeur Principal');
    setIsAddingProject(true);
  };

  const handleEditProject = (p: Project) => {
    setEditingProjectId(p.id);
    setProjTitle(p.title);
    setProjDesc(p.description);
    setProjLongDesc(p.longDescription || '');
    setProjCategory(p.category);
    setProjTags(p.tags.join(', '));
    setProjImage(p.image);
    setProjDemoUrl(p.demoUrl || '');
    setProjGithubUrl(p.githubUrl || '');
    setProjFeatured(p.featured);
    setProjRole(p.role || '');
    setIsAddingProject(true); // Open form
  };

  const handleDeleteProject = (id: string) => {
    const proj = projects.find(p => p.id === id);
    if (proj) {
      setDeleteConfirm({
        type: 'project',
        id,
        title: proj.title
      });
    }
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedTags = projTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const targetProject: Project = {
      id: editingProjectId || String(Date.now()),
      title: projTitle,
      description: projDesc,
      longDescription: projLongDesc,
      category: projCategory,
      tags: parsedTags,
      image: projImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600',
      demoUrl: projDemoUrl,
      githubUrl: projGithubUrl,
      featured: projFeatured,
      role: projRole
    };

    if (editingProjectId) {
      // Edit mode
      const updated = projects.map(p => p.id === editingProjectId ? targetProject : p);
      onUpdateProjects(updated);
    } else {
      // Add mode
      onUpdateProjects([targetProject, ...projects]);
    }

    setIsAddingProject(false);
    setEditingProjectId(null);
  };

  const handleExtractScreenshot = async () => {
    if (!projDemoUrl || projDemoUrl === '#' || !projDemoUrl.startsWith('http')) {
      showToast('Veuillez entrer un lien démo valide (commençant par http/https).', 'error');
      return;
    }

    setIsExtractingScreenshot(true);
    showToast('Génération de la capture d\'écran... 📸', 'success');

    try {
      let finalUrl = '';
      if (screenshotService === 'microlink') {
        finalUrl = `https://api.microlink.io?url=${encodeURIComponent(projDemoUrl)}&screenshot=true&embed=screenshot.url`;
      } else {
        finalUrl = `https://image.thum.io/get/width/1280/crop/800/${projDemoUrl}`;
      }

      setProjImage(finalUrl);
      showToast('Capture d\'écran générée ! 🎯', 'success');
    } catch (error) {
      console.error('Erreur de capture:', error);
      showToast('Erreur lors de la capture d\'écran.', 'error');
    } finally {
      setIsExtractingScreenshot(false);
    }
  };

  // SKILLS CRUD OPERATIONS
  const handleStartAddSkill = () => {
    setEditingSkillName(null);
    setSkillName('');
    setSkillLevel(85);
    setSkillCategory('Frontend');
    setSkillIcon('CodeIcon');
    setIsAddingSkill(true);
  };

  const handleEditSkill = (s: Skill) => {
    setEditingSkillName(s.name);
    setSkillName(s.name);
    setSkillLevel(s.level);
    setSkillCategory(s.category);
    setSkillIcon(s.icon);
    setIsAddingSkill(true); // Open form
  };

  const handleDeleteSkill = (nameToDelete: string) => {
    setDeleteConfirm({
      type: 'skill',
      id: nameToDelete,
      title: nameToDelete
    });
  };

  const handleSaveSkill = (e: React.FormEvent) => {
    e.preventDefault();

    const targetSkill: Skill = {
      name: skillName,
      level: Number(skillLevel),
      category: skillCategory,
      icon: skillIcon
    };

    if (editingSkillName) {
      // Edit mode: replace old skill with the edit
      const updated = skills.map(s => s.name === editingSkillName ? targetSkill : s);
      onUpdateSkills(updated);
      showToast('Compétence mise à jour ! ✨', 'success');
    } else {
      // Add mode: verify if already exists
      if (skills.some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
        showToast('Cette compétence existe déjà !', 'error');
        return;
      }
      onUpdateSkills([...skills, targetSkill]);
      showToast('Compétence ajoutée avec succès ! ✨', 'success');
    }

    setIsAddingSkill(false);
    setEditingSkillName(null);
  };

  // EXPERIENCES CRUD OPERATIONS
  const handleStartAddExperience = () => {
    setEditingExperienceId(null);
    setExpRole('');
    setExpCompany('');
    setExpDuration('');
    setExpDescription('');
    setExpSkills('');
    setIsAddingExperience(true);
  };

  const handleEditExperience = (e: ExperienceType) => {
    setEditingExperienceId(e.id);
    setExpRole(e.role);
    setExpCompany(e.company);
    setExpDuration(e.duration);
    setExpDescription(e.description.join('\n'));
    setExpSkills(e.skills.join(', '));
    setIsAddingExperience(true); // Open form
  };

  const handleDeleteExperience = (id: string) => {
    const exp = experiences.find(e => e.id === id);
    if (exp) {
      setDeleteConfirm({
        type: 'experience',
        id,
        title: `${exp.role} chez ${exp.company}`
      });
    }
  };

  const handleSaveExperience = (event: React.FormEvent) => {
    event.preventDefault();

    const targetExperience: ExperienceType = {
      id: editingExperienceId || 'exp_' + Date.now(),
      role: expRole,
      company: expCompany,
      duration: expDuration,
      description: expDescription.split('\n').map(l => l.trim()).filter(l => l.length > 0),
      skills: expSkills.split(',').map(s => s.trim()).filter(s => s.length > 0)
    };

    if (editingExperienceId) {
      const updated = experiences.map(e => e.id === editingExperienceId ? targetExperience : e);
      onUpdateExperiences(updated);
    } else {
      onUpdateExperiences([...experiences, targetExperience]);
    }

    setIsAddingExperience(false);
    setEditingExperienceId(null);
  };

  // Pre-configured icons drop selector mapping list
  const iconOptions = [
    { value: 'CodeIcon', label: 'Feuille de code' },
    { value: 'ReactIcon', label: 'React / Atome (Bleu)' },
    { value: 'FileCodeIcon', label: 'Typescript (Indigo)' },
    { value: 'PaletteIcon', label: 'Palette (Couleur)' },
    { value: 'SparklesIcon', label: 'Etoiles (Brillant)' },
    { value: 'ServerIcon', label: 'Serveur (Rose)' },
    { value: 'CpuIcon', label: 'Processeur / CPU' },
    { value: 'DatabaseIcon', label: 'Base de données (Teal)' },
    { value: 'LayersIcon', label: 'Couches / Layers' },
    { value: 'BoxIcon', label: 'Boite / Docker' },
    { value: 'WorkflowIcon', label: 'Workflow (Fuchsia)' },
    { value: 'CloudIcon', label: 'Nuage / Cloud' },
    { value: 'TerminalIcon', label: 'Terminal / CLI' },
    { value: 'BracesIcon', label: 'Braces / JSON' },
    { value: 'BinaryIcon', label: 'Binaire / Python' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
        {/* Backdrop glass overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* AUTH SEGREGATION GUARD */}
        {!isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="relative w-full max-w-md glass dark:bg-black/95 rounded-3xl p-8 shadow-2xl border border-slate-200/50 dark:border-white/10 mx-4 backdrop-blur-2xl z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-white/5 border border-indigo-500/20 dark:border-white/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400 mb-2">
                <KeyRound className="w-6 h-6 animate-pulse" />
              </div>

              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white leading-tight">
                Accès Administration
              </h3>
              
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                Connectez-vous pour configurer l'ensemble du profil, des projets, et des compétences sauvegardés dans votre navigateur.
              </p>

              <form onSubmit={handleLogin} className="w-full pt-4 space-y-4">
                <div className="text-left space-y-1.5">
                  <label className="text-[10px] font-mono tracking-widest font-semibold uppercase text-slate-400 block ml-1 select-none">
                    Mot de passe de session
                  </label>
                  <input
                    type="password"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-250 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-center font-mono placeholder-slate-400 text-sm focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white focus:outline-none"
                  />
                  {authError && (
                    <span className="text-[10px] font-mono font-bold text-rose-500 flex items-center gap-1 mt-1 justify-center">
                      <AlertTriangle className="w-3 h-3 text-rose-500" />
                      {authError}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-sm rounded-xl cursor-pointer shadow-lg shadow-indigo-505/10 flex items-center justify-center gap-2"
                >
                  Débloquer le CRUD Admin
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-2 flex items-start gap-2 bg-indigo-50/50 dark:bg-white/3 border border-indigo-100/20 dark:border-white/5 p-3 rounded-xl text-[10px] text-indigo-750 dark:text-indigo-300 max-w-sm text-left">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-normal">
                  Veuillez saisir votre mot de passe d'administration sécurisé.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          
          /* PRINCIPAL ADMIN PANEL COMPONENT */
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 30 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="relative w-full max-w-5xl h-full sm:h-[90vh] glass dark:bg-black/95 sm:rounded-3xl shadow-2xl border-0 sm:border border-slate-200/40 dark:border-white/10 flex flex-col z-10 backdrop-blur-3xl overflow-hidden"
          >
            {/* Header section control bar */}
            <div className="p-6 border-b border-slate-200/30 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/20 sm:bg-transparent shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 dark:bg-white/5 flex items-center justify-center text-violet-500 border border-violet-500/20 dark:border-white/10 shrink-0">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                    Console d'Administration
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] uppercase font-mono tracking-wider">
                      CRUD Actif
                    </span>
                    {dbStatus && (
                      <span 
                        title={`Hôte: ${dbStatus.host} | Base: ${dbStatus.databaseName}`}
                        className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono tracking-wider border flex items-center gap-1.5 transition-all ${
                          dbStatus.isMySQL && dbStatus.connectionState === 1
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          dbStatus.isMySQL && dbStatus.connectionState === 1 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'
                        }`} />
                        DB : {dbStatus.isMySQL && dbStatus.connectionState === 1 ? 'MySQL Connecté ✅' : 'Local JSON ⚠️'}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Modifiez à la volée vos informations personnelles, votre portfolio de projets et vos compétences.
                  </p>
                </div>
              </div>

              {/* Close and Logout buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/35 hover:bg-rose-550/10 hover:border-rose-500 text-rose-600 dark:text-rose-400 text-xs font-semibold font-mono cursor-pointer transition-colors"
                >
                  Déconnexion
                </button>
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors cursor-pointer"
                  title="Fermer la console"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Inner navigation layout panel */}
            <div className="flex flex-1 overflow-hidden flex-col sm:flex-row">
              
              {/* SIDE RAIL NAVIGATION */}
              <div className="w-full sm:w-56 border-r-0 sm:border-r border-b sm:border-b-0 border-slate-200/30 dark:border-white/5 p-4 flex sm:flex-col gap-2 shrink-0 overflow-x-auto sm:overflow-x-visible">
                {[
                  { id: 'profile', label: 'Profil Personnel', icon: <User className="w-4 h-4" /> },
                  { id: 'projects', label: 'Projets Portfolio', icon: <LayoutGrid className="w-4 h-4" /> },
                  { id: 'skills', label: 'Mes Compétences', icon: <Cpu className="w-4 h-4" /> },
                  { id: 'experiences', label: 'Mes Expériences', icon: <Briefcase className="w-4 h-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setIsAddingProject(false);
                      setIsAddingSkill(false);
                      setIsAddingExperience(false);
                    }}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0 sm:shrink ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 dark:bg-white text-white dark:text-slate-950 shadow-md font-bold'
                        : 'text-slate-650 dark:text-slate-350 hover:bg-slate-100/50 dark:hover:bg-white/3'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* DYNAMIC SCROLL CONTAINER */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                
                {/* 1. PROFILE CRUD PANEL */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-white/5 pb-4">
                      <h4 className="font-display font-bold text-lg text-slate-800 dark:text-white">
                        Informations du Profil
                      </h4>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 hover:shadow-lg hover:shadow-emerald-550/10 cursor-pointer transition-all"
                      >
                        <Save className="w-4.5 h-4.5" />
                        Garder les modifications
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-12 gap-6">
                      
                      {/* Avatar preview and update */}
                      <div className="sm:col-span-4 flex flex-col items-center pt-2">
                        <span className="text-[10px] font-mono tracking-wider font-semibold uppercase text-slate-400 mb-3 align-self-start">PHOTO DE PROFIL ACCUEIL</span>
                        <div className="relative group/avatar-admin w-28 h-28 rounded-2xl overflow-hidden glass border border-slate-200/40 dark:border-white/10 shadow-lg">
                          <img
                            src={profPhoto}
                            alt="Preview avatar"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        
                        <div className="w-full mt-3 space-y-2">
                          <input
                            type="text"
                            placeholder="URL vers une photo (HTTPS, Unsplash, GitHub)"
                            value={profPhoto}
                            onChange={(e) => setProfPhoto(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-250 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setProfPhoto(defaultAvatarUrl)}
                            className="w-full py-1.5 gap-1 hover:bg-slate-100 dark:hover:bg-white/3 text-xs border border-slate-200 dark:border-white/5 rounded-lg text-slate-500 dark:text-slate-400 font-mono transition-all flex items-center justify-center cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Pre-généré AI Studio
                          </button>
                        </div>
                      </div>

                      {/* Fields details */}
                      <div className="sm:col-span-8 space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">Nom complet</label>
                            <input
                              type="text"
                              required
                              value={profName}
                              onChange={(e) => setProfName(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-slate-900 dark:text-white text-sm focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">Titre Professionnel</label>
                            <input
                              type="text"
                              required
                              value={profTitle}
                              onChange={(e) => setProfTitle(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-slate-900 dark:text-white text-sm focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">Courriel de destination</label>
                            <input
                              type="email"
                              required
                              value={profEmail}
                              onChange={(e) => setProfEmail(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-slate-905 dark:text-white text-sm focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">Localisation géographique</label>
                            <input
                              type="text"
                              required
                              value={profLocation}
                              onChange={(e) => setProfLocation(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-slate-905 dark:text-white text-sm focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-indigo-50/40 dark:bg-white/3 rounded-2xl border border-indigo-100/10 dark:border-white/5 flex gap-3 text-xs leading-normal text-indigo-850 dark:text-indigo-300">
                          <Sparkles className="w-5 h-5 text-indigo-505 shrink-0" />
                          <p>
                            Ces champs d'informations alimentent directement la bannière de présentation du Hero, les boutons d'e-mail du module Contact, ainsi que le pied de page (Footer).
                          </p>
                        </div>
                      </div>

                    </div>
                  </form>
                )}


                {/* 2. PROJECTS CRUD TAB PANEL */}
                {activeTab === 'projects' && (
                  <div className="space-y-6">
                    
                    {/* PROJECTS PANEL HEADER */}
                    {!isAddingProject && (
                      <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-white/5 pb-4">
                        <div>
                          <h4 className="font-display font-bold text-lg text-slate-800 dark:text-white">
                            Gestion des Projets
                          </h4>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            Total : {projects.length} projets enregistrés
                          </p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={handleStartAddProject}
                          className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 font-bold self-end text-white text-xs rounded-xl flex items-center gap-1.5 hover:shadow-lg cursor-pointer transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Ajouter un Projet
                        </button>
                      </div>
                    )}

                    {/* DYNAMIC FORM RENDER */}
                    {isAddingProject ? (
                      <form onSubmit={handleSaveProject} className="space-y-5 bg-slate-50/40 dark:bg-white/2 p-6 rounded-3xl border border-slate-200/30 dark:border-white/5">
                        <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-white/5 pb-3">
                          <h5 className="font-display font-bold text-base text-slate-800 dark:text-white">
                            {editingProjectId ? 'Éditer le Projet' : 'Nouveau Projet'}
                          </h5>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingProject(false);
                              setEditingProjectId(null);
                            }}
                            className="p-1 px-2.5 text-[10px] font-mono hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-slate-500 shrink-0 cursor-pointer"
                          >
                            Annuler
                          </button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">Titre du Projet</label>
                            <input
                              type="text"
                              required
                              value={projTitle}
                              onChange={(e) => setProjTitle(e.target.value)}
                              placeholder="Ex: Orbit SaaS"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-slate-900 dark:text-white text-xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">Rôle (Ex: Lead Architect/Created by)</label>
                            <input
                              type="text"
                              value={projRole}
                              onChange={(e) => setProjRole(e.target.value)}
                              placeholder="Ex: Développeur Lead Fullstack"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-slate-900 dark:text-white text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">Catégorie du Projet</label>
                            <select
                              value={projCategory}
                              onChange={(e) => setProjCategory(e.target.value as any)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-201 dark:border-white/5 bg-white dark:bg-black text-slate-900 dark:text-white text-xs"
                            >
                              <option value="Frontend">Frontend</option>
                              <option value="Backend">Backend</option>
                              <option value="Fullstack">Fullstack</option>
                              <option value="Web3">Web3</option>
                            </select>
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">Tags / Outils (Séparer par des virgules)</label>
                            <input
                              type="text"
                              required
                              value={projTags}
                              onChange={(e) => setProjTags(e.target.value)}
                              placeholder="React, Node.js, WebSockets, Tailwind..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-slate-900 dark:text-white text-xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">Description Simple (2/3 Lignes max)</label>
                          <textarea
                            required
                            rows={2}
                            value={projDesc}
                            onChange={(e) => setProjDesc(e.target.value)}
                            placeholder="Entrez un court résumé percutant du projet..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-slate-900 dark:text-white text-xs resize-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">Description Détaillée (Pour le module d'agrandissement)</label>
                          <textarea
                            rows={3}
                            value={projLongDesc}
                            onChange={(e) => setProjLongDesc(e.target.value)}
                            placeholder="Entrez les détails approfondis, cas d'usage ou technologies clés résolues..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-slate-900 dark:text-white text-xs resize-none"
                          />
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">URL de l'image descriptive (HTTPS ou Unsplash)</label>
                            <input
                              type="text"
                              value={projImage}
                              onChange={(e) => setProjImage(e.target.value)}
                              placeholder="https://images.unsplash.com/photo-..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-slate-900 dark:text-white text-xs"
                            />
                          </div>

                          <div className="space-y-1.5 flex items-center pt-5">
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-350 select-none">
                              <input
                                type="checkbox"
                                checked={projFeatured}
                                onChange={(e) => setProjFeatured(e.target.checked)}
                                className="w-4 h-4 text-indigo-650 rounded border-slate-300 focus:ring-indigo-500"
                              />
                               Projet mis en avant (Featured)
                            </label>
                          </div>
                        </div>

                        {/* Image/Screenshot Preview Block */}
                        {projImage && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">Aperçu en direct du projet</label>
                            <div className="relative aspect-video w-full max-w-md rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 group">
                              <img
                                src={projImage}
                                alt="Aperçu du projet"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as any).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                <span className="text-[10px] text-white/90 font-mono truncate max-w-full">
                                  {projImage}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">Lien Démo (Live URL)</label>
                            <input
                              type="text"
                              value={projDemoUrl}
                              onChange={(e) => setProjDemoUrl(e.target.value)}
                              placeholder="https://votre-projet.com"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-slate-900 dark:text-white text-xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">Lien GitHub (Source Code)</label>
                            <input
                              type="text"
                              value={projGithubUrl}
                              onChange={(e) => setProjGithubUrl(e.target.value)}
                              placeholder="#"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-slate-900 dark:text-white text-xs"
                            />
                          </div>
                        </div>

                        {/* Extraire la capture d'écran Section */}
                        {projDemoUrl && projDemoUrl.startsWith('http') && projDemoUrl !== '#' && (
                          <div className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-white/3 border border-indigo-500/10 dark:border-white/5 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-0.5">
                                <h6 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                  <Camera className="w-4 h-4 text-indigo-500 animate-pulse" />
                                  Générateur automatique de capture d'écran
                                </h6>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                  Générez une capture d'écran en temps réel du site de démonstration pour l'image de votre projet.
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Moteur :</span>
                                <select
                                  value={screenshotService}
                                  onChange={(e) => setScreenshotService(e.target.value as any)}
                                  className="px-2 py-1 text-[10px] rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white focus:outline-none cursor-pointer font-semibold"
                                >
                                  <option value="microlink">Microlink API</option>
                                  <option value="thumio">Thum.io</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3 items-center">
                              <button
                                type="button"
                                onClick={handleExtractScreenshot}
                                disabled={isExtractingScreenshot}
                                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 cursor-pointer shrink-0"
                              >
                                {isExtractingScreenshot ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Génération en cours...</span>
                                  </>
                                ) : (
                                  <>
                                    <Camera className="w-3.5 h-3.5" />
                                    <span>Extraire et appliquer la capture</span>
                                  </>
                                )}
                              </button>

                              {projImage && projImage.includes('screenshot') && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5 shrink-0" />
                                  Capture appliquée à l'image du projet !
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingProject(false);
                              setEditingProjectId(null);
                            }}
                            className="px-4 py-2 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold rounded-lg text-slate-650 dark:text-slate-300 cursor-pointer"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-550 font-bold text-white text-xs rounded-lg flex items-center gap-1 hover:shadow-md cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            Garder ce Projet
                          </button>
                        </div>
                      </form>
                    ) : (
                      
                      /* PROJECT LIST CARDS VIEW */
                      <div className="space-y-3">
                        {projects.map((proj) => (
                          <div
                            key={proj.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-slate-200/40 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <img
                                src={proj.image}
                                alt={proj.title}
                                referrerPolicy="no-referrer"
                                className="w-16 h-10 object-cover rounded-lg border border-slate-200/50 dark:border-white/5"
                              />
                              <div>
                                <h5 className="font-display font-bold text-sm text-slate-805 dark:text-slate-100 flex items-center gap-2">
                                  {proj.title}
                                  {proj.featured && (
                                    <span className="px-1.5 py-0.2 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[8px] font-mono rounded border border-amber-500/20 uppercase">
                                      Mis en avant
                                    </span>
                                  )}
                                </h5>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/5 text-slate-550 dark:text-slate-400 font-mono text-[9px]">
                                    {proj.category}
                                  </span>
                                  {proj.tags.slice(0, 3).map((tag, idx) => (
                                    <span key={idx} className="text-[9px] font-mono text-indigo-650 dark:text-indigo-400">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 shrink-0 self-end sm:self-auto">
                              <button
                                type="button"
                                onClick={() => handleEditProject(proj)}
                                className="p-2 border border-slate-200 dark:border-white/5 rounded-lg text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/3 transition-colors cursor-pointer"
                                title="Modifier"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProject(proj.id)}
                                className="p-2 border border-rose-220 dark:border-rose-950 text-rose-500 hover:text-rose-650 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                )}


                {/* 3. SKILLS CRUD TAB PANEL */}
                {activeTab === 'skills' && (
                  <div className="space-y-6">
                    
                    {/* SKILLS CRUD HEADER */}
                    {!isAddingSkill && (
                      <div className="flex items-center justify-between border-b border-slate-205/30 dark:border-white/5 pb-4">
                        <div>
                          <h4 className="font-display font-bold text-lg text-slate-800 dark:text-white">
                            Mes compétences technologiques
                          </h4>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            Total : {skills.length} stacks cataloguées
                          </p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={handleStartAddSkill}
                          className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 font-bold self-end text-white text-xs rounded-xl flex items-center gap-1.5 hover:shadow-lg cursor-pointer transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Ajouter une Stack
                        </button>
                      </div>
                    )}

                    {/* DYNAMIC FORM RENDER */}
                    {isAddingSkill ? (
                      <form onSubmit={handleSaveSkill} className="space-y-5 bg-slate-50/40 dark:bg-white/2 p-6 rounded-3xl border border-slate-200/30 dark:border-white/5">
                        <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-white/5 pb-3">
                          <h5 className="font-display font-bold text-base text-slate-800 dark:text-white">
                            {editingSkillName ? `Éditer la compétence "${editingSkillName}"` : 'Nouvelle compétence'}
                          </h5>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingSkill(false);
                              setEditingSkillName(null);
                            }}
                            className="p-1 px-2.5 text-[10px] font-mono hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-slate-500 shrink-0 cursor-pointer"
                          >
                            Annuler
                          </button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">Nom de la compétence (Ex: React, Node)</label>
                            <input
                              type="text"
                              required
                              value={skillName}
                              onChange={(e) => setSkillName(e.target.value)}
                              placeholder="Ex: Vue3 / Angular"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-slate-900 dark:text-white text-xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">Catégorie technique</label>
                            <select
                              value={skillCategory}
                              onChange={(e) => setSkillCategory(e.target.value as any)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-201 dark:border-white/5 bg-white dark:bg-black text-slate-900 dark:text-white text-xs"
                            >
                              <option value="Frontend">Frontend</option>
                              <option value="Backend">Backend</option>
                              <option value="DevOps & Tools">DevOps & Outils</option>
                              <option value="Languages">Langages</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">Représentation Iconographique</label>
                            <select
                              value={skillIcon}
                              onChange={(e) => setSkillIcon(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-201 dark:border-white/5 bg-white dark:bg-black text-slate-900 dark:text-white text-xs"
                            >
                              {iconOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
                              <span>Niveau de maîtrise</span>
                              <span className="text-indigo-400 font-bold">{skillLevel}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              step="5"
                              value={skillLevel}
                              onChange={(e) => setSkillLevel(Number(e.target.value))}
                              className="w-full h-2 bg-slate-200 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-550"
                            />
                            <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                              <span>Base (10%)</span>
                              <span>Expert (100%)</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingSkill(false);
                              setEditingSkillName(null);
                            }}
                            className="px-4 py-2 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold rounded-lg text-slate-650 dark:text-slate-300 cursor-pointer"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-550 font-bold text-white text-xs rounded-lg flex items-center gap-1 hover:shadow-md cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            Garder
                          </button>
                        </div>
                      </form>
                    ) : (
                      
                      /* LIST OF SKILLS VIEW WRAP */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {skills.map((skill, index) => (
                          <div
                            key={`${skill.name}-${index}`}
                            className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/40 dark:border-white/5 hover:bg-slate-55/50 dark:hover:bg-white/2 transition-colors gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/40 dark:border-white/10 flex items-center justify-center font-bold">
                                {skill.category.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h5 className="font-display font-medium text-sm text-slate-800 dark:text-slate-100">
                                  {skill.name}
                                </h5>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <div className="w-20 h-1.5 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: `${skill.level}%` }} />
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {skill.level}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleEditSkill(skill)}
                                className="p-1.5 border border-slate-200 dark:border-white/5 rounded-lg text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/3 transition-colors cursor-pointer"
                                title="Modifier"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSkill(skill.name)}
                                className="p-1.5 border border-rose-220 dark:border-rose-950 text-rose-500 hover:text-rose-650 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                )}


                {/* 4. EXPERIENCES CRUD TAB PANEL */}
                {activeTab === 'experiences' && (
                  <div className="space-y-6">
                    
                    {/* EXPERIENCES CRUD HEADER */}
                    {!isAddingExperience && (
                      <div className="flex items-center justify-between border-b border-slate-205/30 dark:border-white/5 pb-4">
                        <div>
                          <h4 className="font-display font-medium text-lg text-slate-800 dark:text-white">
                            Mes expériences marquantes
                          </h4>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            Total : {experiences.length} expériences listées
                          </p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={handleStartAddExperience}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold self-end text-white text-xs rounded-xl flex items-center gap-1.5 hover:shadow-lg cursor-pointer transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Ajouter une expérience
                        </button>
                      </div>
                    )}

                    {/* EXPERIENCE FORM BLOCK */}
                    {isAddingExperience ? (
                      <form onSubmit={handleSaveExperience} className="space-y-5 bg-slate-500/5 dark:bg-black p-6 rounded-2xl border border-slate-200/40 dark:border-white/5">
                        <div className="flex items-center justify-between border-b border-slate-200/20 dark:border-white/5 pb-3">
                          <h5 className="font-display font-semibold text-sm text-indigo-600 dark:text-indigo-400">
                            {editingExperienceId ? 'Modifier l\'expérience marquante' : 'Créer une expérience marquante'}
                          </h5>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 align-middle">
                              Poste / Rôle
                            </label>
                            <input
                              type="text"
                              value={expRole}
                              onChange={(e) => setExpRole(e.target.value)}
                              placeholder="ex: Lead Fullstack Developer"
                              required
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                              Entreprise / Projet
                            </label>
                            <input
                              type="text"
                              value={expCompany}
                              onChange={(e) => setExpCompany(e.target.value)}
                              placeholder="ex: PixelForge Studios"
                              required
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                              Durée / Période
                            </label>
                            <input
                              type="text"
                              value={expDuration}
                              onChange={(e) => setExpDuration(e.target.value)}
                              placeholder="ex: 2024 - Présent"
                              required
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                              Technologies utilisées (Séparées par des virgules)
                            </label>
                            <input
                              type="text"
                              value={expSkills}
                              onChange={(e) => setExpSkills(e.target.value)}
                              placeholder="ex: React, Next.js, Framer Motion, Tailwind"
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Description - Points clés (Un point clé par ligne)
                          </label>
                          <textarea
                            rows={4}
                            value={expDescription}
                            onChange={(e) => setExpDescription(e.target.value)}
                            placeholder="Entrez vos réalisations importantes (une par ligne)&#10;ex: Conception et développement d'interfaces immersives.&#10;Optimisation des performances de rendu."
                            required
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200/40 dark:border-white/10 bg-white dark:bg-black text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-y"
                          />
                        </div>

                        <div className="pt-2 flex gap-2 justify-end font-display">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingExperience(false);
                              setEditingExperienceId(null);
                            }}
                            className="px-4 py-2 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-550 font-bold text-white text-xs rounded-lg flex items-center gap-1 hover:shadow-md cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            Garder
                          </button>
                        </div>
                      </form>
                    ) : (
                      
                      /* LIST OF EXPERIENCES TRACKER VIEW */
                      <div className="flex flex-col gap-4">
                        {experiences.length === 0 ? (
                          <div className="text-center py-10 border border-dashed border-slate-200 dark:border-white/5 rounded-2xl">
                            <Briefcase className="w-8 h-8 text-slate-355 dark:text-slate-700 mx-auto mb-2" />
                            <p className="text-slate-400 text-xs">Aucune expérience enregistrée. Cliquez sur "Ajouter une expérience" pour commencer.</p>
                          </div>
                        ) : (
                          experiences.map((exp, index) => (
                            <div
                              key={`${exp.id}-${index}`}
                              className="flex flex-col sm:flex-row items-start justify-between p-5 rounded-2xl border border-slate-200/40 dark:border-white/5 bg-slate-50/20 dark:bg-white/2 hover:bg-slate-100/30 dark:hover:bg-white/3 transition-colors gap-4 animate-fadeIn"
                            >
                              <div className="space-y-2 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                                    {exp.duration}
                                  </span>
                                  <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
                                  <span className="font-semibold text-xs text-slate-750 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                                    {exp.company}
                                  </span>
                                </div>
                                <h5 className="font-display font-medium text-base text-slate-900 dark:text-white">
                                  {exp.role}
                                </h5>
                                
                                <ul className="space-y-1 list-disc pl-4 text-xs text-slate-500 dark:text-slate-400">
                                  {exp.description.map((bullet, bIdx) => (
                                    <li key={bIdx}>{bullet}</li>
                                  ))}
                                </ul>

                                <div className="flex flex-wrap gap-1 mt-2">
                                  {exp.skills.map((skill, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="px-1.5 py-0.5 font-mono text-[9px] rounded bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200/5"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="flex gap-1.5 shrink-0 self-end sm:self-start">
                                <button
                                  type="button"
                                  onClick={() => handleEditExperience(exp)}
                                  className="p-1.5 border border-slate-200 dark:border-white/5 rounded-lg text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/3 transition-colors cursor-pointer"
                                  title="Modifier"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExperience(exp.id)}
                                  className="p-1.5 border border-rose-220 dark:border-rose-950 text-rose-500 hover:text-rose-650 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                  </div>
                )}

              </div>
            </div>

            {/* Custom confirm delete overlay */}
            <AnimatePresence>
              {deleteConfirm && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-sm bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 text-center space-y-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                      <Trash2 className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-display font-bold text-slate-900 dark:text-white text-base">
                        Confirmer la suppression ?
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Voulez-vous vraiment supprimer "{deleteConfirm.title}" ? Cette action est irréversible.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 py-2 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmDelete}
                        className="flex-1 py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-550 text-white text-xs font-bold shadow-lg shadow-rose-600/10 cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Custom toast notifications */}
            <AnimatePresence>
              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 50, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, y: 50, x: "-50%" }}
                  className={`absolute bottom-6 left-1/2 z-[60] px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2 max-w-md ${
                    toastMessage.type === 'error'
                      ? 'bg-rose-600 border-rose-550 text-white'
                      : 'bg-slate-900 dark:bg-slate-800 text-white border-slate-800 dark:border-slate-700'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${toastMessage.type === 'error' ? 'bg-white' : 'bg-emerald-400'}`} />
                  <span className="text-xs font-semibold">{toastMessage.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
