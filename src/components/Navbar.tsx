import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Sun, Moon, Sparkles, User, Settings } from 'lucide-react';
import { UserProfile } from './ProfileModal';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  profile: UserProfile;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  isAdmin?: boolean;
}

export default function Navbar({ darkMode, setDarkMode, profile, onOpenProfile, onOpenAdmin, isAdmin = false }: NavbarProps) {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { id: 'home', label: 'Accueil' },
    { id: 'projects', label: 'Projets' },
    { id: 'skills', label: 'Compétences' },
    { id: 'experience', label: 'Parcours' },
    { id: 'contact', label: 'Contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Determine if scrolled
      setScrolled(window.scrollY > 50);

      // Simple active section detection
      const sections = navItems.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of navbar
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav
      id="navbar-root"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass dark:bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-lg py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo aligned with Lucas Dev design */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => handleNavClick('home')}
        >
          <div className="w-10 h-10 rounded-xl glass flex items-center justify-center font-bold text-lg text-indigo-550 dark:text-indigo-400 shadow-md transition-all group-hover:scale-105">
            TD.
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-display font-bold tracking-widest uppercase text-slate-800 dark:text-white group-hover:text-indigo-500 transition-colors">
              TD.Dev
            </span>
            <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-mono font-medium tracking-wider">
              CREATIVE DEVELOPER
            </span>
          </div>
        </motion.div>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navItems.map((item, index) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`relative font-medium text-sm transition-colors py-2 px-1 cursor-pointer ${
                    activeSection === item.id
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              </motion.li>
            ))}
          </ul>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>

          {/* Theme Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>

          {/* Clickable user profile avatar next to toggle */}
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenProfile}
              className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/10 group cursor-pointer shadow-sm ml-0.5 shrink-0 bg-slate-100 dark:bg-white/5"
              aria-label="Modifier le profil"
              title="Modifier mon profil"
            >
              <img
                src={profile.photo}
                alt={profile.name}
                className="w-full h-full object-cover group-hover:opacity-85 transition-opacity"
                referrerPolicy="no-referrer"
              />
            </motion.button>
          )}

          {/* New Admin CRUD Console trigger */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: 20 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenAdmin}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:text-indigo-550 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm relative group"
            aria-label="Console d'administration (CRUD)"
            title="Console d'administration (CRUD)"
          >
            <Settings className="w-5 h-5 text-indigo-505 dark:text-indigo-400" />
            <span className="absolute -bottom-9 right-0 bg-slate-900 text-white font-mono text-[9px] py-1 px-2.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border border-slate-700">
              Admin CRUD Panel
            </span>
          </motion.button>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {/* Mobile Profile Trigger */}
          {isAdmin && (
            <button
              onClick={onOpenProfile}
              className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200/55 dark:border-white/10 cursor-pointer bg-slate-100 dark:bg-white/5 shrink-0"
              aria-label="Modifier le profil"
              title="Modifier mon profil"
            >
              <img
                src={profile.photo}
                alt={profile.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          )}

          {/* Mobile Admin Trigger button */}
          <button
            onClick={onOpenAdmin}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 cursor-pointer shrink-0"
            aria-label="Admin Interface (CRUD)"
            title="Console d'administration (CRUD)"
          >
            <Settings className="w-5 h-5 animate-spin-slow" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-slate-200/10 bg-slate-900/95 dark:bg-black/95 backdrop-blur-lg"
          >
            <ul className="px-6 py-6 flex flex-col gap-4">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left font-display font-medium text-lg py-2 ${
                      activeSection === item.id
                        ? 'text-indigo-400'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
