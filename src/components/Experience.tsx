import React from 'react';
import { motion } from 'motion/react';
import { Briefcase, Calendar, Star, Sparkles } from 'lucide-react';
import { experiencesData } from '../data';
import { Experience as ExperienceType } from '../types';

interface ExperienceProps {
  experiences?: ExperienceType[];
}

export default function Experience({ experiences }: ExperienceProps) {
  const displayExperiences = experiences && experiences.length > 0 ? experiences : experiencesData;

  return (
    <section
      id="experience"
      className="py-24 bg-transparent transition-colors duration-300 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        {/* Section Title */}
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50/85 dark:bg-white/5 text-indigo-650 dark:text-indigo-400 border border-indigo-200/30 dark:border-white/10 font-mono text-xs mb-4 backdrop-blur-md"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Parcours Professionnel
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-medium text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight mb-4"
          >
            Expériences marquantes.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 dark:text-slate-350 max-w-xl text-base sm:text-lg font-light"
          >
            Mon chemin de développeur, jalonné de défis techniques relevés et de partenariats collaboratifs réussis.
          </motion.p>
        </div>

        {/* Timeline structural grid */}
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical axis line */}
          <div className="absolute left-4 sm:left-1/2 top-4 bottom-4 w-0.5 bg-slate-200/40 dark:bg-white/10 -translate-x-1/2 hidden sm:block" />
          <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200/40 dark:bg-white/10 block sm:hidden" />

          {/* Timeline cards */}
          <div className="space-y-12">
            {displayExperiences.map((exp, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={exp.id}
                  className={`relative flex flex-col sm:flex-row items-start ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Badge Node */}
                  <div className="absolute left-4 sm:left-1/2 w-8 h-8 rounded-full bg-slate-50/80 dark:bg-black border-2 border-indigo-500 flex items-center justify-center -translate-x-1/2 z-15 shadow-sm hidden sm:flex backdrop-blur-md">
                    <Star className="w-3 h-3 text-indigo-500 animate-pulse" />
                  </div>

                  <div className="absolute left-6 w-6 h-6 rounded-full bg-slate-50/80 dark:bg-black border-2 border-indigo-500 flex items-center justify-center -translate-x-1/2 z-15 shadow-sm flex sm:hidden backdrop-blur-md">
                    <Star className="w-2.5 h-2.5 text-indigo-500" />
                  </div>

                  {/* Card wrapper */}
                  <div className={`w-full sm:w-[calc(50%-2rem)] pl-12 sm:pl-0 ${isEven ? 'sm:pr-8' : 'sm:pl-8'}`}>
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? 40 : -40, y: 30 }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      whileHover={{ y: -6, scale: 1.025, boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.15)" }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 260, 
                        damping: 22,
                        layout: { duration: 0.3 }
                      }}
                      className="relative p-6 rounded-2xl glass hover:bg-slate-50/50 dark:hover:bg-white/5 border border-slate-200/40 dark:border-white/10 shadow-lg backdrop-blur-md transition-all duration-300 cursor-pointer"
                    >
                      {/* Interactive hover glow */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-t-2xl" />

                      {/* Header elements */}
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100/80 dark:bg-white/5 text-slate-550 dark:text-slate-300 font-mono text-[10px] uppercase font-semibold mb-3 border border-slate-200/30 dark:border-white/5">
                        <Calendar className="w-3 h-3" />
                        {exp.duration}
                      </span>

                      <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white leading-tight">
                        {exp.role}
                      </h3>
                      
                      <h4 className="font-medium text-sm text-indigo-600 dark:text-indigo-400 mb-4">
                        {exp.company}
                      </h4>

                      {/* Bullet explanations */}
                      <ul className="space-y-2 mb-6">
                        {exp.description.map((bullet, idx) => (
                          <li key={idx} className="flex gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-350 leading-relaxed items-start">
                            <span className="w-1.5 h-1.5 bg-indigo-500/80 rounded-full mt-1.5 shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Skill tags */}
                      <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-200/20 dark:border-slate-800/60">
                        {exp.skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 font-mono text-[10px] rounded bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-300 border border-indigo-200/10"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
