/**
 * FAIL FRENZY — Tutorial & Cinematic Intro
 * Phase 1: Onboarding interactif + cinématique narrative
 */

import React, { useState, useEffect, useCallback } from 'react';

const BASE = import.meta.env.BASE_URL;

// ==================== CINEMATIC INTRO ====================

interface CinematicStep {
  text: string;
  subtext?: string;
  color: string;
  duration: number;
}

const CINEMATIC_STEPS: CinematicStep[] = [
  { text: 'DANS LES CONFINS DE L\'ESPACE...', subtext: 'Une planète mourante appelle à l\'aide.', color: '#00f0ff', duration: 3000 },
  { text: 'XYLOS', subtext: 'Son énergie s\'éteint. Ses derniers Échos de Lumière se dispersent dans le vide.', color: '#ff00ff', duration: 3500 },
  { text: 'VOUS ÊTES UN ÉCHO-PILOTE', subtext: 'Votre mission : collecter les étoiles d\'énergie et les ramener à Xylos.', color: '#ffd700', duration: 3500 },
  { text: 'MAIS LE VIDE N\'EST PAS VIDE...', subtext: 'Trous noirs, débris stellaires et anomalies gravitationnelles vous guettent.', color: '#ff4444', duration: 3000 },
  { text: 'FAIL FRENZY', subtext: 'Échos du Vide', color: '#00f0ff', duration: 2500 },
];

export const CinematicIntro: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setTextVisible(true);
  }, []);

  useEffect(() => {
    if (step >= CINEMATIC_STEPS.length) {
      onComplete();
      return;
    }
    setTextVisible(true);
    const timer = setTimeout(() => {
      setTextVisible(false);
      setTimeout(() => setStep(s => s + 1), 500);
    }, CINEMATIC_STEPS[step].duration);
    return () => clearTimeout(timer);
  }, [step, onComplete]);

  if (step >= CINEMATIC_STEPS.length) return null;
  const current = CINEMATIC_STEPS[step];
  const isTitle = step === CINEMATIC_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: '#050818', opacity: visible ? 1 : 0, transition: 'opacity 0.5s' }}
      onClick={() => onComplete()}>

      {/* Starfield background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: 1 + Math.random() * 2,
              height: 1 + Math.random() * 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: current.color,
              opacity: 0.2 + Math.random() * 0.5,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }} />
        ))}
      </div>

      <div className="text-center px-6 relative z-10"
        style={{ opacity: textVisible ? 1 : 0, transform: textVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}>

        {isTitle ? (
          <>
            <img src={`${BASE}01_BRANDING/Logo_Principal_Skull_Glitch.png`} alt=""
              className="w-24 sm:w-32 mx-auto mb-6"
              style={{ filter: `drop-shadow(0 0 30px ${current.color})` }} />
            <h1 className="text-4xl sm:text-6xl font-black mb-2 tracking-tight">
              <span style={{ color: '#00f0ff', textShadow: '0 0 30px rgba(0,240,255,0.6)' }}>FAIL</span>
              <span style={{ color: '#ff00ff', textShadow: '0 0 30px rgba(255,0,255,0.6)' }} className="ml-2">FRENZY</span>
            </h1>
            <p className="text-lg sm:text-xl font-mono" style={{ color: '#ffffff88' }}>Échos du Vide</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl sm:text-4xl font-black mb-3 tracking-wide"
              style={{ color: current.color, textShadow: `0 0 30px ${current.color}66` }}>
              {current.text}
            </h2>
            {current.subtext && (
              <p className="text-sm sm:text-base font-mono max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {current.subtext}
              </p>
            )}
          </>
        )}
      </div>

      {/* Skip hint */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs font-mono animate-pulse" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Appuyez pour passer
        </p>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

// ==================== TUTORIAL OVERLAY ====================

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
  color: string;
  highlight?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'DÉPLACEZ VOTRE VAISSEAU',
    description: 'Touchez l\'écran ou utilisez les flèches du clavier pour déplacer votre Vaisseau-Écho.',
    icon: '🚀',
    color: '#00f0ff',
    highlight: 'Le losange bleu, c\'est vous !',
  },
  {
    title: 'ESQUIVEZ LES OBSTACLES',
    description: 'Évitez les débris stellaires : Dashers (jaunes), Orbiters (violets) et Shakers (cyan).',
    icon: '⚠️',
    color: '#ff4444',
    highlight: 'Chaque type a un comportement unique.',
  },
  {
    title: 'COLLECTEZ LES ÉTOILES',
    description: 'Les étoiles dorées sont des Échos de Lumière. Collectez-les pour alimenter la planète Xylos.',
    icon: '⭐',
    color: '#ffd700',
    highlight: 'Chaque étoile = +5 énergie Xylos',
  },
  {
    title: 'BOUCLIER PROTECTEUR',
    description: 'Vous avez 3 charges de bouclier. Elles absorbent les impacts et se régénèrent lentement.',
    icon: '🛡️',
    color: '#00aaff',
    highlight: '3 orbes bleues autour de votre vaisseau',
  },
  {
    title: 'ATTENTION AUX TROUS NOIRS',
    description: 'Les trous noirs vous attirent avec leur gravité. Esquivez-les pour changer de galaxie !',
    icon: '🌀',
    color: '#8800ff',
    highlight: 'Contact = Game Over instantané !',
  },
  {
    title: 'ALIMENTEZ XYLOS',
    description: 'Remplissez la jauge Xylos en bas de l\'écran. À 100%, bonus massif + bouclier restauré !',
    icon: '🌍',
    color: '#ff00ff',
    highlight: 'Jauge en bas de l\'écran',
  },
];

