import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ArrowUpRight, X, Shield, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260517_222138_3e3205be-3364-417b-a64a-bfe087acbec4.mp4';
const ACCENT_COLOR = '#5E0ED7';

// Animation variants
const fadeDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.1,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const fadeUp: Variants = {
  initial: { opacity: 0, y: 32 },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.12,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const headingSlideUp: Variants = {
  initial: { y: '110%' },
  animate: (wordIndex: number) => ({
    y: '0%',
    transition: {
      delay: 0.4 + wordIndex * 0.14,
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const navItems = [
  { label: 'QDS Engine', href: '#engine' },
  { label: 'Threat Matrix', href: '#threats' },
  { label: 'Simulator', href: '#simulator' },
  { label: 'Audit Trail', href: '#audit' },
];

const stats = [
  { value: '99.9%', label: 'DETECTION\nACCURACY' },
  { value: '500K+', label: 'SIGNATURES\nVERIFIED' },
  { value: '100%', label: 'QUANTUM\nRESISTANT' },
];

const headingWords = ['Quantum', 'Shield', 'Delivered'];

export const VideoHeroPage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleCtaClick = () => {
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-white font-inter font-semibold uppercase tracking-widest text-black select-none">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        src={VIDEO_URL}
      />

      {/* 1. TOP NAVIGATION BAR */}
      <header className="relative z-20 w-full flex items-center justify-between px-5 sm:px-8 md:px-12 pt-5 md:pt-6">
        {/* Left: Circular Logo + Brand Name */}
        <motion.div
          custom={0}
          initial="initial"
          animate="animate"
          variants={fadeDown}
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full border-2 border-[#5E0ED7] flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-[#5E0ED7]" />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-widest text-black group-hover:text-[#5E0ED7] transition-colors">
            Q-SHIELD
          </span>
        </motion.div>

        {/* Center: Desktop Nav Links (hidden on mobile, visible md+) */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-10">
          {navItems.map((item, idx) => (
            <motion.a
              key={item.label}
              href={item.href}
              custom={idx + 1}
              initial="initial"
              animate="animate"
              variants={fadeDown}
              className="text-xs lg:text-sm font-semibold tracking-widest uppercase text-black hover:text-[#5E0ED7] transition-colors"
            >
              {item.label}
            </motion.a>
          ))}
        </nav>

        {/* Right: Quick Launch Button + 36px Round Hamburger Button */}
        <div className="flex items-center gap-3">
          <motion.button
            custom={4}
            initial="initial"
            animate="animate"
            variants={fadeDown}
            onClick={handleCtaClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#5E0ED7] transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <span>Launch Console</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </motion.button>

          <motion.button
            custom={5}
            initial="initial"
            animate="animate"
            variants={fadeDown}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="w-9 h-9 rounded-full bg-black flex flex-col items-center justify-center gap-1 cursor-pointer transition-transform hover:scale-105 active:scale-95 z-20 shadow-sm"
          >
            <span className="w-4 h-[2px] bg-white rounded-full" />
            <span className="w-4 h-[2px] bg-white rounded-full" />
            <span className="w-4 h-[2px] bg-white rounded-full" />
          </motion.button>
        </div>
      </header>

      {/* 2. MIDDLE SECTION: STATS ROW */}
      <section className="relative z-10 flex-1 flex items-center justify-end px-5 sm:px-8 md:px-12 py-8 md:py-0">
        <div className="flex items-center gap-5 sm:gap-8 md:gap-10">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              custom={idx + 2}
              initial="initial"
              animate="animate"
              variants={fadeUp}
              className="flex flex-col items-end text-right"
            >
              <div className="text-[clamp(1.5rem,5vw,3.5rem)] font-semibold leading-none text-black flex items-start">
                <span className="text-[0.55em] text-[#5E0ED7] inline-block font-semibold mr-0.5 mt-0.5">
                  +
                </span>
                <span>{stat.value.replace('+', '')}</span>
              </div>
              <p className="mt-1 text-[10px] sm:text-xs md:text-sm font-semibold tracking-widest uppercase text-black whitespace-pre-line leading-tight text-right">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. BOTTOM SECTION: Pinned with padding */}
      <footer className="relative z-10 px-5 sm:px-8 md:px-12 pb-8 md:pb-12 flex flex-col gap-6 md:gap-10 lg:gap-12">
        {/* Row A: Tagline + CTA */}
        <div className="flex items-center justify-between gap-4">
          {/* Tagline Paragraph (Q-SHIELD Zero-Trust Copy) */}
          <motion.p
            custom={5}
            initial="initial"
            animate="animate"
            variants={fadeUp}
            className="text-[10px] sm:text-xs md:text-sm font-semibold tracking-widest uppercase text-black leading-snug max-w-[150px] sm:max-w-[190px] md:max-w-sm"
          >
            Defending Digital <br />
            Signatures Against <br />
            Quantum Threats
          </motion.p>

          {/* Prominent CTA Button -> navigates to /login */}
          <motion.button
            custom={6}
            initial="initial"
            animate="animate"
            variants={fadeUp}
            onClick={handleCtaClick}
            className="group px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-full bg-black/90 hover:bg-[#5E0ED7] text-white flex items-center gap-2 sm:gap-2.5 transition-all duration-300 hover:shadow-[0_0_25px_rgba(94,14,215,0.5)] active:scale-[0.97] cursor-pointer"
          >
            <span className="text-xs sm:text-base md:text-lg font-semibold tracking-widest uppercase">
              Get Started / Sign In
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-black flex items-center justify-center group-hover:bg-white group-hover:text-[#5E0ED7] transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </motion.button>
        </div>

        {/* Row B: Description + Main Heading */}
        <div className="flex items-end justify-between gap-3 sm:gap-4">
          {/* Fixed-width Description Container */}
          <motion.div
            custom={7}
            initial="initial"
            animate="animate"
            variants={fadeUp}
            className="w-[130px] sm:w-[200px] md:w-[320px] shrink-0"
          >
            <p className="text-[9px] sm:text-xs md:text-sm font-semibold tracking-widest uppercase text-left md:text-right text-black leading-relaxed">
              Teleportation-Based Quantum Digital Signature & Threat Detection Platform Securing Zero-Trust Ecosystems
            </p>
          </motion.div>

          {/* Main Heading: 3 words stacked vertically with clip reveal effect */}
          <div className="flex flex-col items-end text-right">
            {headingWords.map((word, wordIndex) => (
              <div key={word} className="overflow-hidden">
                <motion.h1
                  custom={wordIndex}
                  initial="initial"
                  animate="animate"
                  variants={headingSlideUp}
                  className="text-[clamp(2rem,9vw,9rem)] leading-[0.88] font-semibold uppercase text-black text-right tracking-tight"
                >
                  {word}
                </motion.h1>
              </div>
            ))}
          </div>
        </div>
      </footer>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-white flex flex-col justify-between px-5 sm:px-8 py-5 md:py-6"
          >
            {/* Top Row: Logo + Close Button */}
            <div className="flex items-center justify-between">
              <div
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/');
                }}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full border-2 border-[#5E0ED7] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#5E0ED7]" />
                </div>
                <span className="text-sm font-bold tracking-widest text-black">
                  Q-SHIELD
                </span>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white cursor-pointer transition-transform hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Middle: Vertical List of Nav Links */}
            <nav className="flex flex-col gap-6 sm:gap-8 mt-12 sm:mt-16">
              {navItems.map((item, idx) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.08, duration: 0.4 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl sm:text-3xl font-semibold tracking-widest uppercase text-black hover:text-[#5E0ED7] transition-colors"
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>

            {/* Bottom: Enter Platform CTA */}
            <div className="mt-auto pt-8">
              <button
                onClick={handleCtaClick}
                className="w-full py-4 rounded-xl bg-black text-white text-base font-semibold tracking-widest uppercase flex items-center justify-center gap-3 hover:bg-[#5E0ED7] transition-all cursor-pointer shadow-lg active:scale-98"
              >
                <span>Enter Console / Sign In</span>
                <ArrowUpRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
