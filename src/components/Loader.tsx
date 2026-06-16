import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal, Code } from 'lucide-react';

interface LoaderProps {
  onComplete: () => void;
  key?: string;
}

export default function Loader({ onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Analyse du système...');

  const statusPhrases = [
    'Analyse du système...',
    'Initialisation des modules graphiques...',
    'Chargement des composants frosted-glass...',
    'Compilation des styles de parallaxe...',
    'Prêt !'
  ];

  useEffect(() => {
    // Increment progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Random increments for realistic look
        const increment = Math.floor(Math.random() * 8) + 4;
        return Math.min(prev + increment, 100);
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Match progress to phrases
    if (progress < 25) {
      setStatusText(statusPhrases[0]);
    } else if (progress < 55) {
      setStatusText(statusPhrases[1]);
    } else if (progress < 80) {
      setStatusText(statusPhrases[2]);
    } else if (progress < 95) {
      setStatusText(statusPhrases[3]);
    } else {
      setStatusText(statusPhrases[4]);
    }

    if (progress === 100) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 600); // slight buffer for a satisfying finish
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        y: -100,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
      }}
      className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Mesh aligned with Frosted Glass Theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(124,58,237,0.15)_0%,transparent_75%)] filter blur-[80px]" 
        />
        <motion.div 
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,transparent_75%)] filter blur-[60px]" 
        />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Animated logo node */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mb-8"
        >
          {/* Pulsing ring outer */}
          <motion.div 
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -inset-4 rounded-3xl bg-indigo-505/10 blur-xl pointer-events-none" 
          />
          
          <div className="w-16 h-16 rounded-3xl glass backdrop-blur-xl border border-white/10 flex items-center justify-center text-white text-2xl font-bold font-display shadow-2xl relative overflow-hidden">
            {/* Shimmer overlay path */}
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
            />
            TD.
          </div>
        </motion.div>

        {/* Brand Display Names */}
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display font-medium text-lg tracking-widest text-slate-100 uppercase mb-1"
        >
          TD<span className="text-indigo-400">.</span>Dev
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.3 }}
          className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase mb-12"
        >
          Creative Portfolio
        </motion.p>

        {/* Cinematic bar container */}
        <div className="w-64 relative mb-4">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm">
            <motion.div
              layout
              className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Subtle percentage badge bubble indicator */}
          <motion.span 
            className="absolute -top-7 right-0 text-xs font-mono font-semibold text-slate-400"
          >
            {progress}%
          </motion.span>
        </div>

        {/* Dynamic status labels with layout animation */}
        <div className="h-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={statusText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="text-xs font-mono text-slate-400 animate-pulse flex items-center justify-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              {statusText}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
