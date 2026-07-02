'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

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

// ─── Progress Indicator ────────────────────────────────────────────────────

function ProgressDots({ total, active, onGoTo }: { total: number; active: number; onGoTo: (i: number) => void }) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onGoTo(i)}
          className={`rounded-full transition-all duration-500 ${
            i === active ? 'w-2.5 h-10 bg-[#EDD099]' : 'w-2.5 h-2.5 bg-white/25 hover:bg-white/50'
          }`}
        />
      ))}
    </div>
  );
}

// ─── Slides ────────────────────────────────────────────────────────────────

function Slide0() {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full px-6 space-y-8">
      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#EDD099]/30 bg-white/5 backdrop-blur-sm">
        <span>🌿</span>
        <span className="text-[#EDD099] text-sm font-semibold tracking-[0.25em] uppercase">
          RESURVA Wrapped {D.year}
        </span>
      </div>
      <div className="space-y-5">
        <h1 className="text-7xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter">
          Dampak<br />
          <span className="text-[#EDD099]">Nyata.</span>
        </h1>
        <p className="text-xl text-emerald-100/60 font-light max-w-lg mx-auto leading-relaxed">
          Rangkuman perjalanan keberlanjutan <span className="text-white font-medium">{D.companyName}</span> sepanjang tahun {D.year}.
        </p>
      </div>
      <div className="flex flex-col items-center gap-2 pt-2 animate-bounce">
        <div className="w-px h-14 bg-gradient-to-b from-[#EDD099] to-transparent" />
        <p className="text-[10px] text-[#EDD099]/50 tracking-[0.4em] uppercase">Tekan → atau klik dot</p>
      </div>
    </div>
  );
}

function Slide1() {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full px-6 space-y-10">
      <p className="text-emerald-300/80 uppercase tracking-[0.25em] text-xs font-semibold">Jaringan Anda</p>
      <div className="space-y-2">
        <p className="text-[#EDD099] text-xl font-medium">Tahun ini berjalan bersama</p>
        <div
          className="font-black text-white leading-none tracking-tighter"
          style={{ fontSize: 'clamp(100px, 20vw, 180px)' }}
        >
          {D.totalBranches}
        </div>
        <p className="text-4xl md:text-5xl font-bold text-emerald-300">Mitra &amp; Cabang Aktif</p>
      </div>
      <div className="flex gap-10 text-center">
        <div>
          <div className="text-3xl font-black text-white">{D.totalOrders.toLocaleString('id-ID')}</div>
          <div className="text-xs text-emerald-100/50 mt-1 uppercase tracking-wider">Pesanan Selesai</div>
        </div>
        <div className="w-px bg-white/10" />
        <div>
          <div className="text-2xl font-black text-white leading-tight">{D.topBranch}</div>
          <div className="text-xs text-emerald-100/50 mt-1 uppercase tracking-wider">Cabang Terbaik</div>
        </div>
      </div>
    </div>
  );
}

function Slide2() {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full px-6 space-y-8">
      <p className="text-emerald-300/80 uppercase tracking-[0.25em] text-xs font-semibold">Penyelamatan Pangan</p>
      <div className="space-y-2">
        <p className="text-emerald-100/50 text-2xl">Anda berhasil menyelamatkan</p>
        <div className="flex items-end justify-center gap-4">
          <span
            className="font-black text-white leading-none"
            style={{ fontSize: 'clamp(70px, 14vw, 130px)' }}
          >
            {D.foodWasteSaved.toLocaleString('id-ID')}
          </span>
          <span className="text-4xl font-bold text-emerald-400 mb-4">KG</span>
        </div>
        <p className="text-3xl md:text-4xl font-bold text-[#EDD099]">Makanan dari Pembuangan</p>
      </div>
      <div className="grid grid-cols-2 gap-4 max-w-md w-full">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
          <div className="text-2xl mb-2">🍱</div>
          <div className="text-2xl font-black text-white">~{(D.foodWasteSaved * 2).toLocaleString('id-ID')}</div>
          <div className="text-xs text-emerald-100/50 mt-1 uppercase tracking-wider">Porsi Makanan</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
          <div className="text-2xl mb-2">📈</div>
          <div className="text-2xl font-black text-[#EDD099]">+{D.costEfficiency}%</div>
          <div className="text-xs text-emerald-100/50 mt-1 uppercase tracking-wider">Efisiensi Operasional</div>
        </div>
      </div>
    </div>
  );
}

