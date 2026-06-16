import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Link, Check, RefreshCw, Sparkles, User, Briefcase, Mail, MapPin } from 'lucide-react';

export interface UserProfile {
  name: string;
  title: string;
  photo: string;
  email: string;
  location: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdate: (updatedProfile: UserProfile) => void;
  defaultAvatarUrl: string;
}

export default function ProfileModal({ isOpen, onClose, profile, onUpdate, defaultAvatarUrl }: ProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [title, setTitle] = useState(profile.title);
  const [photo, setPhoto] = useState(profile.photo);
  const [email, setEmail] = useState(profile.email);
  const [location, setLocation] = useState(profile.location);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset options for quick avatar select
  const presets = [
    defaultAvatarUrl,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250&h=250',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250&h=250',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250&h=250',
    'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=250&h=250'
  ];

  // Handle Drag Over
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Convert image file to Base64
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Veuillez sélectionner un fichier image valide.');
      return;
    }
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhoto(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Handle Input File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Handle Url Apply
  const handleUrlApply = () => {
    if (!urlInput.trim()) return;
    setPhoto(urlInput.trim());
    setUrlInput('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      name,
      title,
      photo,
      email,
      location
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 40 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-2xl glass dark:bg-black/95 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/40 dark:border-white/10 max-h-[92vh] flex flex-col z-10 backdrop-blur-2xl"
        >
          {/* Close trigger button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Title Header */}
          <div className="p-6 sm:p-8 border-b border-slate-200/30 dark:border-white/5 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-white/5 flex items-center justify-center text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 dark:border-white/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white leading-tight">
                Configuration du Profil
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personnalisez votre photo, vos informations professionnelles et vos coordonnées
              </p>
            </div>
          </div>

          {/* Modal Form Scroll Area */}
          <form onSubmit={handleSave} className="overflow-y-auto p-6 sm:p-8 flex-1 space-y-6">
            
            {/* PHOTO EDITOR BLOCK */}
            <div className="space-y-4">
              <label className="text-xs font-mono tracking-wider font-semibold uppercase text-slate-400 select-none block">
                Photo de profil
              </label>

              <div className="grid sm:grid-cols-12 gap-6 items-start">
                
                {/* Active Photo Visual Frame */}
                <div className="sm:col-span-4 flex flex-col items-center">
                  <div className="relative group/photo w-28 h-28 rounded-2xl glass overflow-hidden border border-slate-200/40 dark:border-white/10 shadow-lg shrink-0">
                    <img
                      src={photo}
                      alt="Active avatar crop preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhoto(defaultAvatarUrl)}
                    className="mt-3 inline-flex items-center gap-1 text-[10px] font-mono hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-400 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                     Réinitialiser
                  </button>
                </div>

                {/* Photo Method Editor Tab container */}
                <div className="sm:col-span-8 space-y-4">
                  {/* Selector tabs */}
                  <div className="flex gap-2 border-b border-slate-200/30 dark:border-white/5 pb-2">
                    {[
                      { id: 'upload', icon: <Upload className="w-3.5 h-3.5" />, label: 'Fichier' },
                      { id: 'url', icon: <Link className="w-3.5 h-3.5" />, label: 'Lien URL' },
                      { id: 'presets', icon: <User className="w-3.5 h-3.5" />, label: 'Pre-générés' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                          activeTab === tab.id
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* ACTIVE TAB CONTENTS */}
                  {activeTab === 'upload' && (
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                        dragActive
                          ? 'border-indigo-500 bg-indigo-500/5'
                          : 'border-slate-200 dark:border-white/10 hover:border-indigo-500/50 hover:bg-slate-50/50 dark:hover:bg-white/2'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Upload className="w-8 h-8 text-slate-400 mb-3" />
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        Glissez-déposez ou <span className="text-indigo-500 font-bold dark:text-indigo-400">parcourez</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                        PNG, JPG ou WEBP (Max 5Mo)
                      </p>
                      {errorMsg && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-2">{errorMsg}</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'url' && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="Collez l'URL de l'image (HTTPS)"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          className="flex-grow px-3.5 py-2 rounded-xl text-sm border border-slate-250 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleUrlApply}
                          className="px-4 py-2 bg-slate-900 border border-slate-750 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-medium text-xs rounded-xl flex items-center justify-center cursor-pointer transition-all shrink-0"
                        >
                          Appliquer
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Collez l'adresse web de n'importe quelle photo de profil publique (GitHub, LinkedIn, Unsplash, etc.)
                      </p>
                    </div>
                  )}

                  {activeTab === 'presets' && (
                    <div className="flex flex-wrap gap-3">
                      {presets.map((presetUrl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPhoto(presetUrl)}
                          className={`relative w-12 h-12 rounded-xl overflow-hidden border cursor-pointer transition-all hover:scale-105 ${
                            photo === presetUrl
                              ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                              : 'border-slate-200 dark:border-white/10 hover:border-slate-400'
                          }`}
                        >
                          <img
                            src={presetUrl}
                            alt={`Preset ${i}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {photo === presetUrl && (
                            <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                              <Check className="w-5 h-5 text-indigo-500" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* FORM FIELDS */}
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-mono tracking-wider font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    Nom complet
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Tia Doueu"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Subtitle / Role */}
                <div className="space-y-2">
                  <label className="text-xs font-mono tracking-wider font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                    Métier / Titre
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Développeur d'applications"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-mono tracking-wider font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    Adresse email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: doueu.tia@uvci.edu.ci"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-xs font-mono tracking-wider font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    Localisation
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Abidjan, Côte d'Ivoire"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/5 dark:bg-white/3 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* SAVE TRIGGER BUTTONS */}
            <div className="pt-4 flex gap-3 justify-end border-t border-slate-200/30 dark:border-white/5 pointer-events-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 font-semibold text-xs rounded-xl cursor-pointer transition-all shrink-0 text-slate-700 dark:text-slate-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer shadow-lg transition-all shadow-indigo-500/10 shrink-0"
              >
                Enregistrer les modifs
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
