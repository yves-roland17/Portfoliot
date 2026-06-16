import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Github, ExternalLink, ArrowRight } from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onSelect: (p: Project) => void;
}

export default function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // Divide both by small divisors to get subtle tilt factors
    const factorX = -(y / (box.height / 2)) * 12; // tilt amount max 12 deg
    const factorY = (x / (box.width / 2)) * 12;

    setRotateX(factorX);
    setRotateY(factorY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setHovered(false);
  };

  return (
    <div
      className="perspective-1000 w-full"
    >
      <div
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${hovered ? 1.02 : 1})`,
          transition: hovered ? 'transform 0.05s ease-out' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
        className="relative group glass-card border border-slate-200/40 dark:border-white/8 rounded-3xl overflow-hidden shadow-md dark:shadow-slate-950/20 transition-all duration-300 w-full cursor-pointer h-full flex flex-col justify-between"
      >
        {/* Card Header image container */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-white/5">
          {/* Parallax Background Visual */}
          <div className="absolute inset-0 z-0">
            <img
              src={project.image}
              alt={project.title}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transform transition-transform duration-700 ease-out ${
                hovered ? 'scale-110' : 'scale-100'
              }`}
            />
          </div>
          
          {/* Glassmorphic Category badge */}
          <span className="absolute top-4 left-4 z-10 px-3 py-1 text-xs font-semibold rounded-full bg-slate-900/40 backdrop-blur-md text-white border border-white/10">
            {project.category}
          </span>

          {/* Hover overlay overlay panel */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end p-6">
            <div className="text-white">
              <span className="text-[10px] font-mono tracking-widest text-indigo-300 uppercase block mb-1">
                {project.role || 'Développeur'}
              </span>
              <h4 className="font-display font-bold text-lg leading-snug">
                {project.title}
              </h4>
            </div>
          </div>
        </div>

        {/* Card Content info */}
        <div className="p-6 flex flex-col justify-between flex-1">
          <div>
            {/* Title */}
            <h3 className="font-display font-semibold text-xl text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors zoom-in-5">
              {project.title}
            </h3>

            {/* Snippet representation */}
            <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed mb-6 line-clamp-3 font-normal">
              {project.description}
            </p>
          </div>

          <div>
            {/* Tags section */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {project.tags.slice(0, 4).map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 font-mono text-[10px] rounded-md bg-slate-100 dark:bg-white/5 text-slate-550 dark:text-slate-300 border border-slate-200/40 dark:border-white/5"
                >
                  {tag}
                </span>
              ))}
              {project.tags.length > 4 && (
                <span className="px-2 py-0.5 font-mono text-[10px] rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/10 dark:border-white/5">
                  +{project.tags.length - 4}
                </span>
              )}
            </div>

            {/* Quick action triggers */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-150/80 dark:border-white/5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(project);
                }}
                className="text-xs font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 group/btn cursor-pointer font-sans"
              >
                En savoir plus
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center gap-2">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-transparent dark:border-white/5"
                    aria-label="GitHub Repository"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-transparent dark:border-white/5"
                    aria-label="Live Demo"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
