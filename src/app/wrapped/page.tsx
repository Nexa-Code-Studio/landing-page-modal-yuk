'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Data ──────────────────────────────────────────────────────────────────

const D = {
  companyName: 'PT Resurva Group',
  year: 2024,
  foodWasteSaved: 5230,
  costEfficiency: 12,
  carbonReduced: 141210,
  treesEquivalent: 2259,
  gasolineEquivalent: 578961,
  smartphoneChargingHours: 16945200,
  topBranch: 'Cabang Jakarta Pusat',
  totalBranches: 4,
  totalOrders: 18720,
};

// ─── Count-Up Hook ─────────────────────────────────────────────────────────

function useCountUp(target: number, duration: number = 2, triggerRef: React.RefObject<HTMLElement | null>) {
  const [value, setValue] = useState(0);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!triggerRef.current || hasTriggered.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriggered.current) {
            hasTriggered.current = true;
            const start = performance.now();
            const animate = (now: number) => {
              const elapsed = (now - start) / 1000;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 4);
              setValue(Math.floor(eased * target));
              if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, [target, duration, triggerRef]);

  return value;
}

// ─── Floating Particles (ultra-light: 8 particles) ────────────────────────

function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; size: number; speedY: number; speedX: number; opacity: number; color: string }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['rgba(16, 185, 129, ', 'rgba(237, 208, 153, ', 'rgba(255, 255, 255, '];

    for (let i = 0; i < 8; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedY: -(Math.random() * 0.15 + 0.03),
        speedX: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.25 + 0.08,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.fill();
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1]" />;
}

// ─── Audio Controller ──────────────────────────────────────────────────────

function AudioController() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Autoplay on first interaction with fade-in
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (hasInteracted) return;
      
      const audio = audioRef.current;
      if (audio) {
        audio.volume = 0; // Start at 0 for fade in
        audio.play().then(() => {
          setIsPlaying(true);
          setHasInteracted(true);

          // Fade in to 0.5 volume over 2 seconds
          let currentVol = 0;
          const targetVol = 0.5;
          const step = targetVol / 40; // 40 steps of 50ms = 2000ms
          
          const fadeInterval = setInterval(() => {
            currentVol += step;
            if (currentVol >= targetVol) {
              currentVol = targetVol;
              clearInterval(fadeInterval);
            }
            if (audioRef.current) {
               audioRef.current.volume = currentVol;
               setVolume(currentVol);
            }
          }, 50);

        }).catch(() => {
          // Play failed (likely still restricted), ignore silently
        });
      }

      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('scroll', handleFirstInteraction, { passive: true });
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [hasInteracted]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
      <audio ref={audioRef} src="/audio/background.mp3" loop preload="auto" />
      
      {showVolume && (
        <div className="bg-black/60 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 border border-white/10 animate-fadeIn shadow-lg">
          <input type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolume} className="w-20 h-1 accent-[#EDD099] cursor-pointer" />
          <span className="text-[10px] text-white/50 w-6 text-right tabular-nums">{Math.round(volume * 100)}%</span>
        </div>
      )}
      
      <button 
        onClick={() => setShowVolume(!showVolume)} 
        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors" 
        title="Volume"
      >
        {volume === 0 ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        )}
      </button>
      
      <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-[#EDD099]/20 backdrop-blur-md border border-[#EDD099]/30 flex items-center justify-center text-[#EDD099] hover:bg-[#EDD099]/30 transition-colors" title={isPlaying ? 'Pause Music' : 'Play Music'}>
        {isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        )}
      </button>
    </div>
  );
}

// ─── Section Wrapper with scroll-triggered reveal ──────────────────────────

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const childEls = el.querySelectorAll('.reveal');
    gsap.set(childEls, { y: 60, opacity: 0 });

    ScrollTrigger.create({
      trigger: el,
      start: 'top 75%',
      onEnter: () => {
        gsap.to(childEls, { y: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: 'power3.out' });
      },
      once: true,
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => { if (st.trigger === el) st.kill(); });
    };
  }, []);

  return (
    <section ref={ref} id={id} className={`min-h-screen flex items-center justify-center relative ${className}`}>
      {children}
    </section>
  );
}

// ─── Emoji Burst ─ themed emojis that pop and fly out on section enter ──────

