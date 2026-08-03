
'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RainDrop {
  id: number;
  left: number;
  delay: number;
  duration: number;
  height: number;
}

interface LightningBolt {
  id: number;
  left: number;
  branches: Array<{ x: number; y: number }>;
}

interface SlideConfig {
  title: string;
  subtitle: string;
  theme: 'day' | 'night' | 'sunset';
  bgGradient: string;
  rainColor: string;
  lightningInterval: number;
  lightningChance: number;
}


const SLIDE_CONFIGS: SlideConfig[] = [
  {
    title: "Peaceful Morning",
    subtitle: "Start your day with gentle rain",
    theme: "day",
    bgGradient: "from-sky-200 via-blue-100 to-white",
    rainColor: "from-transparent via-blue-400/60 to-blue-600/80",
    lightningInterval: 15000,
    lightningChance: 0.3,
  },
  {
    title: "Thunder Storm",
    subtitle: "Nature's powerful symphony",
    theme: "night",
    bgGradient: "from-slate-900 via-indigo-950 to-black",
    rainColor: "from-transparent via-slate-300/60 to-blue-500/80",
    lightningInterval: 4000,
    lightningChance: 0.9,
  },
  {
    title: "Golden Sunset",
    subtitle: "Find peace in the chaos",
    theme: "sunset",
    bgGradient: "from-orange-300 via-purple-300 to-slate-800",
    rainColor: "from-transparent via-orange-200/60 to-purple-400/80",
    lightningInterval: 8000,
    lightningChance: 0.5,
  },
];

export default function StormAnimation() {
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);
  const [lightning, setLightning] = useState<LightningBolt | null>(null);
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const currentConfig = SLIDE_CONFIGS[currentSlide];

  
  useEffect(() => {
    const drops: RainDrop[] = [];
    for (let i = 0; i < 120; i++) {
      drops.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 2,
        height: 15 + Math.random() * 20,
      });
    }
    setRainDrops(drops);
  }, []);

  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDE_CONFIGS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    let interval: NodeJS.Timeout;

    const tryCreateLightning = () => {
      if (Math.random() < currentConfig.lightningChance) {
        const branches: Array<{ x: number; y: number }> = [];
        let currentX = 50;
        let currentY = 0;
        
        for (let i = 0; i < 6; i++) {
          branches.push({ x: currentX, y: currentY });
          currentX += (Math.random() - 0.5) * 15;
          currentY += 16;
        }
        
        setLightning({
          id: Date.now(),
          left: Math.random() * 80 + 10,
          branches,
        });

        const flashIntensity = currentConfig.theme === 'day' ? 0.2 : 0.5;
        setFlashOpacity(flashIntensity);
        
        setTimeout(() => setFlashOpacity(0), 150);
        setTimeout(() => setLightning(null), 600);
      }
    };

 
    interval = setInterval(tryCreateLightning, currentConfig.lightningInterval);
    
    return () => clearInterval(interval);
  }, [currentSlide]); 

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 transition-colors duration-1000">

      <motion.div
        className={`absolute inset-0 bg-gradient-to-b ${currentConfig.bgGradient}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />

      
      <motion.div
        className="absolute inset-0 bg-white mix-blend-overlay"
        style={{ opacity: flashOpacity }}
      />

      
      <div className="absolute top-0 left-0 right-0 h-48">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`cloud-${i}`}
            className={`absolute rounded-full blur-2xl transition-colors duration-1000 ${
              currentConfig.theme === 'day' ? 'bg-white/40' : 
              currentConfig.theme === 'sunset' ? 'bg-orange-900/30' : 'bg-gray-800/40'
            }`}
            style={{
              width: `${300 + i * 50}px`,
              height: `${120 + i * 30}px`,
              left: `${10 + i * 18}%`,
              top: `${20 + i * 10}px`,
            }}
            animate={{
              x: [0, 30, 0],
            }}
            transition={{
              duration: 25 + i * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {rainDrops.map((drop) => (
          <motion.div
            key={drop.id}
            className={`absolute w-px bg-gradient-to-b rounded-full ${currentConfig.rainColor}`}
            style={{
              left: `${drop.left}%`,
              height: drop.height,
              top: -30,
            }}
            animate={{
              y: ['0vh', '100vh'],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              y: {
                duration: drop.duration,
                repeat: Infinity,
                ease: "linear",
                delay: drop.delay,
              },
              opacity: {
                duration: drop.duration,
                repeat: Infinity,
                times: [0, 0.2, 1],
                delay: drop.delay,
              },
            }}
          />
        ))}
      </AnimatePresence>

      
      <AnimatePresence>
        {lightning && (
          <motion.svg
            className="absolute"
            style={{
              left: `${lightning.left}%`,
              top: 0,
              width: '80px',
              height: '100%',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            viewBox="0 0 100 1000"
          >
            <motion.path
              d={`M ${lightning.branches.map(b => `${b.x} ${b.y}`).join(' L ')}`}
              stroke={currentConfig.theme === 'day' ? "#FFF" : "#FFD700"}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.15 }}
            />
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          </motion.svg>
        )}
      </AnimatePresence>

      
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="text-center px-8"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <h1 className={`text-6xl md:text-8xl font-bold mb-4 tracking-tight drop-shadow-lg ${
              currentConfig.theme === 'day' ? 'text-slate-800' : 'text-white'
            }`} 
                style={{ fontFamily: "'Playfair Display', serif" }}>
              {currentConfig.title}
            </h1>
            <p className={`text-xl md:text-2xl font-light tracking-wide drop-shadow-md ${
              currentConfig.theme === 'day' ? 'text-slate-600' : 'text-blue-100/90'
            }`}
               style={{ fontFamily: "'Inter', sans-serif" }}>
              {currentConfig.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
        {SLIDE_CONFIGS.map((_, index) => (
          <motion.div
            key={index}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              currentConfig.theme === 'day' ? 'bg-slate-400/50' : 'bg-white/30'
            }`}
            animate={{
              backgroundColor: currentSlide === index 
                ? (currentConfig.theme === 'day' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)')
                : (currentConfig.theme === 'day' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.3)'),
              scale: currentSlide === index ? 1.2 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}
