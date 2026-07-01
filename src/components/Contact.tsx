import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Settings, X, Info } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { UserProfile } from './ProfileModal';

interface ContactProps {
  profile: UserProfile;
  isAdmin: boolean;
}

export default function Contact({ profile, isAdmin }: ContactProps) {
  const formRef = useRef<HTMLFormElement>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  // Collapsible Developer Keys Configuration Drawer to easily select and link mail service providers!
  const [showConfig, setShowConfig] = useState(false);
  const [activeProvider, setActiveProvider] = useState<'smtp_formsubmit' | 'web3forms' | 'emailjs'>(() => {
    return (localStorage.getItem('td_dev_email_provider') as any) || 'emailjs';
  });
  const [serviceId, setServiceId] = useState((import.meta as any).env.VITE_EMAILJS_SERVICE_ID || localStorage.getItem('td_dev_emailjs_service_id') || '');
  const [templateId, setTemplateId] = useState((import.meta as any).env.VITE_EMAILJS_TEMPLATE_ID || localStorage.getItem('td_dev_emailjs_template_id') || '');
  const [publicKey, setPublicKey] = useState((import.meta as any).env.VITE_EMAILJS_PUBLIC_KEY || localStorage.getItem('td_dev_emailjs_public_key') || '');
  const [web3FormsKey, setWeb3FormsKey] = useState((import.meta as any).env.VITE_WEB3FORMS_KEY || localStorage.getItem('td_dev_web3forms_key') || '');

  const handleSaveConfig = () => {
    localStorage.setItem('td_dev_email_provider', activeProvider);
    localStorage.setItem('td_dev_emailjs_service_id', serviceId);
    localStorage.setItem('td_dev_emailjs_template_id', templateId);
    localStorage.setItem('td_dev_emailjs_public_key', publicKey);
    localStorage.setItem('td_dev_web3forms_key', web3FormsKey);
    setShowConfig(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setStatus('error');
      setStatusMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsLoading(true);
    setStatus('idle');

    if (activeProvider === 'emailjs') {
      const configuredServiceId = serviceId.trim();
      const configuredTemplateId = templateId.trim();
      const configuredPublicKey = publicKey.trim();

      const isEmailJSConfigured = configuredServiceId && configuredTemplateId && configuredPublicKey;

      if (!isEmailJSConfigured) {
        setStatus('error');
        setStatusMessage("EmailJS n'est pas encore configuré. Cliquez sur le bouton de configuration (engrenage en haut à droite) ou choisissez un autre fournisseur.");
        setIsLoading(false);
        return;
      }

      // Save submission to database first
      try {
        await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message, autoSendEmail: false })
        });
      } catch (err) {
        console.error('Failed to save message to DB:', err);
      }

      // REAL EMAILJS SEND
      const templateParams = {
        from_name: name,
        from_email: email,
        user_name: name,
        user_email: email,
        subject: subject || 'Nouveau message du Portfolio',
        user_subject: subject || 'Nouveau message du Portfolio',
        message: message,
      };

      try {
        const result = await emailjs.send(
          configuredServiceId,
          configuredTemplateId,
          templateParams,
          configuredPublicKey
        );
        
        if (result.status === 200) {
          setStatus('success');
          setStatusMessage('Votre message a été enregistré en base de données et envoyé avec succès via EmailJS !');
          // Reset form fields
          setName('');
          setEmail('');
          setSubject('');
          setMessage('');
        } else {
          throw new Error('EmailJS a retourné un statut invalide.');
        }
      } catch (error: any) {
        console.error('EmailJS Error:', error);
        setStatus('error');
        setStatusMessage(`Échec de l'envoi via EmailJS : ${error?.text || error?.message || 'Erreur inconnue'}.`);
      } finally {
        setIsLoading(false);
      }
    } else if (activeProvider === 'web3forms') {
      const configuredKey = web3FormsKey.trim();

      if (!configuredKey) {
        setStatus('error');
        setStatusMessage("Clé d'accès Web3Forms manquante. Cliquez sur l'icône d'engrenage (⚙️) en haut à droite pour coller votre clé Web3Forms gratuite ou pour changer de fournisseur.");
        setIsLoading(false);
        return;
      }

      // Save submission to database first
      try {
        await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message, autoSendEmail: false })
        });
      } catch (err) {
        console.error('Failed to save message to DB:', err);
      }

      // Send via Web3Forms AJAX (silent, no redirects, clean CORS)
      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            access_key: configuredKey,
            name: name,
            email: email,
            subject: subject || 'Nouveau message de votre Portfolio',
            message: message
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setStatus('success');
          setStatusMessage('Votre message a été enregistré en base de données et envoyé directement via Web3Forms sans aucun intermédiaire ni lien de confirmation !');
          // Reset form
          setName('');
          setEmail('');
          setSubject('');
          setMessage('');
        } else {
          throw new Error(result?.message || 'Erreur lors de l\'envoi via Web3Forms.');
        }
      } catch (err: any) {
        console.error('Web3Forms Error:', err);
        setStatus('error');
        setStatusMessage(`Erreur lors de l'envoi direct Web3Forms : ${err?.message || 'Erreur réseau'}. Veuillez vérifier votre clé d'accès ou choisir un autre service.`);
      } finally {
        setIsLoading(false);
      }
    } else {
      // SMTP / Direct Server Routing (Default: backend-driven)
      try {
        // Enregistrement en base de données + envoi (autoSendEmail: true déclenche l'envoi direct côté serveur via SMTP/FormSubmit s'il y a lieu)
        const response = await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message, autoSendEmail: true })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          setStatus('success');
          setStatusMessage("Votre message a été enregistré en base de données et est en cours d'envoi discret par notre serveur (sans aucune redirection ni popup publicitaire) !");
          // Reset form
          setName('');
          setEmail('');
          setSubject('');
          setMessage('');
        } else {
          throw new Error(result?.message || 'Une erreur est survenue lors de l\'enregistrement serveur.');
        }
      } catch (err: any) {
        console.error('Failed to send SMTP/FormSubmit:', err);
        setStatus('error');
        setStatusMessage(`Une erreur réseau ou serveur est survenue : ${err?.message || 'Erreur inconnue'}. N'hésitez pas à m'écrire directement par e-mail à roland.tia@epitech.eu !`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <section
      id="contact"
      className="py-24 bg-transparent transition-colors duration-300 border-t border-slate-210/30 dark:border-white/5 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50/85 dark:bg-white/5 text-indigo-650 dark:text-indigo-400 border border-indigo-200/30 dark:border-white/10 font-mono text-xs mb-4 backdrop-blur-md"
          >
            <Mail className="w-3.5 h-3.5" />
            Nous contacter
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-medium text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight mb-4"
          >
            Entrons en contact.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 dark:text-slate-350 max-w-xl text-base sm:text-lg font-light"
          >
            Vous avez une idée de projet, une offre d'emploi ou vous souhaitez simplement faire un coucou ? Laissez un mot !
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">
          {/* Left direct contact details */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-4">
              Informations directes
            </h3>
            
            <p className="text-slate-600 dark:text-slate-350 font-light leading-relaxed mb-8 text-sm sm:text-base">
              N’hésitez pas à me joindre directement par courriel ou via les différents réseaux. Je réponds généralement sous les 24 heures ouvrées.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl glass hover:bg-slate-50/60 dark:hover:bg-white/5 border border-slate-200/40 dark:border-white/10 backdrop-blur-md shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-indigo-50/50 dark:bg-white/5 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/10 dark:border-white/5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider block">COURRIEL</span>
                  <a href={`mailto:${profile.email}`} className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {profile.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl glass hover:bg-slate-50/60 dark:hover:bg-white/5 border border-slate-200/40 dark:border-white/10 backdrop-blur-md shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-violet-50/50 dark:bg-white/5 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-200/10 dark:border-white/5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider block">LOCALISATION</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {profile.location}
                  </span>
                </div>
              </div>
            </div>

            {/* EmailJS Developer Key Explanatory Toggle Button */}
            {isAdmin && (
              <div className="pt-6 animate-fade-in">
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold glass hover:bg-slate-100/60 dark:hover:bg-white/10 text-indigo-600 dark:text-indigo-400 border border-slate-200/40 dark:border-white/10 backdrop-blur-md transition-colors cursor-pointer animate-pulse"
                >
                  <Settings className={`w-3.5 h-3.5 ${showConfig ? 'rotate-90' : ''} transition-transform`} />
                  {showConfig ? 'Masquer la configuration EmailJS' : 'Configurer EmailJS'}
                </button>
              </div>
            )}
          </div>

          {/* Contact form on the right */}
          <div className="lg:col-span-7">
            <div className="glass rounded-3xl p-6 sm:p-10 border border-slate-200/40 dark:border-white/10 shadow-xl backdrop-blur-2xl">
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5 animate-fade-in">
                  {/* Name field */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="user_name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nom complet <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="user_name"
                      name="user_name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Votre nom"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/5 hover:bg-slate-50/10 dark:bg-white/3 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                    />
                  </div>

                  {/* Email field */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="user_email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Adresse courriel <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="user_email"
                      name="user_email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="nom@exemple.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/5 hover:bg-slate-50/10 dark:bg-white/3 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Subject field */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="msg_subject" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Sujet du message
                  </label>
                  <input
                    type="text"
                    id="msg_subject"
                    name="user_subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="De quoi s'agit-il ?"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/5 hover:bg-slate-50/10 dark:bg-white/3 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                  />
                </div>

                {/* Message field */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="user_message" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="user_message"
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    placeholder="Écrivez votre message ici..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/5 hover:bg-slate-50/10 dark:bg-white/3 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm resize-none transition-all"
                  />
                </div>

                {/* Error/Success banners */}
                <AnimatePresence mode="wait">
                  {status !== 'idle' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-4 rounded-xl flex items-start gap-2.5 text-xs sm:text-sm ${
                        status === 'success'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                          : 'bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30'
                      }`}
                    >
                      {status === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
                      )}
                      <span>{statusMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-4 rounded-2xl bg-indigo-650 hover:bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 group transition-colors cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Envoyer le message
                      <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </div>
        </div>

        {/* Dynamic EmailJS keys configurations settings panel overlay drawer */}
        <AnimatePresence>
          {showConfig && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowConfig(false)}
                className="absolute inset-0 bg-black/85 backdrop-blur-md"
              />

                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: 15 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                      className="relative bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
                    >
                      <button
                        onClick={() => setShowConfig(false)}
                        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="flex items-center gap-2.5 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50/80 dark:bg-white/5 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/30 dark:border-white/10">
                          <Settings className="w-5 h-5 animate-spin-slow" />
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                            Routage des e-mails
                          </h4>
                          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono tracking-wider">
                            FOURNISSEURS ALTERNATIFS
                          </p>
                        </div>
                      </div>

                      {/* Provider selection tabs */}
                      <div className="flex flex-col gap-2 mb-6">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                          Sélectionner le mode d'envoi
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/40 dark:border-white/5">
                          <button
                            type="button"
                            onClick={() => setActiveProvider('web3forms')}
                            className={`py-2 px-1 text-[11px] font-semibold rounded-xl transition-all cursor-pointer ${
                              activeProvider === 'web3forms'
                                ? 'bg-indigo-650 text-white shadow-md shadow-indigo-650/10'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                          >
                            Web3Forms
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveProvider('smtp_formsubmit')}
                            className={`py-2 px-1 text-[11px] font-semibold rounded-xl transition-all cursor-pointer ${
                              activeProvider === 'smtp_formsubmit'
                                ? 'bg-indigo-650 text-white shadow-md shadow-indigo-650/10'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                          >
                            SMTP / Serveur
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveProvider('emailjs')}
                            className={`py-2 px-1 text-[11px] font-semibold rounded-xl transition-all cursor-pointer ${
                              activeProvider === 'emailjs'
                                ? 'bg-indigo-650 text-white shadow-md shadow-indigo-650/10'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                          >
                            EmailJS
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 text-xs sm:text-sm">
                        {/* Option 1: Web3Forms Options */}
                        {activeProvider === 'web3forms' && (
                          <div className="space-y-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                                Clé d'accès Web3Forms (Access Key)
                              </label>
                              <input
                                type="text"
                                value={web3FormsKey}
                                onChange={(e) => setWeb3FormsKey(e.target.value)}
                                placeholder="Ex: aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 dark:border-white/5 bg-slate-50/50 dark:bg-white/3 text-slate-900 dark:text-white text-xs font-mono"
                              />
                            </div>
                            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/30 rounded-xl text-emerald-800 dark:text-emerald-400 flex items-start gap-2 text-xs">
                              <Info className="w-4 h-4 shrink-0 mt-0.5" />
                              <p className="leading-relaxed">
                                <strong>Alternative recommandée sans redirection :</strong> Obtenez une clé gratuite immédiatement en saisissant votre e-mail sur <a href="https://web3forms.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-emerald-500">web3forms.com</a>. Les messages arriveront instantanément sans aucun lien d'activation sur les soumissions !
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Option 2: Server Direct / SMTP */}
                        {activeProvider === 'smtp_formsubmit' && (
                          <div className="p-4 bg-indigo-50/50 dark:bg-white/3 border border-indigo-100/30 rounded-2xl text-indigo-900 dark:text-indigo-400 space-y-2.5">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-450" />
                              <h5 className="font-semibold text-xs text-slate-900 dark:text-white">Routage de confiance souverain</h5>
                            </div>
                            <p className="leading-relaxed text-xs">
                              Les messages sont stockés dans la base de données SQLite de votre serveur. 
                              <br /><br />
                              <strong>Pour un envoi 100% direct dans Outlook sans passer par un service tiers :</strong> définissez vos clés SMTP d'envoi dans le tableau de bord Render ou dans le fichier <code className="font-mono bg-indigo-100/50 dark:bg-white/5 px-1 py-0.5 rounded text-[10px]">.env</code> (<code className="text-[10px]">SMTP_USER</code>, <code className="text-[10px]">SMTP_PASS</code>, <code className="text-[10px]">SMTP_HOST</code>).
                            </p>
                          </div>
                        )}

                        {/* Option 3: EmailJS */}
                        {activeProvider === 'emailjs' && (
                          <div className="space-y-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                                Service ID
                              </label>
                              <input
                                type="text"
                                value={serviceId}
                                onChange={(e) => setServiceId(e.target.value)}
                                placeholder="service_xxxx"
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-250 dark:border-white/5 bg-slate-50/50 dark:bg-white/3 text-slate-900 dark:text-white text-xs font-mono"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                                Template ID
                              </label>
                              <input
                                type="text"
                                value={templateId}
                                onChange={(e) => setTemplateId(e.target.value)}
                                placeholder="template_xxxx"
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-250 dark:border-white/5 bg-slate-50/50 dark:bg-white/3 text-slate-900 dark:text-white text-xs font-mono"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                                Public Key
                              </label>
                              <input
                                type="text"
                                value={publicKey}
                                onChange={(e) => setPublicKey(e.target.value)}
                                placeholder="publicKey_xxxxxxxx"
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-250 dark:border-white/5 bg-slate-50/50 dark:bg-white/3 text-slate-900 dark:text-white text-xs font-mono"
                              />
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handleSaveConfig}
                          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-semibold cursor-pointer transition-all shadow-md mt-2"
                        >
                          Enregistrer la configuration
                        </button>
                      </div>
                    </motion.div>
                  </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
