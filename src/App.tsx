import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Loader from './components/Loader';
import ProfileModal, { UserProfile } from './components/ProfileModal';
import AdminPanel from './components/AdminPanel';
import { projectsData, skillsData, experiencesData } from './data';
import { Project, Skill, Experience as ExperienceType } from './types';
// @ts-ignore
import defaultAvatar from './assets/images/dev_avatar_1780673343898.png';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true); // dark mode active by default for creative premium vibe
  const [loading, setLoading] = useState<boolean>(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('td_dev_admin_auth') === 'true';
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('td_dev_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore fallback
      }
    }
    return {
      name: 'Tia Doueu',
      title: 'Architecte Logiciel & Développeur Web',
      photo: defaultAvatar,
      email: 'doueu.tia@uvci.edu.ci',
      location: 'Abidjan, Côte d\'Ivoire'
    };
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('td_dev_projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore fallback
      }
    }
    return projectsData;
  });

  const [skills, setSkills] = useState<Skill[]>(() => {
    const saved = localStorage.getItem('td_dev_skills');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore fallback
      }
    }
    return skillsData;
  });

  const [experiences, setExperiences] = useState<ExperienceType[]>(() => {
    const saved = localStorage.getItem('td_dev_experiences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore fallback
      }
    }
    return experiencesData;
  });

  // Fetch initial relational SQLite database data on startup to sync everything
  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await fetch('/api/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData && profileData.name) {
            setProfile(profileData);
          }
        }

        const projectsRes = await fetch('/api/projects');
        if (projectsRes.ok) {
          const projectsDataList = await projectsRes.json();
          if (projectsDataList && projectsDataList.length > 0) {
            setProjects(projectsDataList);
          }
        }

        const skillsRes = await fetch('/api/skills');
        if (skillsRes.ok) {
          const skillsDataList = await skillsRes.json();
          if (skillsDataList && skillsDataList.length > 0) {
            setSkills(skillsDataList);
          }
        }

        const experiencesRes = await fetch('/api/experiences');
        if (experiencesRes.ok) {
          const experiencesDataList = await experiencesRes.json();
          if (experiencesDataList && experiencesDataList.length > 0) {
            setExperiences(experiencesDataList);
          }
        }
      } catch (err) {
        console.error('Error fetching data from SQLite database on startup:', err);
      }
    };
    fetchData();
  }, []);

  // Sync index.html root HTML class for responsive dark mode selectors
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const handleProfileUpdate = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('td_dev_user_profile', JSON.stringify(newProfile));
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });
    } catch (err) {
      console.error('Failed to sync profile change to database:', err);
    }
  };

  const handleProjectsUpdate = async (newProjects: Project[]) => {
    const prevProjects = [...projects];
    setProjects(newProjects);
    localStorage.setItem('td_dev_projects', JSON.stringify(newProjects));

    try {
      // Find deleted projects
      const deleted = prevProjects.filter(p => !newProjects.some(np => np.id === p.id));
      for (const d of deleted) {
        await fetch(`/api/projects/${d.id}`, { method: 'DELETE' });
      }

      // Find added or updated projects
      const addedOrUpdated = newProjects.filter(np => {
        const existing = prevProjects.find(p => p.id === np.id);
        return !existing || JSON.stringify(existing) !== JSON.stringify(np);
      });
      for (const p of addedOrUpdated) {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        });
      }
    } catch (err) {
      console.error('Failed to sync projects change to database:', err);
    }
  };

  const handleSkillsUpdate = async (newSkills: Skill[]) => {
    const prevSkills = [...skills];
    setSkills(newSkills);
    localStorage.setItem('td_dev_skills', JSON.stringify(newSkills));

    try {
      // Find deleted skills
      const deleted = prevSkills.filter(s => !newSkills.some(ns => ns.name === s.name));
      for (const d of deleted) {
        await fetch(`/api/skills/${encodeURIComponent(d.name)}`, { method: 'DELETE' });
      }

      // Find added or updated skills
      const addedOrUpdated = newSkills.filter(ns => {
        const existing = prevSkills.find(s => s.name === ns.name);
        return !existing || JSON.stringify(existing) !== JSON.stringify(ns);
      });
      for (const s of addedOrUpdated) {
        await fetch('/api/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(s)
        });
      }
    } catch (err) {
      console.error('Failed to sync skills change to database:', err);
    }
  };

  const handleExperiencesUpdate = async (newExperiences: ExperienceType[]) => {
    const prevExperiences = [...experiences];
    setExperiences(newExperiences);
    localStorage.setItem('td_dev_experiences', JSON.stringify(newExperiences));

    try {
      // Find deleted experiences
      const deleted = prevExperiences.filter(e => !newExperiences.some(ne => ne.id === e.id));
      for (const d of deleted) {
        await fetch(`/api/experiences/${d.id}`, { method: 'DELETE' });
      }

      // Find added or updated experiences
      const addedOrUpdated = newExperiences.filter(ne => {
        const existing = prevExperiences.find(e => e.id === ne.id);
        return !existing || JSON.stringify(existing) !== JSON.stringify(ne);
      });
      for (const exp of addedOrUpdated) {
        await fetch('/api/experiences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(exp)
        });
      }
    } catch (err) {
      console.error('Failed to sync experiences change to database:', err);
    }
  };

  return (
    <>
      {/* Cinematic Screen Loader */}
      <AnimatePresence mode="wait">
        {loading && (
          <Loader key="loader" onComplete={() => setLoading(false)} />
        )}
      </AnimatePresence>

      <div id="app-container" className="bg-slate-50 dark:bg-black text-slate-800 dark:text-slate-100 min-h-screen selection:bg-indigo-500/30 selection:text-indigo-400 font-sans transition-colors duration-300 relative">
        {/* Background Mesh Blobs aligned with Frosted Glass theme */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(124,58,237,0.08)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,#3b0764_0%,transparent_70%)] opacity-60 filter blur-[80px] animate-pulse" />
          <div className="absolute -bottom-[5%] -right-[5%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(37,99,235,0.08)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,#1e3a8a_0%,transparent_70%)] opacity-50 filter blur-[60px]" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] bg-[radial-gradient(circle,rgba(139,92,246,0.05)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,#4c1d95_0%,transparent_70%)] opacity-30 filter blur-[50px]" />
        </div>

        <div className="relative z-10">
          {/* Navigation Controls */}
          <Navbar 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
            profile={profile} 
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenAdmin={() => setIsAdminOpen(true)}
            isAdmin={isAdminAuthenticated}
          />

          {/* Hero Intro */}
          <Hero 
            profile={profile} 
            onOpenProfile={() => setIsProfileModalOpen(true)} 
            isAdmin={isAdminAuthenticated}
          />

          {/* Portfolio Projects Section */}
          <Projects projects={projects} isAdmin={isAdminAuthenticated} />

          {/* Skills Tab Layout */}
          <Skills skills={skills} />

          {/* Path Journey */}
          <Experience experiences={experiences} />

          {/* Call to action & Message Form */}
          <Contact profile={profile} isAdmin={isAdminAuthenticated} />

          {/* Brand copywrite details */}
          <Footer isAdmin={isAdminAuthenticated} />
        </div>
      </div>

      {/* Persistent profile modification dashboard modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onUpdate={handleProfileUpdate}
        defaultAvatarUrl={defaultAvatar}
      />

      {/* Dedicated Admin Panel dashboard with full CRUD */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        profile={profile}
        onUpdateProfile={handleProfileUpdate}
        projects={projects}
        onUpdateProjects={handleProjectsUpdate}
        skills={skills}
        onUpdateSkills={handleSkillsUpdate}
        experiences={experiences}
        onUpdateExperiences={handleExperiencesUpdate}
        defaultAvatarUrl={defaultAvatar}
        onAuthChange={(auth) => setIsAdminAuthenticated(auth)}
      />
    </>
  );
}
