// components/Home.tsx
import React, { useState, useEffect } from 'react';
import {
  Files,
  Scissors,
  ArrowRightLeft,
  Minimize2,
  Scaling,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Star,
  CheckCircle2,
  PenTool,
  Unlock
} from 'lucide-react';
import { AppMode } from '../types';
import { ScrollHero } from './ScrollHero';

interface HomeProps {
  setMode: (mode: AppMode) => void;
}

export const Home: React.FC<HomeProps> = ({ setMode }) => {
  // Visitor counter (kept as is)
  const [visitorCount, setVisitorCount] = useState<number | string>("10,000");

  useEffect(() => {
    const trackVisit = async () => {
      try {
        const hasVisited = sessionStorage.getItem('visited_genzpdf');
        
        if (!hasVisited) {
          const res = await fetch('/api/visit', { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            setVisitorCount(data.count);
            sessionStorage.setItem('visited_genzpdf', 'true');
          }
        } else {
          const res = await fetch('/api/visit');
          if (res.ok) {
            const data = await res.json();
            setVisitorCount(data.count);
          }
        }
      } catch (error) {
        console.error("Failed to load visitor stats");
      }
    };

    trackVisit();
  }, []);

  // ========== REMOVED: manual meta-update useEffect ==========
  // All SEO is now handled globally by <SEO /> component in App.tsx
  // ==========================================================

  // Tools data (unchanged)
  const tools = [
    {
      id: 'merge',
      title: 'Merge PDF',
      desc: 'Combine multiple files into one document. Drag & drop reordering.',
      icon: Files,
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      shadow: 'hover:shadow-blue-500/20',
      border: 'hover:border-blue-500/50',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'split',
      title: 'Split PDF',
      desc: 'Separate pages or extract specific ranges into independent files.',
      icon: Scissors,
      iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
      shadow: 'hover:shadow-rose-500/20',
      border: 'hover:border-rose-500/50',
      gradient: 'from-rose-500 to-pink-600'
    },
    {
      id: 'compress',
      title: 'Compress PDF',
      desc: 'Shrink file size up to 90% while preserving visual quality.',
      icon: Minimize2,
      iconBg: 'bg-gradient-to-br from-orange-400 to-red-500',
      shadow: 'hover:shadow-orange-500/20',
      border: 'hover:border-orange-500/50',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'convert',
      title: 'Convert PDF',
      desc: 'Transform PDFs to Word, JPG, PNG or create PDFs from images.',
      icon: ArrowRightLeft,
      iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
      shadow: 'hover:shadow-violet-500/20',
      border: 'hover:border-violet-500/50',
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      id: 'resize',
      title: 'Resize Image',
      desc: 'Resize JPG, PNG, or WebP images by pixel or percentage.',
      icon: Scaling,
      iconBg: 'bg-gradient-to-br from-emerald-400 to-green-600',
      shadow: 'hover:shadow-emerald-500/20',
      border: 'hover:border-emerald-500/50',
      gradient: 'from-emerald-500 to-green-600'
    },
    {
      id: 'protect',
      title: 'Protect PDF',
      desc: 'Encrypt your PDF with a password. Secure sensitive data instantly.',
      icon: Lock,
      iconBg: 'bg-gradient-to-br from-indigo-600 to-fuchsia-600',
      shadow: 'hover:shadow-indigo-500/30',
      border: 'hover:border-indigo-500/50',
      gradient: 'from-indigo-600 to-fuchsia-600',
      badge: 'New'
    },
    {
      id: 'signature',
      title: 'Sign PDF',
      desc: 'Add e-signatures, text, and dates anywhere on your PDF. Customize fonts and colors.',
      icon: PenTool,
      iconBg: 'bg-gradient-to-br from-teal-400 to-emerald-600',
      shadow: 'hover:shadow-teal-500/20',
      border: 'hover:border-teal-500/50',
      gradient: 'from-teal-500 to-emerald-600',
      badge: 'New'
    },
    {
      id: 'unlock',
      title: 'Unlock PDF',
      desc: 'Unlock PDF Online: Remove Passwords & Restrictions | Genz PDF',
      icon: Unlock,
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600',
      shadow: 'hover:shadow-purple-500/20',
      border: 'hover:border-purple-500/50',
      gradient: 'from-purple-500 to-pink-600',
      badge: 'New'
    },
  ];

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-slate-50">
      
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-400/20 blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.4 }}></div>
      </div>

      <ScrollHero />

      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        
        {/* HERO SECTION */}
        <header className="text-center mb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-slate-200 shadow-sm backdrop-blur-md text-slate-600 text-xs font-bold uppercase tracking-widest mb-8 hover:scale-105 transition-transform cursor-default">
             <Star size={14} className="fill-yellow-400 text-yellow-400" />
             Trusted by {visitorCount}+ Users
          </div>
          
          <h2 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]">
            Master your Documents <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 drop-shadow-sm">
              Without Limits.
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Merge, Split, Compress, Convert, Resize, and <span className="text-indigo-600 font-bold">Protect</span> your documents. 
            Everything happens in your browser—files never leave your device.
          </p>
        </header>

        {/* TOOLS GRID */}
        <section aria-label="PDF Tools Collection" className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {tools.map((tool, idx) => (
              <a
                key={tool.id}
                href={`/${tool.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setMode(tool.id as AppMode);
                  window.history.pushState({}, '', `/${tool.id}`);
                }}
                className={`
                  group relative flex flex-col p-8 rounded-3xl 
                  bg-white/80 backdrop-blur-xl border border-slate-200/60
                  transition-all duration-300 ease-out overflow-hidden
                  hover:-translate-y-2 hover:bg-white hover:shadow-2xl
                  ${tool.shadow} ${tool.border}
                `}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${tool.gradient} rounded-t-3xl`}></div>
                
                {tool.badge && (
                  <div className="absolute top-4 right-4 px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
                    {tool.badge}
                  </div>
                )}

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg text-white ${tool.iconBg} transform group-hover:scale-110 transition-transform duration-300`}>
                  <tool.icon size={32} strokeWidth={2} />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {tool.title}
                </h2>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow font-medium">
                  {tool.desc}
                </p>
                
                <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100 group-hover:border-slate-200 transition-colors">
                  <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Launch Tool</span>
                  <div className="p-2 rounded-full bg-slate-50 group-hover:bg-indigo-600 transition-colors duration-300">
                    <ArrowRight size={18} className="text-slate-400 group-hover:text-white transition-all group-hover:translate-x-1" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* TRUST INDICATORS */}
        <section className="relative py-16 bg-white/60 backdrop-blur-md rounded-[3rem] border border-slate-200/60 mb-16 text-center shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto px-6">
            <div className="flex flex-col items-center gap-4 group">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                <ShieldCheck size={32} />
              </div>
              <h3 className="font-bold text-lg text-slate-900">100% Secure</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Local processing via WebAssembly. Your files never touch our servers.</p>
            </div>
            <div className="flex flex-col items-center gap-4 group">
              <div className="p-4 bg-amber-50 text-amber-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                <Zap size={32} />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Blazing Fast</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Optimized algorithms merge, split, and convert files in milliseconds.</p>
            </div>
            <div className="flex flex-col items-center gap-4 group">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                <Globe size={32} />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Universal</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Works on Chrome, Safari, Edge across Mac, Windows, and Mobile.</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};
