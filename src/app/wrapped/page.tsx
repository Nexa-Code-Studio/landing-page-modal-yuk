'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { apiClient, getStoredUser } from '@/lib/api';

gsap.registerPlugin(ScrollTrigger);

// ─── Default Data Fallback ──────────────────────────────────────────────────

const defaultD = {
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

          let currentVol = 0;
          const targetVol = 0.5;
          const step = targetVol / 40;
          
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

        }).catch(() => {});
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
    });
  }, []);

  return (
    <section ref={ref} id={id} className={`min-h-screen flex items-center justify-center relative py-20 ${className}`}>
      {children}
    </section>
  );
}

// ─── Floating Emoji Curtain ────────────────────────────────────────────────

function EmojiCurtain({ id, emojis }: { id: string; emojis: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const parent = el.closest('section');
    if (!parent) return;

    const items = el.querySelectorAll('.emoji-item');
    gsap.set(items, { y: -80, opacity: 0 });

    ScrollTrigger.create({
      trigger: parent,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(items, { y: 0, opacity: 0.6, stagger: 0.1, duration: 0.6, ease: 'back.out(1.7)' });
      },
    });
  }, [id]);

  return (
    <div ref={containerRef} className="absolute inset-x-0 top-0 pointer-events-none z-10 flex justify-around px-8 pt-6 overflow-hidden">
      {emojis.map((emoji, idx) => (
        <span key={idx} className="emoji-item text-4xl sm:text-5xl select-none filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
          {emoji}
        </span>
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function WrappedPage() {
  const [data, setData] = useState(defaultD);
  const [copied, setCopied] = useState(false);

  // Fetch Real Wrapped Analytics
  useEffect(() => {
    async function loadWrappedData() {
      const user = getStoredUser();
      let bId = user?.business_id;
      if (!bId) {
        try {
          const bs = await apiClient.get<any[]>('/business');
          if (bs && bs.length > 0) bId = bs[0].id;
        } catch (e) {}
      }
      if (bId) {
        try {
          const res = await apiClient.get<any>(`/analytics/enterprise/wrapped?business_id=${bId}&year=2024`);
          if (res) {
            setData({
              companyName: res.company_name || 'Enterprise Group',
              year: res.year || 2024,
              foodWasteSaved: res.food_waste_saved || 0,
              costEfficiency: res.cost_efficiency || 12,
              carbonReduced: res.carbon_reduced || 0,
              treesEquivalent: res.trees_equivalent || 0,
              gasolineEquivalent: res.gasoline_equivalent || 0,
              smartphoneChargingHours: res.smartphone_charging_hours || 0,
              topBranch: res.top_branch || 'Cabang Utama',
              totalBranches: res.total_branches || 0,
              totalOrders: res.total_orders || 0,
            });
          }
        } catch (err) {
          console.warn("Failed to load wrapped analytics:", err);
        }
      }
    }
    loadWrappedData();
  }, []);

  useEffect(() => {
    document.title = `Resurva - Enterprise Wrapped ${data.year}`;
  }, [data.year]);

  const branchRef = useRef<HTMLDivElement>(null);
  const ordersRef = useRef<HTMLDivElement>(null);
  const foodRef = useRef<HTMLDivElement>(null);
  const carbonRef = useRef<HTMLDivElement>(null);
  const treesRef = useRef<HTMLDivElement>(null);
  const gasRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  const branches = useCountUp(data.totalBranches, 1.5, branchRef);
  const orders = useCountUp(data.totalOrders, 2, ordersRef);
  const food = useCountUp(data.foodWasteSaved, 2, foodRef);
  const carbon = useCountUp(data.carbonReduced, 2.5, carbonRef);
  const trees = useCountUp(data.treesEquivalent, 2, treesRef);
  const gas = useCountUp(data.gasolineEquivalent, 2.5, gasRef);
  const phone = useCountUp(Math.round(data.smartphoneChargingHours / 100_000), 2, phoneRef);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator?.share) {
      try { await navigator.share({ title: `RESURVA Wrapped ${data.year}`, url }); } catch (_) {}
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
        <span className="text-[#EDD099]/60 text-sm">Wrapped {data.year}</span>
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
            <span className="text-[#EDD099] text-sm font-semibold tracking-[0.25em] uppercase">RESURVA Wrapped {data.year}</span>
          </div>
          <div className="reveal space-y-5">
            <h1 className="text-7xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter">
              Dampak<br /><span className="text-[#EDD099]">Nyata.</span>
            </h1>
            <p className="text-xl text-emerald-100/60 font-light max-w-lg mx-auto leading-relaxed">
              Rangkuman perjalanan keberlanjutan <span className="text-white font-medium">{data.companyName}</span> sepanjang tahun {data.year}.
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
              <div className="text-2xl font-black text-white leading-tight">{data.topBranch}</div>
              <div className="text-xs text-emerald-100/50 mt-1 uppercase tracking-wider">Cabang Performa Terbaik</div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ SECTION 2: Penyelamatan Pangan ═══ */}
      <Section id="food">
        <EmojiCurtain id="food" emojis={['🍱', '🌱', '🥐', '🥗']} />
        <div className="flex flex-col items-center justify-center text-center px-6 space-y-8 relative z-10">
          <p className="reveal text-emerald-300/80 uppercase tracking-[0.25em] text-xs font-semibold">Penyelamatan Pangan</p>
          <div className="reveal space-y-2">
            <p className="text-[#EDD099] text-[clamp(1.5rem,4vw,3.5rem)] font-extrabold leading-tight">Anda berhasil menyelamatkan</p>
            <div ref={foodRef} className="font-black text-[#EDD099] leading-none tracking-tighter" style={{ fontSize: 'clamp(90px, 18vw, 160px)' }}>
              {food.toLocaleString('id-ID')}
            </div>
            <p className="text-3xl md:text-4xl font-bold text-white">Kg Makanan Terbuang</p>
          </div>
          <div className="reveal grid grid-cols-2 gap-4 max-w-md w-full pt-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-black text-white">~{(data.foodWasteSaved * 2).toLocaleString('id-ID')}</div>
              <div className="text-[11px] text-emerald-100/50 uppercase tracking-wider mt-1">Porsi Diselamatkan</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-black text-[#EDD099]">+{data.costEfficiency}%</div>
              <div className="text-[11px] text-emerald-100/50 uppercase tracking-wider mt-1">Efisiensi Biaya Toko</div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ SECTION 3: Jejak Karbon ═══ */}
      <Section id="carbon">
        <EmojiCurtain id="carbon" emojis={['🌍', '✨', '🌿', '💚']} />
        <div className="flex flex-col items-center justify-center text-center px-6 space-y-8 relative z-10">
          <p className="reveal text-emerald-300/80 uppercase tracking-[0.25em] text-xs font-semibold">Dampak Lingkungan</p>
          <div className="reveal space-y-2">
            <p className="text-white text-[clamp(1.5rem,4vw,3.5rem)] font-extrabold leading-tight">Reduksi emisi karbon terhindari</p>
            <div ref={carbonRef} className="font-black text-[#EDD099] leading-none tracking-tighter" style={{ fontSize: 'clamp(80px, 16vw, 150px)' }}>
              {carbon.toLocaleString('id-ID')}
            </div>
            <p className="text-3xl md:text-4xl font-bold text-emerald-300">Kg CO₂e</p>
          </div>
        </div>
      </Section>

      {/* ═══ SECTION 4: Analogi ═══ */}
      <Section id="equivalents">
        <div className="flex flex-col items-center justify-center text-center px-6 space-y-12 relative z-10 max-w-4xl">
          <p className="reveal text-emerald-300/80 uppercase tracking-[0.25em] text-xs font-semibold">Bila Diutarakannya</p>
          <h2 className="reveal text-4xl md:text-6xl font-black text-white tracking-tight">Setara Dengan...</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="reveal p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center space-y-4 hover:border-[#EDD099]/30 transition-all">
              <span className="text-5xl">🌲</span>
              <div ref={treesRef} className="text-4xl font-black text-[#EDD099]">{trees.toLocaleString('id-ID')}</div>
              <p className="text-sm text-emerald-100/70">Bibit pohon ditanam &amp; tumbuh 10 tahun</p>
            </div>
            <div className="reveal p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center space-y-4 hover:border-[#EDD099]/30 transition-all">
              <span className="text-5xl">🚗</span>
              <div ref={gasRef} className="text-4xl font-black text-[#EDD099]">{gas.toLocaleString('id-ID')}</div>
              <p className="text-sm text-emerald-100/70">KM jarak perjalanan mobil penumpang</p>
            </div>
            <div className="reveal p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center space-y-4 hover:border-[#EDD099]/30 transition-all">
              <span className="text-5xl">📱</span>
              <div ref={phoneRef} className="text-4xl font-black text-[#EDD099]">{phone.toLocaleString('id-ID')} Ratus Ribu</div>
              <p className="text-sm text-emerald-100/70">Jam pengisian daya smartphone</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ SECTION 5: Penutup / Share ═══ */}
      <Section id="closing">
        <div className="flex flex-col items-center justify-center text-center px-6 space-y-8 relative z-10 max-w-3xl">
          <div className="reveal space-y-4">
            <span className="text-6xl">🏆</span>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight">Terima Kasih, <br /><span className="text-[#EDD099]">{data.companyName}</span></h2>
            <p className="text-xl text-emerald-100/60 max-w-2xl mx-auto leading-relaxed">
              Kontribusi nyata Anda di tahun {data.year} membantu Indonesia satu langkah lebih dekat menuju pembangunan yang berkelanjutan.
            </p>
          </div>
          <div className="reveal flex flex-col sm:flex-row gap-4 pt-4 w-full max-w-md">
            <button onClick={handleShare} className="flex-1 py-4 px-8 rounded-full bg-[#EDD099] hover:bg-[#e0be80] text-[#0F3D2E] font-bold text-base transition-all shadow-lg hover:scale-[1.02] cursor-pointer">
              {copied ? 'Link Tersalin! 📋' : 'Bagikan Wrapped 🚀'}
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