export const TutorialOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const nextStep = useCallback(() => {
    if (step >= TUTORIAL_STEPS.length - 1) {
      localStorage.setItem('failfrenzy_tutorial_done', 'true');
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  }, [step, onComplete]);

  const skip = useCallback(() => {
    localStorage.setItem('failfrenzy_tutorial_done', 'true');
    onComplete();
  }, [onComplete]);

  const current = TUTORIAL_STEPS[step];
  const progress = (step + 1) / TUTORIAL_STEPS.length;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: 'rgba(5,8,24,0.95)', backdropFilter: 'blur(12px)', opacity: visible ? 1 : 0, transition: 'opacity 0.3s' }}>

      <div className="text-center px-6 max-w-md w-full">
        {/* Progress bar */}
        <div className="w-full h-1 rounded-full mb-8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%`, background: `linear-gradient(90deg, #00f0ff, ${current.color})` }} />
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {TUTORIAL_STEPS.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
              style={{ background: i === step ? current.color : i < step ? '#ffffff40' : '#ffffff15', transform: i === step ? 'scale(1.5)' : 'scale(1)' }} />
          ))}
        </div>

        {/* Icon */}
        <div className="text-5xl mb-4" style={{ filter: `drop-shadow(0 0 20px ${current.color})` }}>
          {current.icon}
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black mb-3 tracking-wide"
          style={{ color: current.color, textShadow: `0 0 20px ${current.color}44` }}>
          {current.title}
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base font-mono mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {current.description}
        </p>

        {/* Highlight */}
        {current.highlight && (
          <div className="inline-block px-4 py-1.5 rounded-lg mb-6"
            style={{ background: `${current.color}15`, border: `1px solid ${current.color}30` }}>
            <span className="text-xs font-bold" style={{ color: current.color }}>{current.highlight}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 items-center mt-4">
          <button onClick={nextStep}
            className="w-full max-w-xs py-3.5 font-black text-base rounded-xl transition-all hover:scale-105 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${current.color}, ${current.color}88)`, color: '#000', boxShadow: `0 0 25px ${current.color}33` }}>
            {step >= TUTORIAL_STEPS.length - 1 ? 'COMMENCER LA MISSION' : 'SUIVANT'}
          </button>
          <button onClick={skip}
            className="text-xs font-mono transition-all hover:opacity-100"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            Passer le tutoriel
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== HELPER ====================

export const shouldShowTutorial = (): boolean => {
  return !localStorage.getItem('failfrenzy_tutorial_done');
};

export const shouldShowCinematic = (): boolean => {
  return !localStorage.getItem('failfrenzy_cinematic_seen');
};

export const markCinematicSeen = (): void => {
  localStorage.setItem('failfrenzy_cinematic_seen', 'true');
};
