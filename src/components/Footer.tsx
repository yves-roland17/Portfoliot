import React from 'react';
import { Sparkles, ArrowUp, Github, Linkedin, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer id="footer-root" className="bg-white dark:bg-black border-t border-slate-200/40 dark:border-slate-800/20 text-slate-500 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand identity */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleScrollToTop}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-sm text-slate-800 dark:text-white tracking-tight">
            TD<span className="text-indigo-650 dark:text-indigo-400">.</span>Dev
          </span>
        </div>

        {/* Copywrite and Love */}
        <div className="text-xs text-slate-600 dark:text-slate-400 font-light text-center flex flex-wrap justify-center items-center gap-1">
          <span>&copy; {currentYear} TD.Dev. Tous droits réservés. Conçu avec</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0 mx-0.5 animate-pulse" />
          <span>en Côte d'Ivoire.</span>
        </div>

        {/* Action button trigger anchors */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <a
              href="#"
              className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-all text-xs"
              aria-label="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-all text-xs"
              aria-label="LinkedIn Account"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-850" />

          {/* Scroll To Top Trigger Button */}
          <button
            onClick={handleScrollToTop}
            className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-450 hover:text-indigo-500 transition-colors pointer-cursor"
            aria-label="Revenir en haut"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
