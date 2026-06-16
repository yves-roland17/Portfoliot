import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Github, Linkedin, Sparkles, Code, Terminal, UserPen } from 'lucide-react';
import { UserProfile } from './ProfileModal';

interface HeroProps {
  profile: UserProfile;
  onOpenProfile: () => void;
}

export default function Hero({ profile, onOpenProfile }: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Parallax scrolling effects for ambient background shapes
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const scaleBg = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  // Social Links
  const socialLinks = [
    { icon: <Github className="w-5 h-5" />, href: '#', label: 'GitHub' },
    { icon: <Linkedin className="w-5 h-5" />, href: '#', label: 'LinkedIn' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 100, damping: 20 } 
    }
  };

  const handleScrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = contactSection.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleScrollToProjects = () => {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = projectsSection.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden bg-slate-50 dark:bg-black transition-colors duration-300"
    >
      {/* Dynamic Animated background blobs */}
      <motion.div 
        style={{ y: yBg, scale: scaleBg }}
        className="absolute inset-0 pointer-events-none z-0"
      >
        <div className="absolute top-1/4 left-1/10 w-72 h-72 rounded-full bg-violet-400/20 dark:bg-violet-600/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-3xl" style={{ animationDelay: '2s' }} />
        
        {/* Parallax lines pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid md:grid-cols-12 gap-12 items-center">
        {/* Left Headline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ y: yText }}
          className="md:col-span-7 flex flex-col items-start text-left"
        >
          {/* Clickable Profile Card block */}
          <motion.div
            variants={itemVariants}
            onClick={onOpenProfile}
            className="flex items-center gap-4 p-3 pr-5 mb-6 rounded-2xl glass hover:bg-slate-50/50 dark:hover:bg-white/5 border border-slate-205/20 dark:border-white/10 shadow-lg cursor-pointer transition-all duration-300 group/hero-avatar"
            title="Cliquez pour personnaliser votre profil !"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-300/30 dark:border-white/5 bg-slate-100 dark:bg-white/5 shrink-0">
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-full h-full object-cover group-hover/hero-avatar:scale-110 transition-transform duration-550"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-slate-50 dark:border-slate-950 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-display font-extrabold text-slate-800 dark:text-white group-hover/hero-avatar:text-indigo-500 transition-colors">
                  {profile.name}
                </span>
                <UserPen className="w-3.5 h-3.5 text-slate-400 group-hover/hero-avatar:text-indigo-400 opacity-x-0 group-hover/hero-avatar:opacity-100 transition-all pointer-events-none" />
              </div>
              <span className="text-[10px] text-indigo-650 dark:text-indigo-400 font-mono tracking-widest font-medium uppercase mt-0.5">
                {profile.title}
              </span>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-500/20 font-mono text-xs font-semibold uppercase tracking-wider mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            Disponible pour de nouveaux projets
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-display font-medium text-4xl sm:text-5xl lg:text-7xl tracking-tight text-slate-900 dark:text-white leading-tight mb-6"
          >
            Concevoir des <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 dark:from-violet-400 dark:via-indigo-400 dark:to-cyan-400 font-extrabold">
              Interfaces Réactives
            </span> <br />
            & d'envergure.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-slate-600 dark:text-slate-300 text-lg sm:text-xl font-light leading-relaxed max-w-xl mb-8"
          >
            Je suis développeur d’applications web créatives. Je combine une approche rigoureuse en ingénierie de code avec des animations soignées pour concevoir des produits inoubliables.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-4 mb-8"
          >
            <button
              onClick={handleScrollToProjects}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-medium tracking-tight shadow-lg shadow-indigo-500/10 flex items-center gap-2 group transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              Voir mon travail
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={handleScrollToContact}
              className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium tracking-tight border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
            >
              Me contacter
            </button>
          </motion.div>

          {/* Social icons */}
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Réseaux sociaux :
            </span>
            <div className="flex gap-2">
              {socialLinks.map((link, i) => (
                <motion.a
                  key={i}
                  href={link.href}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                  whileHover={{ y: -3 }}
                  aria-label={link.label}
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right Animated Dashboard Mockup/Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
          className="md:col-span-5 relative flex justify-center"
        >
          {/* Aesthetic Cyberpunk Container aligned with Frosted Glass Theme */}
          <div className="relative w-full max-w-sm aspect-square md:aspect-auto md:h-[450px] glass dark:bg-white/3 border border-slate-200/40 dark:border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden group">
            {/* Window header */}
            <div className="flex items-center justify-between border-b border-indigo-200/20 dark:border-white/10 pb-4 mb-4">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded px-2 py-0.5 text-[10px] font-mono text-slate-400">
                <Terminal className="w-3 h-3" />
                index.tsx
              </div>
            </div>

            {/* Custom Interactive Floating components with Motion & Glass */}
            <div className="space-y-4 font-mono text-xs relative z-10">
              <motion.div 
                className="p-3 rounded-xl glass border border-slate-200/60 dark:border-white/10 shadow-sm flex items-center gap-3"
                whileHover={{ x: 6, transition: { type: 'spring' } }}
              >
                <div className="w-2.5 h-12 rounded-full bg-emerald-500" />
                <div>
                  <div className="text-slate-400 dark:text-slate-400 text-[10px]">API STABILITY</div>
                  <div className="font-bold text-slate-850 dark:text-emerald-400 text-sm">99.99% operational</div>
                </div>
              </motion.div>

              <motion.div 
                className="p-4 rounded-xl glass text-slate-850 dark:text-white border border-slate-200/60 dark:border-indigo-500/20 shadow-lg"
                animate={{ 
                  y: [0, -4, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut"
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-indigo-650 dark:text-indigo-400 text-[10px]">CURRENT DEPLOYMENT</span>
                  <Code className="w-4 h-4 text-indigo-550 dark:text-indigo-400" />
                </div>
                <div className="h-2 bg-slate-200/50 dark:bg-slate-800/40 rounded-full overflow-hidden mb-2">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                    animate={{ width: ['10%', '92%', '92%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Compiling bundles ... Success!</div>
              </motion.div>

              <motion.div 
                className="p-3.5 rounded-xl glass border border-slate-200/60 dark:border-white/10 shadow-sm flex flex-col gap-2"
                whileHover={{ y: -3 }}
              >
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-400">
                  <span>FPS / RENDERING CORE</span>
                  <span className="text-violet-500 font-bold">60Hz</span>
                </div>
                <div className="flex items-end gap-1.5 h-14 pt-2">
                  {[20, 45, 15, 60, 40, 80, 50, 95, 30].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-violet-500/80 rounded-t-sm"
                      animate={{ height: [`${h}%`, `${Math.max(10, (h + 20) % 100)}%`, `${h}%`] }}
                      transition={{ duration: 1.5 + (i * 0.15), repeat: Infinity, ease: 'easeInOut' }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Glowing neon shadow ring */}
            <div className="absolute inset-0 border border-indigo-500/10 pointer-events-none rounded-3xl group-hover:scale-[1.02] transition-transform duration-500" />
          </div>
        </motion.div>
      </div>

      {/* Decorative arrow down to projects section */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 dark:text-slate-500 animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
