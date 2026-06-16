import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code,
  FileCode,
  Palette,
  Sparkles,
  Server,
  Cpu,
  Database,
  Layers,
  Box,
  Workflow,
  Cloud,
  Terminal,
  Braces,
  Binary
} from 'lucide-react';
import { Skill } from '../types';

interface SkillsProps {
  skills: Skill[];
}

export default function Skills({ skills }: SkillsProps) {
  const [selectedCategory, setSelectedCategory] = useState<'Frontend' | 'Backend' | 'DevOps & Tools' | 'Languages'>('Frontend');

  const categories: ('Frontend' | 'Backend' | 'DevOps & Tools' | 'Languages')[] = [
    'Frontend',
    'Backend',
    'DevOps & Tools',
    'Languages'
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ReactIcon': return <Code className="w-5 h-5 text-violet-500" />;
      case 'FileCodeIcon': return <FileCode className="w-5 h-5 text-indigo-500" />;
      case 'PaletteIcon': return <Palette className="w-5 h-5 text-sky-500" />;
      case 'SparklesIcon': return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'ServerIcon': return <Server className="w-5 h-5 text-rose-500" />;
      case 'CpuIcon': return <Cpu className="w-5 h-5 text-indigo-500" />;
      case 'DatabaseIcon': return <Database className="w-5 h-5 text-teal-500" />;
      case 'LayersIcon': return <Layers className="w-5 h-5 text-pink-500" />;
      case 'BoxIcon': return <Box className="w-5 h-5 text-cyan-500" />;
      case 'WorkflowIcon': return <Workflow className="w-5 h-5 text-fuchsia-500" />;
      case 'CloudIcon': return <Cloud className="w-5 h-5 text-sky-500" />;
      case 'TerminalIcon': return <Terminal className="w-5 h-5 text-emerald-500" />;
      case 'CodeIcon': return <Code className="w-5 h-5 text-violet-500" />;
      case 'BracesIcon': return <Braces className="w-5 h-5 text-amber-500" />;
      case 'BinaryIcon': return <Binary className="w-5 h-5 text-blue-500" />;
      default: return <Code className="w-5 h-5 text-indigo-500" />;
    }
  };

  const filteredSkills = skills.filter(skill => skill.category === selectedCategory);

  return (
    <section
      id="skills"
      className="py-24 bg-transparent border-y border-slate-205/30 dark:border-white/5 transition-colors duration-300 relative overflow-hidden w-full"
    >
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/4 right-0 w-72 h-72 rounded-full bg-violet-600/5 dark:bg-violet-400/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/8 left-0 w-80 h-80 rounded-full bg-indigo-600/5 dark:bg-indigo-400/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        {/* Section header elements */}
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50/85 dark:bg-white/5 text-violet-650 dark:text-violet-400 border border-violet-200/30 dark:border-white/10 font-mono text-xs mb-4 backdrop-blur-md"
          >
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
            Compétences techniques
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-medium text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight mb-4"
          >
            Savoir-faire technologique.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 dark:text-slate-350 max-w-xl text-base sm:text-lg font-light animate-fade-in"
          >
            Mon expertise s’articule autour de l’écosystème web moderne, optimisant chaque niveau pour délivrer de la rapidité et du confort.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Category column selector */}
          <div className="md:col-span-4 flex flex-col gap-2">
            {categories.map((cat, index) => (
              <motion.button
                key={cat}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center justify-between p-4.5 rounded-2xl font-display font-semibold text-left transition-all relative overflow-hidden group cursor-pointer ${
                  selectedCategory === cat
                    ? 'text-white font-bold'
                    : 'text-slate-750 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white glass border-slate-200/30 dark:border-white/5 hover:bg-slate-55/50 dark:hover:bg-white/10 shadow-sm'
                }`}
              >
                {selectedCategory === cat && (
                  <motion.div
                    layoutId="activeCategoryBg"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{cat === 'DevOps & Tools' ? 'DevOps & Outils' : cat === 'Languages' ? 'Langages' : cat}</span>
                
                <span className={`w-2.5 h-2.5 rounded-full transition-all ${
                  selectedCategory === cat 
                    ? 'bg-white scale-110' 
                    : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-indigo-500'
                }`} />
              </motion.button>
            ))}
          </div>

          {/* Grid dynamic skills charts */}
          <div className="md:col-span-8 glass rounded-3xl p-6 sm:p-10 border border-slate-200/40 dark:border-white/10 shadow-xl min-h-[380px] backdrop-blur-xl">
            <h3 className="font-display font-bold text-xl text-slate-800 dark:text-slate-100 mb-8 border-b border-slate-150 dark:border-white/5 pb-4">
              {selectedCategory === 'DevOps & Tools' ? 'DevOps & Outils de développement' : selectedCategory === 'Languages' ? 'Langages de programmation' : selectedCategory}
            </h3>

            <div className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCategory}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid sm:grid-cols-1 gap-6"
                >
                  {filteredSkills.map((skill, index) => (
                    <motion.div 
                      key={skill.name} 
                      className="flex flex-col gap-2 group/skill pr-2"
                      whileHover={{ x: 6 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className="flex justify-between items-center cursor-pointer">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-50/50 dark:bg-black border border-slate-100/50 dark:border-white/10 flex items-center justify-center p-1 shadow-sm backdrop-blur-sm group-hover/skill:scale-110 group-hover/skill:border-indigo-500/50 transition-all duration-300">
                            {getIcon(skill.icon)}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base group-hover/skill:text-indigo-500 dark:group-hover/skill:text-indigo-400 transition-colors">
                            {skill.name}
                          </span>
                        </div>
                        <span className="font-mono text-sm font-semibold text-slate-500 dark:text-slate-400 group-hover/skill:text-slate-800 dark:group-hover/skill:text-white transition-colors">
                          {skill.level}%
                        </span>
                      </div>

                      {/* Animated Slider bar */}
                      <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.level}%` }}
                          transition={{ duration: 1.2, ease: 'easeOut', delay: index * 0.08 }}
                          className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 rounded-full relative"
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
