import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

interface CinematicIntroProps {
  visible: boolean;
  onComplete: () => void;
  brokerName?: string;
  creci?: string;
  tagline?: string;
}

const TOWER_BALCONY_YS = [304, 272, 240, 208, 176, 144, 112, 80];
const WING_BALCONY_YS = [304, 272, 240, 208, 176, 144];
const REFLECTION_RIPPLE_YS = [410, 426, 444, 464, 486, 510, 536];

export function CinematicIntro({
  visible,
  onComplete,
  brokerName = 'Bruno Diniz',
  creci = 'CRECI-PE 21512',
  tagline = 'Uma marca à altura de uma trajetória',
}: CinematicIntroProps) {
  const shouldReduceMotion = useReducedMotion();
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!visible) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const duration = shouldReduceMotion ? 1200 : 7000;
    const timer = window.setTimeout(() => {
      onCompleteRef.current();
    }, duration);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
    };
  }, [visible, shouldReduceMotion]);

  const letters = brokerName.split('');

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cinematic-intro"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#060608] text-[#F5F2EB] select-none"
        >
          {/* Abstract symmetrical atmospheric lighting mirroring the coastal skyline */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 85% 60% at 50% 42%, rgba(198, 161, 91, 0.13) 0%, rgba(18, 25, 38, 0.42) 45%, rgba(6, 6, 8, 1) 84%)',
            }}
          />

          {/* Full-bleed Abstract Mirrored Architectural Reflection Backdrop */}
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={
              shouldReduceMotion
                ? { opacity: 0.45, scale: 1 }
                : { opacity: [0, 0.35, 0.72, 0.62], scale: [1.04, 1.01, 1, 1] }
            }
            transition={{
              duration: 6.5,
              times: [0, 0.25, 0.65, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <svg
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full"
            >
              <defs>
                {/* Vertical architectural silhouette fade */}
                <linearGradient id="abstractTowerGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#C6A15B" stopOpacity="0.22" />
                  <stop offset="45%" stopColor="#E4C684" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#121826" stopOpacity="0" />
                </linearGradient>

                {/* Inverted coastal water-mirror gradient */}
                <linearGradient id="waterMirrorGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#C6A15B" stopOpacity="0.24" />
                  <stop offset="35%" stopColor="#C6A15B" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#060608" stopOpacity="0" />
                </linearGradient>

                {/* Bilateral horizontal gold ribbon gradient */}
                <linearGradient id="ribbonMirror" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C6A15B" stopOpacity="0" />
                  <stop offset="25%" stopColor="#C6A15B" stopOpacity="0.16" />
                  <stop offset="50%" stopColor="#F5F2EB" stopOpacity="0.22" />
                  <stop offset="75%" stopColor="#C6A15B" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#C6A15B" stopOpacity="0" />
                </linearGradient>

                {/* Soft abstract architectural dispersion */}
                <filter id="abstractSoft" x="-15%" y="-15%" width="130%" height="130%">
                  <feGaussianBlur stdDeviation="10" />
                </filter>
                <filter id="waterSoft" x="-15%" y="-15%" width="130%" height="130%">
                  <feGaussianBlur stdDeviation="6" />
                </filter>
              </defs>

              {/* Sweeping bilateral abstract waves mirroring the curved oceanfront balconies */}
              <g filter="url(#abstractSoft)" opacity="0.72">
                <motion.path
                  d="M -80 390 Q 400 220 800 320 T 1680 390"
                  stroke="url(#ribbonMirror)"
                  strokeWidth="3.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.path
                  d="M -80 510 Q 400 680 800 580 T 1680 510"
                  stroke="url(#ribbonMirror)"
                  strokeWidth="3.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.path
                  d="M 120 450 Q 460 110 800 230 T 1480 450"
                  stroke="url(#ribbonMirror)"
                  strokeWidth="1.8"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3.1, delay: 0.5, ease: 'easeOut' }}
                />
                <motion.path
                  d="M 120 450 Q 460 790 800 670 T 1480 450"
                  stroke="url(#ribbonMirror)"
                  strokeWidth="1.8"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3.1, delay: 0.5, ease: 'easeOut' }}
                />
              </g>

              {/* Abstract ghosted upward architectural prism mirroring the tower geometry */}
              <g filter="url(#abstractSoft)">
                <path
                  d="M 620 450 L 620 110 C 620 82 652 68 700 62 L 900 62 C 948 68 980 82 980 110 L 980 450 Z"
                  fill="url(#abstractTowerGlow)"
                />
                <path
                  d="M 520 450 L 520 190 L 620 175 L 620 450 Z"
                  fill="url(#abstractTowerGlow)"
                  opacity="0.55"
                />
                <path
                  d="M 1080 450 L 1080 190 L 980 175 L 980 450 Z"
                  fill="url(#abstractTowerGlow)"
                  opacity="0.55"
                />
              </g>

              {/* Abstract inverted water-mirror reflection directly below horizon */}
              <g filter="url(#waterSoft)">
                <path
                  d="M 620 455 L 620 795 C 620 825 652 840 700 846 L 900 846 C 948 840 980 825 980 795 L 980 455 Z"
                  fill="url(#waterMirrorGlow)"
                />
                <path
                  d="M 520 455 L 520 715 L 620 730 L 620 455 Z"
                  fill="url(#waterMirrorGlow)"
                  opacity="0.5"
                />
                <path
                  d="M 1080 455 L 1080 715 L 980 730 L 980 455 Z"
                  fill="url(#waterMirrorGlow)"
                  opacity="0.5"
                />
              </g>

              {/* Bilateral diagonal perspective light rays radiating symmetrically from center */}
              <g opacity="0.22">
                <line x1="800" y1="450" x2="80" y2="90" stroke="#C6A15B" strokeWidth="0.7" />
                <line x1="800" y1="450" x2="1520" y2="90" stroke="#C6A15B" strokeWidth="0.7" />
                <line x1="800" y1="450" x2="80" y2="810" stroke="#C6A15B" strokeWidth="0.7" />
                <line x1="800" y1="450" x2="1520" y2="810" stroke="#C6A15B" strokeWidth="0.7" />
                <line x1="800" y1="0" x2="800" y2="900" stroke="#C6A15B" strokeWidth="0.6" strokeDasharray="4 10" />
              </g>
            </svg>
          </motion.div>

          {/* Free-standing architectural drawing + its real-time abstract water reflection + large free-standing name */}
          <div className="relative z-10 flex w-full max-w-6xl flex-col items-center justify-center px-4">
            <motion.svg
              viewBox="0 0 1200 560"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-auto w-full max-w-[960px] overflow-visible"
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 1, 0.85] }}
              transition={{ duration: 6.8, times: [0, 0.72, 1] }}
            >
              <defs>
                <linearGradient id="goldDraft" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C6A15B" stopOpacity="0.12" />
                  <stop offset="28%" stopColor="#E9CC8B" stopOpacity="0.96" />
                  <stop offset="72%" stopColor="#C6A15B" stopOpacity="0.96" />
                  <stop offset="100%" stopColor="#C6A15B" stopOpacity="0.12" />
                </linearGradient>
                <linearGradient id="ivoryLine" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#F5F2EB" stopOpacity="0.2" />
                  <stop offset="42%" stopColor="#F5F2EB" stopOpacity="0.92" />
                  <stop offset="100%" stopColor="#E9CC8B" stopOpacity="0.98" />
                </linearGradient>
                <linearGradient id="mirrorFadeMask" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.34" />
                  <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
                <mask id="mirrorReflectionMask">
                  <rect x="0" y="396" width="1200" height="170" fill="url(#mirrorFadeMask)" />
                </mask>
              </defs>

              {/* Coastal Ocean Horizon & Abstract Waterline Ripples */}
              <motion.path
                d="M 20 398 Q 340 394 600 396 T 1180 398"
                stroke="url(#goldDraft)"
                strokeWidth="1.25"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.35, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Inverted Abstract Mirror Reflection of the Development beneath the Horizon */}
              <g mask="url(#mirrorReflectionMask)">
                <g transform="translate(0, 796) scale(1, -0.45)">
                  {/* Mirrored Main Tower Silhouette */}
                  <motion.path
                    d="M 418 332 L 418 76 C 418 56 444 46 484 42 L 716 42 C 756 46 782 56 782 76 L 782 332"
                    stroke="#C6A15B"
                    strokeWidth="2.2"
                    strokeDasharray="10 6"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2.0, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  />
                  {/* Mirrored Stepped Wings */}
                  <motion.path
                    d="M 348 340 L 348 134 L 418 126 M 852 340 L 852 134 L 782 126"
                    stroke="#F5F2EB"
                    strokeWidth="1.4"
                    strokeDasharray="8 6"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.75, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
                  />
                  {/* Mirrored Curved Balconies */}
                  {TOWER_BALCONY_YS.map((y, idx) => (
                    <motion.path
                      key={`mirror-balcony-${y}`}
                      d={`M 410 ${y} Q 600 ${y + 14} 790 ${y}`}
                      stroke="#C6A15B"
                      strokeWidth="1.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 0.9,
                        delay: 1.3 + idx * 0.12,
                        ease: 'easeOut',
                      }}
                    />
                  ))}
                </g>

                {/* Subtle Horizontal Abstract Water Ripples crossing the reflection */}
                {REFLECTION_RIPPLE_YS.map((ry, idx) => (
                  <motion.line
                    key={`ripple-${ry}`}
                    x1={220 + idx * 42}
                    y1={ry}
                    x2={980 - idx * 42}
                    y2={ry}
                    stroke="#C6A15B"
                    strokeWidth="0.9"
                    strokeOpacity={0.34 - idx * 0.04}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.4, delay: 0.6 + idx * 0.14, ease: 'easeOut' }}
                  />
                ))}
              </g>

              {/* Infinity Pool Deck, Podium & Porte-Cochere */}
              <motion.path
                d="M 275 396 L 275 344 L 418 332 L 782 332 L 925 344 L 925 396"
                stroke="url(#ivoryLine)"
                strokeWidth="1.45"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.path
                d="M 455 396 V 352 H 745 V 396 M 532 396 V 352 M 600 396 V 352 M 668 396 V 352"
                stroke="#C6A15B"
                strokeWidth="1.1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.35, delay: 0.72, ease: 'easeOut' }}
              />
              <motion.path
                d="M 300 374 H 442 M 758 374 H 900"
                stroke="#C6A15B"
                strokeOpacity="0.5"
                strokeWidth="0.9"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, delay: 0.95, ease: 'easeOut' }}
              />

              {/* Main Luxury Coastal Tower Architectural Spine */}
              <motion.path
                d="M 418 332 L 418 76 C 418 56 444 46 484 42 L 716 42 C 756 46 782 56 782 76 L 782 332"
                stroke="url(#ivoryLine)"
                strokeWidth="1.9"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.0, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Stepped Left & Right Oceanfront Wings */}
              <motion.path
                d="M 348 340 L 348 134 L 418 126 M 852 340 L 852 134 L 782 126"
                stroke="#F5F2EB"
                strokeOpacity="0.68"
                strokeWidth="1.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.75, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Interior Curtain Wall Glazing Mullions */}
              <motion.path
                d="M 488 332 V 44 M 546 332 V 44 M 600 332 V 42 M 654 332 V 44 M 712 332 V 44"
                stroke="#F5F2EB"
                strokeOpacity="0.28"
                strokeWidth="0.85"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.85, delay: 1.05, ease: 'easeOut' }}
              />

              {/* Sculpted Curved Oceanfront Balconies */}
              {TOWER_BALCONY_YS.map((y, idx) => (
                <motion.path
                  key={y}
                  d={`M 410 ${y} Q 600 ${y + 14} 790 ${y}`}
                  stroke="#C6A15B"
                  strokeWidth="1.35"
                  strokeOpacity="0.92"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 0.95,
                    delay: 1.25 + idx * 0.13,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              ))}

              {/* Wing Balcony Terraces */}
              {WING_BALCONY_YS.map((y, idx) => (
                <motion.path
                  key={`wing-${y}`}
                  d={`M 348 ${y} H 414 M 786 ${y} H 852`}
                  stroke="#F5F2EB"
                  strokeOpacity="0.45"
                  strokeWidth="0.9"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 0.85,
                    delay: 1.6 + idx * 0.11,
                    ease: 'easeOut',
                  }}
                />
              ))}

              {/* Penthouse Crown & Sky Pergola */}
              <motion.path
                d="M 442 42 L 458 22 H 742 L 758 42 M 496 22 V 12 H 704 V 22"
                stroke="#E9CC8B"
                strokeWidth="1.35"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.25, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Coastal Coconut Palms Flanking the Podium */}
              <motion.path
                d="M 240 396 Q 254 348 238 308 M 238 308 Q 212 298 194 310 M 238 308 Q 226 284 208 280 M 238 308 Q 262 292 276 306"
                stroke="#C6A15B"
                strokeOpacity="0.65"
                strokeWidth="1.1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 2.0, ease: 'easeOut' }}
              />
              <motion.path
                d="M 960 396 Q 946 346 964 304 M 964 304 Q 990 294 1006 308 M 964 304 Q 978 280 998 278 M 964 304 Q 938 290 924 304"
                stroke="#C6A15B"
                strokeOpacity="0.65"
                strokeWidth="1.1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 2.15, ease: 'easeOut' }}
              />
            </motion.svg>

            {/* Free-standing Large Broker Name Writing Animation — ZERO enclosing circle, square or card */}
            <div className="-mt-16 sm:-mt-20 text-center space-y-3">
              <div className="relative inline-block">
                <h1
                  aria-label={brokerName}
                  className="font-display text-5xl sm:text-7xl lg:text-[7rem] font-semibold tracking-tight text-[#F5F2EB] leading-none drop-shadow-[0_10px_32px_rgba(0,0,0,0.85)]"
                >
                  {letters.map((char, idx) => (
                    <motion.span
                      key={`${char}-${idx}`}
                      initial={
                        shouldReduceMotion
                          ? { opacity: 1 }
                          : { opacity: 0, y: 20, scale: 0.94 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.45,
                        delay: shouldReduceMotion ? 0 : 2.75 + idx * 0.085,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="inline-block"
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                  ))}
                </h1>

                {/* Calligraphic gold double-stroke signature drawn smoothly beneath the name */}
                <svg
                  viewBox="0 0 520 34"
                  fill="none"
                  className="mx-auto mt-2 w-72 sm:w-96 lg:w-[480px] h-auto overflow-visible"
                >
                  <motion.path
                    d="M 10 22 C 130 6, 300 4, 510 14 C 425 22, 265 26, 155 24"
                    stroke="#C6A15B"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      duration: 1.45,
                      delay: shouldReduceMotion ? 0 : 3.75,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                </svg>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: shouldReduceMotion ? 0.1 : 4.45,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-xs sm:text-sm uppercase tracking-[0.3em] text-[#C6A15B] drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
              >
                {creci} · Especialista em Litoral, Médio e Alto Padrão
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{
                  duration: 0.85,
                  delay: shouldReduceMotion ? 0.2 : 5.05,
                }}
                className="font-display italic text-xl sm:text-2xl text-[#F5F2EB]/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]"
              >
                {tagline}
              </motion.p>
            </div>
          </div>

          {/* Discreet skip button */}
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.72 }}
            whileHover={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            onClick={() => onCompleteRef.current()}
            className="fixed bottom-6 right-6 z-20 text-xs tracking-wider uppercase text-[#A19E95] hover:text-[#C6A15B] transition-colors whitespace-nowrap"
          >
            Pular introdução →
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
