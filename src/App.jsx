import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Stethoscope, Leaf, Activity, MapPin, Phone, 
  MessageCircle, ShieldCheck, Clock, CheckCircle2, 
  ChevronRight, ArrowUpRight, Lock, Menu, X, Sparkles,
  Award, HeartHandshake, ExternalLink
} from 'lucide-react';
const heroClinicBg = '/dency_consulta_clean_final.jpg';

const fadeInUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
};

export default function App() {
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 180]);
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0.15]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '#especialidades', label: 'Especialidades' },
    { href: '#equipo-medico', label: 'Dr. Valverde' },
    { href: '#convenios', label: 'Convenios' },
    { href: '#ubicacion', label: 'Ubicación y Contacto' },
  ];

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900 selection:bg-valvermed-teal/20 selection:text-valvermed-teal overflow-x-hidden w-full relative">
      
      {/* 1. TOP CLINICAL & SECURITY BAR */}
      <header className="bg-gray-900 text-gray-300 py-1.5 px-3 sm:px-6 text-[10px] sm:text-[11px] font-medium tracking-wide flex justify-between items-center z-50 relative w-full border-b border-gray-800/80">
        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
          <span className="flex items-center gap-1.5 whitespace-nowrap truncate">
            <MapPin size={11} className="text-valvermed-tealLight shrink-0" />
            <span>O'Higgins 678, Castro</span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-gray-400">
            <Clock size={11} className="text-valvermed-tealLight shrink-0" />
            <span>Lun - Vie 09:00 - 20:00</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-valvermed-tealLight shrink-0">
          <Lock size={11} className="shrink-0" />
          <span className="uppercase tracking-widest text-[9px] sm:text-[10px] font-semibold">Ley 21.719</span>
        </div>
      </header>

      {/* 2. RESPONSIVE NAVIGATION */}
      <nav 
        aria-label="Navegación principal"
        className={`fixed w-full z-40 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md border-b border-gray-200/90 py-2.5 sm:py-3 shadow-sm top-[29px] sm:top-[31px]' 
            : 'bg-gradient-to-b from-black/70 via-black/30 to-transparent border-transparent py-3 sm:py-5 top-[29px] sm:top-[31px]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex justify-between items-center w-full">
          
          {/* BRAND LOGO */}
          <a href="#" className="flex items-center gap-2.5 sm:gap-3.5 group focus:outline-none">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 border-white/80 shadow-md flex items-center justify-center overflow-hidden shrink-0 bg-white group-hover:scale-105 transition-transform">
              <img src="/logo-ig.jpg" alt="Logo Valvermed" className="w-full h-full object-cover scale-[1.12]" />
            </div>
            <div className="flex flex-col">
              <span className={`font-serif text-lg sm:text-2xl font-bold tracking-tight leading-none transition-colors drop-shadow-sm ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                Valvermed
              </span>
              <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] transition-colors mt-0.5 ${scrolled ? 'text-valvermed-teal' : 'text-valvermed-tealLight'}`}>
                Centro Médico
              </span>
            </div>
          </a>
          
          {/* DESKTOP NAV LINKS */}
          <div className={`hidden lg:flex items-center gap-7 text-sm font-semibold transition-colors ${scrolled ? 'text-gray-700' : 'text-gray-200'}`}>
            {navLinks.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                className="hover:text-valvermed-tealLight transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-valvermed-tealLight hover:after:w-full after:transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* DESKTOP & MOBILE ACTIONS */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <a 
              href="https://wa.me/56963029722" 
              target="_blank" 
              rel="noreferrer" 
              className="hidden sm:inline-flex bg-valvermed-teal hover:bg-valvermed-teal/90 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              <MessageCircle size={16} />
              <span>Portal de Pacientes</span>
            </a>

            {/* MOBILE HAMBURGER TOGGLE */}
            <button 
              type="button"
              aria-label="Abrir menú de navegación"
              onClick={() => setMobileMenuOpen(true)}
              className={`lg:hidden p-2 rounded-lg transition-all focus:outline-none active:scale-95 ${
                scrolled 
                  ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' 
                  : 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30'
              }`}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE FULLSCREEN DRAWER MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex justify-end"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-white w-[85%] max-w-sm h-full flex flex-col p-6 shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* DRAWER HEADER */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden shrink-0">
                    <img src="/logo-ig.jpg" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-serif font-bold text-gray-900 text-lg block leading-none">Valvermed</span>
                    <span className="text-[9px] font-bold text-valvermed-teal uppercase tracking-widest">Centro Médico</span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setMobileMenuOpen(false)} 
                  className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors active:scale-95"
                  aria-label="Cerrar menú"
                >
                  <X size={20} />
                </button>
              </div>

              {/* DRAWER LINKS */}
              <nav className="flex flex-col gap-1 text-base font-medium text-gray-800">
                {navLinks.map((link) => (
                  <a 
                    key={link.href}
                    href={link.href} 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="px-3 py-3 rounded-lg hover:bg-gray-50 hover:text-valvermed-teal transition-colors flex items-center justify-between text-gray-700"
                  >
                    <span>{link.label}</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </a>
                ))}
              </nav>

              {/* QUICK CLINICAL CONTACT CARDS IN MENU */}
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs">
                  <p className="font-semibold text-gray-900 flex items-center gap-1.5 mb-1">
                    <Clock size={13} className="text-valvermed-teal" /> Horario de Atención
                  </p>
                  <p className="text-gray-600 font-light pl-4">Lunes a Viernes: 09:00 - 20:00 hrs</p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs">
                  <p className="font-semibold text-gray-900 flex items-center gap-1.5 mb-1">
                    <MapPin size={13} className="text-valvermed-teal" /> Dirección
                  </p>
                  <p className="text-gray-600 font-light pl-4">O'Higgins 678, Piso 2, Castro</p>
                </div>
              </div>

              {/* ACTION BUTTON IN MENU */}
              <div className="mt-auto pt-6">
                <a 
                  href="https://wa.me/56963029722" 
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-valvermed-teal hover:bg-valvermed-tealLight text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-colors"
                >
                  <MessageCircle size={18} />
                  <span>Agendar por WhatsApp</span>
                </a>
                <p className="text-center text-[10px] text-gray-400 mt-3">
                  Registro Superintendencia: 24721-4
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. HERO PARALLAX SECTION WITH OFFICIAL CLINIC BACKGROUND */}
      <section className="relative min-h-[580px] sm:min-h-[640px] md:h-[90vh] flex items-center overflow-hidden bg-gray-950 pt-20 pb-12 sm:py-0">
        
        {/* PARALLAX BACKGROUND WITH CLEAN REAL CLINIC CONSULTATION PHOTO (DR. DENCY & RECEPCION EN MADERA) */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 z-0">
          <img 
            src={heroClinicBg} 
            alt="Dr. Dency Valverde en la Recepción y Consulta Valvermed Castro" 
            className="w-full h-full object-cover object-[60%_center] md:object-[75%_center] lg:object-[80%_center] scale-105" 
          />
          {/* Refined gradient overlay: rich dark gradient on the left for text readability, clear visibility on the right for Dr. Dency and the wooden clinic */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 md:via-gray-950/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/40"></div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full mt-6 sm:mt-12 md:mt-16">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer} 
            className="max-w-2xl w-full"
          >
            {/* BADGE */}
            <motion.div 
              variants={fadeInUp} 
              className="inline-flex items-center gap-2 border border-valvermed-tealLight/40 text-valvermed-tealLight bg-valvermed-tealLight/10 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-4 sm:mb-6 shadow-sm"
            >
              <ShieldCheck size={14} className="shrink-0" />
              <span>Salud Integral en Chiloé</span>
            </motion.div>
            
            {/* HEADLINE */}
            <motion.h1 
              variants={fadeInUp} 
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white leading-[1.15] sm:leading-[1.1] mb-3 sm:mb-6 tracking-tight"
            >
              Medicina de precisión,<br />
              <span className="text-valvermed-tealLight italic font-normal">cuidado humano.</span>
            </motion.h1>
            
            {/* SUBHEADLINE */}
            <motion.p 
              variants={fadeInUp} 
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-10 leading-relaxed font-light max-w-xl drop-shadow-sm"
            >
              Un abordaje sistémico liderado por el <strong className="font-semibold text-white">Dr. Dency Valverde</strong>. Fusionamos el rigor de la medicina alopática con avanzadas terapias biorreguladoras y diagnósticos funcionales.
            </motion.p>
            
            {/* CTA BUTTONS - STACKED ON MOBILE (375px), ROW ON TABLET/DESKTOP */}
            <motion.div 
              variants={fadeInUp} 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
            >
              <a 
                href="https://wa.me/56963029722" 
                target="_blank"
                rel="noreferrer"
                className="bg-valvermed-teal hover:bg-valvermed-tealLight text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-semibold transition-all flex items-center justify-center gap-2 group shadow-lg hover:shadow-valvermed-teal/30 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
              >
                <span>Agendar Atención</span>
                <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
              </a>

              <a 
                href="#especialidades" 
                className="bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-md px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-semibold transition-all flex items-center justify-center w-full sm:w-auto text-center active:scale-[0.98]"
              >
                <span>Ver Especialidades</span>
              </a>
            </motion.div>

            {/* TRUST PILLS */}
            <motion.div 
              variants={fadeInUp}
              className="mt-8 sm:mt-10 pt-6 border-t border-white/15 flex flex-wrap items-center gap-y-2 gap-x-4 text-[11px] sm:text-xs text-gray-300"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-valvermed-tealLight shrink-0" />
                +20 años de experiencia en Chiloé
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-valvermed-tealLight shrink-0" />
                Box clínico propio en Castro
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. DOCTOR PROFILE SECTION */}
      <section id="equipo-medico" className="py-14 sm:py-20 md:py-28 bg-gray-50 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-10 sm:gap-12 lg:gap-16 items-center">
            
            {/* DOCTOR IMAGE COLUMN */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true, margin: "-50px" }} 
              className="w-full lg:w-5/12 max-w-sm sm:max-w-md mx-auto lg:max-w-none"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl relative border-4 border-white bg-gray-900 group">
                <img 
                  src="/doctor_upload_1.png" 
                  alt="Dr. Dency C. Valverde Cornejo" 
                  className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none"></div>
                
                {/* MEDICAL REGISTRATION BADGE */}
                <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5 right-3 sm:right-5">
                  <div className="bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-md border border-gray-100">
                    <p className="text-gray-900 font-bold mb-0.5 flex items-center gap-1.5 text-xs sm:text-sm">
                      <CheckCircle2 size={16} className="text-valvermed-teal shrink-0" /> 
                      <span>Registro Médico: 24721-4</span>
                    </p>
                    <p className="text-gray-500 text-[10px] sm:text-[11px] font-medium">
                      Superintendencia de Salud, Gobierno de Chile
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* TEXT & BIOGRAPHY COLUMN */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true, margin: "-50px" }} 
              className="w-full lg:w-7/12"
            >
              <span className="text-[10px] sm:text-xs font-bold text-valvermed-teal tracking-widest uppercase mb-2 sm:mb-3 block">
                Director Clínico & Fundador
              </span>
              
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif mb-4 sm:mb-6 text-gray-900 leading-tight">
                Dr. Dency C. Valverde Cornejo
              </h2>
              
              <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed font-light">
                Médico Cirujano con más de <strong className="font-semibold text-gray-900">20 años de trayectoria ininterrumpida en Chiloé</strong>. Su práctica se fundamenta en la integración de la medicina alopática basada en evidencia con herramientas de modulación biorreguladora, abordando la patología desde su origen metabólico y sistémico.
              </p>
              
              {/* CAREER TIMELINE GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200/80 shadow-sm relative pl-4 border-l-4 border-l-gray-400">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">Médico Jefe ACHS</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Asociación Chilena de Seguridad</p>
                  <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">2003 — 2021</span>
                </div>
                
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200/80 shadow-sm relative pl-4 border-l-4 border-l-gray-400">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">Servicio de Urgencias</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Hospital Augusto Riffart, Castro</p>
                  <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">2013 — 2014</span>
                </div>
                
                <div className="bg-valvermed-teal/5 p-4 sm:p-5 rounded-xl border border-valvermed-teal/20 shadow-sm relative pl-4 border-l-4 border-l-valvermed-teal sm:col-span-2">
                  <h3 className="font-bold text-valvermed-teal text-sm sm:text-base mb-1">Director y Fundador Valvermed</h3>
                  <p className="text-xs sm:text-sm text-gray-700 mb-1">Medicina Privada de Precisión y Salud Integral</p>
                  <span className="text-[10px] font-bold tracking-wider text-valvermed-teal uppercase">2022 — Actualidad</span>
                </div>
              </div>

              {/* QUICK CTA */}
              <div className="mt-8">
                <a 
                  href="https://wa.me/56963029722" 
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-valvermed-teal font-semibold text-sm hover:text-valvermed-tealLight transition-colors"
                >
                  <span>Consultar disponibilidad con el Dr. Valverde</span>
                  <ChevronRight size={16} />
                </a>
              </div>
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* 5. CLINICAL SPECIALTIES */}
      <section id="especialidades" className="py-14 sm:py-20 md:py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-14 gap-4">
            <div className="max-w-2xl w-full">
              <span className="text-[10px] sm:text-xs font-bold text-valvermed-teal tracking-widest uppercase mb-2 sm:mb-3 block">
                Catálogo de Especialidades
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif text-gray-900 leading-tight">
                Abordaje Médico Multidisciplinario
              </h2>
            </div>
            <p className="text-gray-500 text-sm sm:text-base font-light max-w-md">
              Protocolos clínicos diseñados para restaurar la salud desde la prevención, la precisión diagnóstica y la modulación fisiológica.
            </p>
          </div>

          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-50px" }} 
            variants={staggerContainer} 
            className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8"
          >
            {[
              { 
                icon: <Leaf className="text-valvermed-leaf" size={24} />, 
                title: "Medicina Biorreguladora", 
                desc: "Esquemas terapéuticos intravenosos (Sueroterapia, Vitamina C en altas dosis), Acupuntura y homotoxicología para modular el sistema inmune sin suprimir la respuesta biológica.",
                tags: ["Sueroterapia", "Acupuntura", "Inmunidad"]
              },
              { 
                icon: <Activity className="text-valvermed-water" size={24} />, 
                title: "Diagnóstico Funcional", 
                desc: "Monitorización clínica integral. Realización de Electrocardiogramas (ECG), instalación de Holter de Arritmia y Holter de Presión Arterial para prevención cardiovascular precisa.",
                tags: ["Holter Arritmia", "Holter Presión", "ECG"]
              },
              { 
                icon: <Sparkles className="text-valvermed-teal" size={24} />, 
                title: "Estética Médica Periocular", 
                desc: "Procedimientos ambulatorios mínimamente invasivos con criterio quirúrgico y máxima bioseguridad. Evaluación experta para cirugía plástica periocular y rejuvenecimiento.",
                tags: ["Blefaroplastia", "Armonización", "Bioseguridad"]
              },
              { 
                icon: <Stethoscope className="text-emerald-600" size={24} />, 
                title: "Atención Médica General y Telemedicina", 
                desc: "Consultas de morbilidad aguda, control de patologías crónicas, emisión de certificados médicos y seguimiento a distancia mediante el Portal Valvermed Online.",
                tags: ["Morbilidad", "Crónicos", "Portal Online"]
              },
            ].map((srv, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp} 
                className="group relative bg-gray-50/70 p-5 sm:p-8 rounded-2xl border border-gray-100 hover:border-valvermed-teal/30 hover:bg-white transition-all duration-300 hover:shadow-xl overflow-hidden w-full flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center mb-5 border border-gray-100 group-hover:scale-110 transition-transform">
                    {srv.icon}
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-900 mb-2.5">
                    {srv.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed mb-5">
                    {srv.desc}
                  </p>
                </div>
                
                <div className="flex gap-1.5 sm:gap-2 flex-wrap pt-3 border-t border-gray-100/80">
                  {srv.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-white px-2.5 py-1 rounded-md border border-gray-200/60 group-hover:bg-valvermed-teal/5 group-hover:text-valvermed-teal group-hover:border-valvermed-teal/20 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. CONVENIOS STRIP */}
      <section id="convenios" className="py-10 sm:py-12 bg-gray-900 text-center border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 tracking-widest uppercase mb-4 sm:mb-6">
            Previsiones e Instituciones en Convenio
          </p>
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 md:gap-6 text-gray-200">
            {['Particular', 'Fonasa', 'Banmédica', 'CruzBlanca', 'Colmena', 'Nueva Más Vida', 'Consalud', 'Dipreca'].map((item) => (
              <span 
                key={item} 
                className="bg-gray-800/80 border border-gray-700/60 px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium hover:border-valvermed-tealLight/50 hover:text-white transition-colors"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CONTACT & LOCATION */}
      <section id="ubicacion" className="py-14 sm:py-20 md:py-28 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <span className="text-[10px] sm:text-xs font-bold text-valvermed-teal tracking-widest uppercase mb-2 block">
              Instalaciones & Agendamiento
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif text-gray-900">
              Visítenos en el Corazón de Castro
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* MAP CONTAINER */}
            <div className="lg:col-span-7 w-full h-[280px] sm:h-[380px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-gray-200 relative">
              <iframe 
                title="Mapa Ubicación Valvermed Castro"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2931.3283188544973!2d-73.7663273!3d-42.4783354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9622998a4d468161%3A0x6e2df19b0270b2cb!2sLibertador%20Bernardo%20O'Higgins%20678%2C%20Castro%2C%20Los%20Lagos!5e0!3m2!1ses-419!2scl!4v1714570000000!5m2!1ses-419!2scl" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              ></iframe>
            </div>
            
            {/* CONTACT CARD */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 w-full">
              <span className="text-[10px] font-bold text-valvermed-teal tracking-widest uppercase mb-1.5 block">
                Atención Presencial
              </span>
              <h3 className="text-xl sm:text-2xl font-serif text-gray-900 mb-6">
                Información de Contacto
              </h3>
              
              <div className="space-y-4 sm:space-y-5">
                <div className="flex gap-3.5 items-start">
                  <div className="p-2 rounded-lg bg-gray-100 text-valvermed-teal shrink-0 mt-0.5">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Consulta Valvermed</p>
                    <p className="text-xs text-gray-500 font-light mt-0.5">
                      Libertador Bernardo O'Higgins 678, Piso 2<br />Castro, Chiloé, Región de Los Lagos
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3.5 items-start">
                  <div className="p-2 rounded-lg bg-gray-100 text-valvermed-teal shrink-0 mt-0.5">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Horario de Consultas</p>
                    <p className="text-xs text-gray-500 font-light mt-0.5">
                      Lunes a Viernes: 09:00 AM — 20:00 PM
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3.5 items-start">
                  <div className="p-2 rounded-lg bg-gray-100 text-valvermed-teal shrink-0 mt-0.5">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Líneas de Atención</p>
                    <div className="text-xs text-gray-500 font-light mt-0.5 space-y-0.5">
                      <p><a href="tel:+56652548394" className="hover:text-valvermed-teal underline">+56 65 254 8394</a> (Fijo)</p>
                      <p><a href="tel:+56963029722" className="hover:text-valvermed-teal underline">+56 9 6302 9722</a> (Secretaría)</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <a 
                href="https://wa.me/56963029722" 
                target="_blank"
                rel="noreferrer"
                className="mt-6 sm:mt-8 w-full bg-valvermed-teal hover:bg-valvermed-teal/90 text-white text-center py-3.5 sm:py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group shadow-lg text-xs sm:text-sm active:scale-[0.99]"
              >
                <MessageCircle size={18} />
                <span>Solicitar Hora por WhatsApp</span>
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

          </div>
        </div>
      </section>
      
      {/* 8. STRICT PRIVACY FOOTER (Ley 21.719) */}
      <footer className="bg-black text-gray-400 py-12 sm:py-16 text-xs border-t border-gray-800 pb-36 sm:pb-28 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 text-left">
          
          <div className="md:col-span-4 flex flex-col items-start">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-full bg-white overflow-hidden shrink-0">
                <img src="/logo-ig.jpg" alt="Logo" className="w-full h-full object-cover scale-110" />
              </div>
              <span className="font-serif text-lg font-bold text-white">Valvermed</span>
            </div>
            <p className="font-light leading-relaxed text-xs max-w-sm text-gray-400">
              Medicina de precisión, terapias biorreguladoras y diagnóstico resolutivo en Castro, Chiloé. Rigor ético y calidad asistencial personalizada.
            </p>
          </div>
          
          <div className="md:col-span-5">
            <p className="text-white font-semibold mb-2 flex items-center gap-1.5 text-xs sm:text-sm">
              <ShieldCheck size={16} className="text-valvermed-tealLight shrink-0" />
              <span>Protección de Datos Clínicos (Ley N° 21.719)</span>
            </p>
            <p className="font-light leading-relaxed text-xs text-gray-400">
              Los historiales médicos y datos sensibles recopilados a través de nuestros canales oficiales están protegidos bajo la <strong>Ley N° 21.719</strong> sobre Protección de la Vida Privada y Datos Personales en Chile. Este portal cuenta con cifrado SSL de extremo a extremo.
            </p>
          </div>
          
          <div className="md:col-span-3 md:text-right flex flex-col justify-between">
            <div>
              <p className="text-white font-semibold mb-1 text-xs sm:text-sm">Dirección Médica</p>
              <p className="font-light text-xs text-gray-300">Dr. Dency Valverde Cornejo</p>
              <p className="font-light text-xs text-gray-400">Registro Médico: 24721-4</p>
            </div>
            <p className="mt-6 opacity-60 text-[10px] text-gray-500">
              © {new Date().getFullYear()} Valvermed.<br />
              Desarrollo de Arquitectura: KIO Agency.
            </p>
          </div>
          
        </div>
      </footer>

      {/* 9. DYNAMIC FLOATING WHATSAPP BUTTON (COLLISION-FREE WITH PRIVACY BANNER) */}
      <aside aria-label="Contacto flotante">
        <a 
          href="https://wa.me/56963029722" 
          target="_blank"
          rel="noreferrer"
          aria-label="Contactar por WhatsApp a Valvermed"
          className={`fixed right-4 sm:right-6 z-50 bg-[#25D366] hover:bg-[#20ba59] text-white p-3.5 sm:p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group ${
            showPrivacyBanner 
              ? 'bottom-28 sm:bottom-24 md:bottom-8' 
              : 'bottom-6 md:bottom-8'
          }`}
        >
          <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
          <span className="sr-only">Contactar por WhatsApp</span>
        </a>
      </aside>

      {/* 10. COOKIE & PRIVACY BANNER (LEY 21.719) */}
      <AnimatePresence>
        {showPrivacyBanner && (
          <motion.div 
            initial={{ y: 150, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 150, opacity: 0 }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 p-3.5 sm:p-4 shadow-[0_-10px_35px_rgba(0,0,0,0.3)] z-40 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-5"
          >
            <div className="flex items-start gap-2.5 sm:gap-3.5 max-w-5xl">
              <div className="p-1.5 rounded-md bg-valvermed-teal/20 text-valvermed-tealLight shrink-0 mt-0.5">
                <Lock size={16} />
              </div>
              <p className="text-[11px] sm:text-xs text-gray-300 font-light leading-relaxed">
                <strong className="text-white font-semibold">Cumplimiento Ley 21.719:</strong> Este sitio utiliza cookies técnicas esenciales y garantiza estricta confidencialidad médica sin rastreo publicitario.
              </p>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button 
                type="button"
                onClick={() => setShowPrivacyBanner(false)} 
                className="w-full sm:w-auto bg-valvermed-teal hover:bg-valvermed-tealLight text-white px-5 sm:px-6 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors whitespace-nowrap active:scale-95 shadow-sm"
              >
                Aceptar Política
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