function Slide3() {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full px-6 space-y-8">
      <p className="text-emerald-300/80 uppercase tracking-[0.25em] text-xs font-semibold">Dampak Lingkungan</p>
      <div className="space-y-2">
        <p className="text-emerald-100/50 text-xl">Total emisi karbon yang Anda cegah</p>
        <div
          className="font-black text-white leading-none"
          style={{ fontSize: 'clamp(55px, 10vw, 100px)' }}
        >
          {D.carbonReduced.toLocaleString('id-ID')}
        </div>
        <p className="text-4xl md:text-5xl font-black text-[#EDD099]">Kg CO₂e</p>
      </div>
      <div className="relative flex items-center justify-center w-full max-w-lg">
        <div className="absolute text-[180px] opacity-[0.06] select-none">🌲</div>
        <div className="relative bg-white/[0.07] backdrop-blur-sm border border-[#EDD099]/20 rounded-3xl px-10 py-7 w-full">
          <p className="text-lg text-emerald-100/60">Itu setara dengan menanam</p>
          <p className="text-4xl md:text-5xl font-black text-white mt-1">
            {D.treesEquivalent.toLocaleString('id-ID')}{' '}
            <span className="text-[#EDD099]">bibit pohon</span>
          </p>
          <p className="text-emerald-100/50 mt-1">yang tumbuh selama 10 tahun penuh</p>
        </div>
      </div>
    </div>
  );
}