function EmojiCurtain({ emojis, id }: { emojis: string[]; id: string }) {
  const curtainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = curtainRef.current;
    if (!el) return;

    const emojiEls = el.querySelectorAll('.emoji-particle');

    // Set initial state: hidden and scaled down in the center
    gsap.set(emojiEls, { 
      opacity: 0, 
      scale: 0, 
      xPercent: -50, 
      yPercent: -50,
      x: 0,
      y: 0,
      rotation: 0 
    });

    ScrollTrigger.create({
      trigger: el,
      start: 'top 65%', // Trigger when section is nicely visible
      onEnter: () => {
        const tl = gsap.timeline();
        
        // Phase 1: Pop in at the center
        tl.to(emojiEls, {
          opacity: 1,
          scale: 1.5,
          duration: 0.4,
          ease: 'back.out(1.7)',
          stagger: 0.05
        });

        // Phase 2: Explode outward (but stay visible)
        tl.to(emojiEls, {
          x: (i) => {
            const isLeft = i % 2 === 0;
            return isLeft ? -(150 + Math.random() * 200) : (150 + Math.random() * 200);
          },
          y: () => (Math.random() - 0.5) * 200,
          rotation: () => (Math.random() - 0.5) * 180,
          scale: () => 0.8 + Math.random() * 0.4, // Return to normal-ish size
          duration: 0.8,
          ease: 'power3.out',
        }, "-=0.2");

        // Phase 3: Float gently and fade out
        tl.to(emojiEls, {
          y: () => (Math.random() > 0.5 ? '+=150' : '-=150'), // Float up or down
          x: () => (Math.random() > 0.5 ? '+=50' : '-=50'), // Slight horizontal drift
          rotation: '+=60',
          opacity: 0,
          duration: 1.5,
          ease: 'power1.inOut',
        }, "+=0.1");
      },
      once: true,
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => { if (st.trigger === el) st.kill(); });
    };
  }, []);

  return (
    <div ref={curtainRef} id={`curtain-${id}`} className="absolute inset-0 pointer-events-none z-20 overflow-hidden flex items-center justify-center">
      {emojis.map((emoji, i) => (
        <span
          key={`${id}-${i}`}
          className="emoji-particle absolute select-none"
          style={{
            top: '50%',
            left: '50%',
            fontSize: `${60 + (i * 7) % 20}px`,
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
          }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function ResurvaWrappedPage() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Resurva - Enterprise Wrapped 2024";
  }, []);

  const branchRef = useRef<HTMLDivElement>(null);
  const ordersRef = useRef<HTMLDivElement>(null);
  const foodRef = useRef<HTMLDivElement>(null);
  const carbonRef = useRef<HTMLDivElement>(null);
  const treesRef = useRef<HTMLDivElement>(null);
  const gasRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  const branches = useCountUp(D.totalBranches, 1.5, branchRef);
  const orders = useCountUp(D.totalOrders, 2, ordersRef);
  const food = useCountUp(D.foodWasteSaved, 2, foodRef);
  const carbon = useCountUp(D.carbonReduced, 2.5, carbonRef);
  const trees = useCountUp(D.treesEquivalent, 2, treesRef);
  const gas = useCountUp(D.gasolineEquivalent, 2.5, gasRef);
  const phone = useCountUp(Math.round(D.smartphoneChargingHours / 100_000), 2, phoneRef);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator?.share) {
      try { await navigator.share({ title: 'RESURVA Wrapped 2024', url }); } catch (_) {}
    } else {
      navigator.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="relative text-white" style={{ background: '#0F3D2E' }}>
      {/* Fixed watermark */}
      <div className="fixed top-6 left-8 z-50 flex items-center gap-2 pointer-events-none">
        <span className="text-white/80 font-bold text-lg tracking-tight">RESURVA</span>
        <span className="text-[#EDD099]/60 text-sm">Wrapped {D.year}</span>
      </div>

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full blur-[160px]" style={{ background: '#1A5C44', opacity: 0.3 }} />
        <div className="absolute -bottom-1/4 -right-1/4 w-2/3 h-2/3 rounded-full blur-[160px]" style={{ background: '#EDD099', opacity: 0.08 }} />
      </div>

      {/* Grid texture */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(rgba(237,208,153,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(237,208,153,0.04) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

      <FloatingParticles />
      <AudioController />

      {/* ═══ SECTION 0: Hero ═══ */}
      <Section id="hero">
        <div className="flex flex-col items-center justify-center text-center px-6 space-y-8 relative z-10">
          <div className="reveal inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#EDD099]/30 bg-white/5 backdrop-blur-sm">
            <span>🌿</span>
            <span className="text-[#EDD099] text-sm font-semibold tracking-[0.25em] uppercase">RESURVA Wrapped {D.year}</span>
          </div>
          <div className="reveal space-y-5">
            <h1 className="text-7xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter">
              Dampak<br /><span className="text-[#EDD099]">Nyata.</span>
            </h1>
            <p className="text-xl text-emerald-100/60 font-light max-w-lg mx-auto leading-relaxed">
              Rangkuman perjalanan keberlanjutan <span className="text-white font-medium">{D.companyName}</span> sepanjang tahun {D.year}.
            </p>
          </div>
          <div className="reveal flex flex-col items-center gap-2 pt-4">
            <div className="w-px h-14 bg-gradient-to-b from-[#EDD099] to-transparent animate-pulse" />
            <p className="text-[10px] text-[#EDD099]/50 tracking-[0.4em] uppercase">Scroll ke bawah</p>
          </div>
        </div>
      </Section>

      {/* ═══ SECTION 1: Jaringan ═══ */}
      <Section id="network">
        <EmojiCurtain id="network" emojis={['🤝', '🏢', '🌟', '🤝']} />
        <div className="flex flex-col items-center justify-center text-center px-6 space-y-10 relative z-10">
          <p className="reveal text-emerald-300/80 uppercase tracking-[0.25em] text-xs font-semibold">Jaringan Anda</p>
          <div className="reveal space-y-2">
            <p className="text-[#EDD099] text-xl font-medium">Tahun ini berjalan bersama</p>
            <div ref={branchRef} className="font-black text-white leading-none tracking-tighter" style={{ fontSize: 'clamp(100px, 20vw, 180px)' }}>{branches}</div>
            <p className="text-4xl md:text-5xl font-bold text-emerald-300">Mitra &amp; Cabang Aktif</p>
          </div>
          <div className="reveal flex gap-10 text-center">
            <div ref={ordersRef}>
              <div className="text-3xl font-black text-white">{orders.toLocaleString('id-ID')}</div>
              <div className="text-xs text-emerald-100/50 mt-1 uppercase tracking-wider">Pesanan Selesai</div>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <div className="text-2xl font-black text-white leading-tight">{D.topBranch}</div>
              <div className="text-xs text-emerald-100/50 mt-1 uppercase tracking-wider">Cabang Terbaik</div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ SECTION 2: Penyelamatan Pangan ═══ */}
      <Section id="food-rescue">
        <EmojiCurtain id="food" emojis={['🍱', '🥗', '🍜', '🍞']} />
        <div className="flex flex-col items-center justify-center text-center px-6 space-y-8 relative z-10">
          <p className="reveal text-emerald-300/80 uppercase tracking-[0.25em] text-xs font-semibold">Penyelamatan Pangan</p>
          <div className="reveal space-y-2">
            <p className="text-emerald-100/50 text-2xl">Anda berhasil menyelamatkan</p>
            <div ref={foodRef} className="flex items-end justify-center gap-4">
              <span className="font-black text-white leading-none" style={{ fontSize: 'clamp(70px, 14vw, 130px)' }}>{food.toLocaleString('id-ID')}</span>
              <span className="text-4xl font-bold text-emerald-400 mb-4">KG</span>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-[#EDD099]">Makanan dari Pembuangan</p>
          </div>
          <div className="reveal grid grid-cols-2 gap-4 max-w-md w-full">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left hover:bg-white/[0.08] transition-colors duration-300">
              <div className="text-2xl mb-2">🍱</div>
              <div className="text-2xl font-black text-white">~{(D.foodWasteSaved * 2).toLocaleString('id-ID')}</div>
              <div className="text-xs text-emerald-100/50 mt-1 uppercase tracking-wider">Porsi Makanan</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left hover:bg-white/[0.08] transition-colors duration-300">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-2xl font-black text-[#EDD099]">+{D.costEfficiency}%</div>
              <div className="text-xs text-emerald-100/50 mt-1 uppercase tracking-wider">Efisiensi Operasional</div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ SECTION 3: Dampak Lingkungan ═══ */}
      <Section id="carbon-impact">
        <EmojiCurtain id="carbon" emojis={['🌳', '🌿', '🌲', '🍃']} />
        <div className="flex flex-col items-center justify-center text-center px-6 space-y-8 relative z-10">
          <p className="reveal text-emerald-300/80 uppercase tracking-[0.25em] text-xs font-semibold">Dampak Lingkungan</p>
          <div className="reveal space-y-2">
            <p className="text-emerald-100/50 text-xl">Total emisi karbon yang Anda cegah</p>
            <div ref={carbonRef} className="font-black text-white leading-none" style={{ fontSize: 'clamp(55px, 10vw, 100px)' }}>{carbon.toLocaleString('id-ID')}</div>
            <p className="text-4xl md:text-5xl font-black text-[#EDD099]">Kg CO₂e</p>
          </div>
          <div className="reveal relative flex items-center justify-center w-full max-w-lg">
            <div className="absolute text-[180px] opacity-[0.06] select-none animate-pulse" style={{ animationDuration: '4s' }}>🌲</div>
            <div ref={treesRef} className="relative bg-white/[0.07] backdrop-blur-sm border border-[#EDD099]/20 rounded-3xl px-10 py-7 w-full hover:bg-white/[0.1] transition-colors duration-500">
              <p className="text-lg text-emerald-100/60">Itu setara dengan menanam</p>
              <p className="text-4xl md:text-5xl font-black text-white mt-1">{trees.toLocaleString('id-ID')}{' '}<span className="text-[#EDD099]">bibit pohon</span></p>
              <p className="text-emerald-100/50 mt-1">yang tumbuh selama 10 tahun penuh</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ SECTION 4: Analogi Sehari-hari ═══ */}
      <Section id="daily-impact">
        <EmojiCurtain id="daily" emojis={['🚗', '📱', '⚡', '🔋']} />
        <div className="flex flex-col items-center justify-center px-6 space-y-8 w-full max-w-5xl mx-auto relative z-10">
          <div className="reveal text-center space-y-2">
            <p className="text-emerald-300/80 uppercase tracking-[0.25em] text-xs font-semibold">Dalam Angka Sehari-Hari</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">Bayangkan seperti ini...</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            <div className="reveal relative bg-white/5 border border-white/10 rounded-[2rem] p-8 overflow-hidden group hover:border-emerald-400/30 hover:bg-white/[0.08] transition-all duration-500">
              <div className="absolute -bottom-6 -right-6 text-[110px] opacity-[0.06] select-none group-hover:opacity-[0.1] transition-opacity duration-500">🚗</div>
              <div className="relative z-10 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">🚗</div>
                <p className="text-emerald-200/70 text-xs uppercase tracking-widest">Penghematan BBM</p>
                <div ref={gasRef} className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black text-white">{gas.toLocaleString('id-ID')}</span>
                  <span className="text-2xl font-bold text-emerald-400">KM</span>
                </div>
                <p className="text-emerald-100/50 text-sm">Perjalanan kendaraan bermotor yang berhasil dieliminasi</p>
              </div>
            </div>
            <div className="reveal relative bg-white/5 border border-white/10 rounded-[2rem] p-8 overflow-hidden group hover:border-[#EDD099]/30 hover:bg-white/[0.08] transition-all duration-500">
              <div className="absolute -bottom-6 -right-6 text-[110px] opacity-[0.06] select-none group-hover:opacity-[0.1] transition-opacity duration-500">📱</div>
              <div className="relative z-10 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#EDD099]/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">📱</div>
                <p className="text-[#EDD099]/70 text-xs uppercase tracking-widest">Hemat Energi Listrik</p>
                <div ref={phoneRef} className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black text-white">{(phone / 10).toFixed(1)}Jt</span>
                  <span className="text-2xl font-bold text-[#EDD099]">JAM</span>
                </div>
                <p className="text-emerald-100/50 text-sm">Pengisian daya smartphone secara terus-menerus</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ SECTION 5: Penutup ═══ */}
      <Section id="closing">
        <EmojiCurtain id="closing" emojis={['🏆', '🌟', '🎉', '🏆']} />
        <div className="flex flex-col items-center justify-center text-center px-6 space-y-8 relative z-10">
          <div className="reveal space-y-4">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-5xl mx-auto animate-bounce" style={{ animationDuration: '3s' }}>🏆</div>
            <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">Terima kasih,<br /><span className="text-[#EDD099]">Mitra Resurva!</span></h2>
            <p className="text-xl text-emerald-100/60 max-w-2xl mx-auto leading-relaxed">Kontribusi nyata Anda di tahun {D.year} membantu Indonesia satu langkah lebih dekat menuju pembangunan yang berkelanjutan.</p>
          </div>
          <div className="reveal flex flex-wrap justify-center gap-4">
            {[{ num: 9, label: 'Industri, Inovasi & Infrastruktur', color: 'bg-blue-600' }, { num: 17, label: 'Kemitraan untuk Tujuan', color: 'bg-blue-900' }].map(sdg => (
              <div key={sdg.num} className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-8 py-5 hover:scale-105 transition-transform duration-200">
                <div className={`w-14 h-14 ${sdg.color} rounded-xl flex items-center justify-center font-black text-3xl`}>{sdg.num}</div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70 max-w-[130px] text-center leading-snug">{sdg.label}</p>
              </div>
            ))}
          </div>
          <div className="reveal flex flex-col sm:flex-row gap-3 items-center">
            <button onClick={handleShare} className="bg-[#EDD099] hover:bg-[#F5E2BC] text-[#0F3D2E] font-bold px-8 py-4 rounded-full text-base transition-all duration-200 hover:scale-105 shadow-lg shadow-[#EDD099]/20">
              {copied ? '✅ Link Tersalin!' : '📤 Bagikan ke Sosial Media'}
            </button>
          </div>
          <p className="reveal text-sm text-[#EDD099]/30 tracking-widest">#RESURVAWrapped2024 · #SafeFoodSafePlanet</p>
        </div>
      </Section>

      <div className="h-20" />

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
