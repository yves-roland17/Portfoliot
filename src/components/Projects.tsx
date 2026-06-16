import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Globe, Github, Info, Layers } from 'lucide-react';
import { Project } from '../types';
import ProjectCard from './ProjectCard';

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  const [filter, setFilter] = useState<string>('Tous');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categories = ['Tous', 'Frontend', 'Backend', 'Fullstack', 'Web3'];

  const filteredProjects = filter === 'Tous'
    ? projects
    : projects.filter(p => p.category === filter);

  return (
    <section
      id="projects"
      className="py-24 bg-transparent transition-colors duration-300 relative overflow-hidden"
    >
      {/* Decorative vectors */}
      <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50/80 dark:bg-white/5 text-indigo-650 dark:text-indigo-400 border border-indigo-200/30 dark:border-white/10 font-mono text-xs mb-4 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Galerie de réalisations
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-medium text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight mb-4"
          >
            Projets en vedette.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 dark:text-slate-350 max-w-xl text-base sm:text-lg font-light"
          >
            Découvrez une sélection de mes derniers travaux, alliant architecture robuste, design léché et performances optimales.
          </motion.p>
        </div>

        {/* Categories filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 sm:px-5 py-2.5 rounded-full font-medium text-sm transition-all relative cursor-pointer ${
                filter === cat
                  ? 'text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50/50 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 backdrop-blur-md'
              }`}
            >
              {filter === cat && (
                <motion.div
                  layoutId="activeFilterBg"
                  className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
                  style={{ zIndex: -1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid with layout animation wrapper */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <ProjectCard
                  project={project}
                  onSelect={setSelectedProject}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modal overlays for project detailing */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with elegant blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Modal Container with Frosted Glass Theme */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="relative w-full max-w-3xl glass dark:bg-black/95 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/40 dark:border-white/10 max-h-[90vh] flex flex-col z-10 backdrop-blur-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white backdrop-blur-sm transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Scrollable contents */}
              <div className="overflow-y-auto w-full flex-1">
                {/* Hero preview graphic */}
                <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800">
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="text-xs font-mono tracking-widest text-indigo-400 font-semibold uppercase block mb-1">
                      {selectedProject.category}
                    </span>
                    <h3 className="font-display font-bold text-2xl sm:text-3xl leading-snug">
                      {selectedProject.title}
                    </h3>
                  </div>
                </div>

                {/* Modal main detailed panel */}
                <div className="p-8">
                  {/* Roles and links block */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono tracking-wider block">RÔLE CONFIÉ</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                          {selectedProject.role || 'Développeur Principal'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedProject.githubUrl && (
                        <a
                          href={selectedProject.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-2 transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          Code source
                        </a>
                      )}
                      {selectedProject.demoUrl && (
                        <a
                          href={selectedProject.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-650/15 transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          Démo live
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Body textual panels */}
                  <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                    <h4 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-3">
                      À propos de l'application
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                      {selectedProject.longDescription || selectedProject.description}
                    </p>
                  </div>

                  {/* Technologies tags complete set */}
                  <div>
                    <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5 font-mono">
                      <Info className="w-3.5 h-3.5" />
                      Technologies exploitées
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-xl bg-slate-50/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-mono text-xs border border-slate-100 dark:border-white/5 backdrop-blur-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