function Slide4() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 space-y-8 w-full max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <p className="text-emerald-300/80 uppercase tracking-[0.25em] text-xs font-semibold">Dalam Angka Sehari-Hari</p>
        <h2 className="text-4xl md:text-5xl font-bold text-white">Bayangkan seperti ini...</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
        <div className="relative bg-white/5 border border-white/10 rounded-[2rem] p-8 overflow-hidden group hover:border-emerald-400/30 transition-colors duration-300">
          <div className="absolute -bottom-6 -right-6 text-[110px] opacity-[0.06] select-none">🚗</div>
          <div className="relative z-10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-3xl">🚗</div>
            <p className="text-emerald-200/70 text-xs uppercase tracking-widest">Penghematan BBM</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-black text-white">{D.gasolineEquivalent.toLocaleString('id-ID')}</span>
              <span className="text-2xl font-bold text-emerald-400">KM</span>
            </div>
            <p className="text-emerald-100/50 text-sm">Perjalanan kendaraan bermotor yang berhasil dieliminasi</p>
          </div>
        </div>
        <div className="relative bg-white/5 border border-white/10 rounded-[2rem] p-8 overflow-hidden group hover:border-[#EDD099]/30 transition-colors duration-300">
          <div className="absolute -bottom-6 -right-6 text-[110px] opacity-[0.06] select-none">📱</div>
          <div className="relative z-10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EDD099]/20 flex items-center justify-center text-3xl">📱</div>
            <p className="text-[#EDD099]/70 text-xs uppercase tracking-widest">Hemat Energi Listrik</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-black text-white">{(D.smartphoneChargingHours / 1_000_000).toFixed(1)}Jt</span>
              <span className="text-2xl font-bold text-[#EDD099]">JAM</span>
            </div>
            <p className="text-emerald-100/50 text-sm">Pengisian daya smartphone secara terus-menerus</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slide5({ onShare, copied }: { onShare: () => void; copied: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full px-6 space-y-8">
      <div className="space-y-4">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-5xl mx-auto">
          🏆
        </div>
        <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">
          Terima kasih,<br />
          <span className="text-[#EDD099]">Mitra Resurva!</span>
        </h2>
        <p className="text-xl text-emerald-100/60 max-w-2xl mx-auto leading-relaxed">
          Kontribusi nyata Anda di tahun {D.year} membantu Indonesia satu langkah lebih dekat menuju pembangunan yang berkelanjutan.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {[{ num: 9, label: 'Industri, Inovasi & Infrastruktur', color: 'bg-blue-600' }, { num: 17, label: 'Kemitraan untuk Tujuan', color: 'bg-blue-900' }].map(sdg => (
          <div key={sdg.num} className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-8 py-5 hover:scale-105 transition-transform duration-200">
            <div className={`w-14 h-14 ${sdg.color} rounded-xl flex items-center justify-center font-black text-3xl`}>{sdg.num}</div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70 max-w-[130px] text-center leading-snug">{sdg.label}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <button className="bg-[#EDD099] hover:bg-[#F5E2BC] text-[#0F3D2E] font-bold px-8 py-4 rounded-full text-base transition-colors duration-200">
          📥 Unduh Laporan (PDF)
        </button>
        <button
          onClick={onShare}
          className="border border-white/25 text-white hover:bg-white/10 px-8 py-4 rounded-full text-base transition-colors duration-200"
        >
          {copied ? '✅ Link Tersalin!' : '📤 Bagikan ke Sosial Media'}
        </button>
      </div>
      <p className="text-sm text-[#EDD099]/30 tracking-widest">#RESURVAWrapped2024 · #SafeFoodSafePlanet</p>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────

const TOTAL = 6;

export default function ResurvaWrappedPage() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [copied, setCopied] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animate slide transition
  const goTo = useCallback(
    (next: number) => {
      if (animating || next === current || next < 0 || next >= TOTAL) return;
      const direction = next > current ? 1 : -1;
      setAnimating(true);

      const from = slideRefs.current[current];
      const to = slideRefs.current[next];
      if (!from || !to) { setCurrent(next); setAnimating(false); return; }

      // Position the incoming slide
      gsap.set(to, { yPercent: direction * 100, opacity: 1, zIndex: 2 });
      gsap.set(from, { zIndex: 1 });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(from, { yPercent: 0, opacity: 0, zIndex: 0 });
          gsap.set(to, { zIndex: 1 });
          setCurrent(next);
          setAnimating(false);
        },
      });

      tl.to(from, { yPercent: -direction * 100, opacity: 0, duration: 0.65, ease: 'power3.inOut' }, 0);
      tl.to(to, { yPercent: 0, opacity: 1, duration: 0.65, ease: 'power3.inOut' }, 0);

      // Stagger in child elements
      const children = to.querySelectorAll('.wow');
      if (children.length) {
        tl.from(children, { y: 30, opacity: 0, stagger: 0.1, duration: 0.45, ease: 'back.out(1.5)', clearProps: 'all' }, 0.25);
      }
    },
    [current, animating],
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goTo(current - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, goTo]);

  // Wheel / touch swipe
  useEffect(() => {
    let touchStart = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 40) goTo(current + 1);
      if (e.deltaY < -40) goTo(current - 1);
    };
    const onTouchStart = (e: TouchEvent) => { touchStart = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const delta = touchStart - e.changedTouches[0].clientY;
      if (delta > 40) goTo(current + 1);
      if (delta < -40) goTo(current - 1);
    };
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [current, goTo]);

  // Init: hide all slides except first
  useEffect(() => {
    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, { yPercent: 0, opacity: i === 0 ? 1 : 0, zIndex: i === 0 ? 1 : 0 });
    });
  }, []);

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

  const slides = [
    <Slide0 key={0} />,
    <Slide1 key={1} />,
    <Slide2 key={2} />,
    <Slide3 key={3} />,
    <Slide4 key={4} />,
    <Slide5 key={5} onShare={handleShare} copied={copied} />,
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden text-white"
      style={{ height: '100dvh', background: '#0F3D2E', userSelect: 'none' }}
    >
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full blur-[160px]" style={{ background: '#1A5C44', opacity: 0.25 }} />
        <div className="absolute -bottom-1/4 -right-1/4 w-2/3 h-2/3 rounded-full blur-[160px]" style={{ background: '#EDD099', opacity: 0.12 }} />
      </div>

      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(237,208,153,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(237,208,153,0.06) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Watermark top-left */}
      <div className="fixed top-6 left-8 z-50 flex items-center gap-2 pointer-events-none">
        <span className="text-white/80 font-bold text-lg tracking-tight">RESURVA</span>
        <span className="text-[#EDD099]/60 text-sm">Wrapped {D.year}</span>
      </div>

      {/* Progress counter top-right */}
      <div className="fixed top-6 right-6 z-50 text-sm text-white/30 font-medium tabular-nums pointer-events-none">
        {String(current + 1).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}
      </div>

      {/* Progress dots */}
      <ProgressDots total={TOTAL} active={current} onGoTo={goTo} />

      {/* Slides — all stacked, animated via gsap */}
      {slides.map((slide, i) => (
        <div
          key={i}
          ref={el => { slideRefs.current[i] = el; }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: i === 0 ? 1 : 0 }}
        >
          <div className="wow w-full max-w-5xl mx-auto h-full">
            {slide}
          </div>
        </div>
      ))}

      {/* Arrow nav at bottom */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 0 || animating}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-default transition-colors"
        >
          ←
        </button>
        <span className="text-xs text-white/30 uppercase tracking-widest">{current + 1} / {TOTAL}</span>
        <button
          onClick={() => goTo(current + 1)}
          disabled={current === TOTAL - 1 || animating}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-default transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
}
