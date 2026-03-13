import React, { useState } from 'react';
import { 
  ShieldCheck, Zap, ServerOff, FileStack, Settings2, Download, Layers, 
  PlayCircle, Star, Scissors, Minimize2, Lock, Unlock, PenTool, Scaling, ArrowRightLeft,
  Youtube, Instagram, Twitter, Facebook, HelpCircle, Clock, Calendar, Share2, Linkedin,
  ChevronRight, Lightbulb, ThumbsUp, ThumbsDown, CheckCircle2
} from 'lucide-react';

export const MergePdfBlog = () => {
  const shareUrl = encodeURIComponent('https://genzpdf.com/blog/merge-pdf');
  const shareTitle = encodeURIComponent('Check out this ultimate guide on how to merge & edit PDFs offline securely! 🚀');
  const currentYear = new Date().getFullYear();
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  // Combined FAQ array (all unique items from both versions)
  const faqItems = [
    {
      q: `Why is adding pages useful in ${currentYear}?`,
      a: "Combining contracts, assignment portfolios, and financial reports into a single, cohesive PDF remains the gold standard for professional sharing, legal compliance, and archiving."
    },
    {
      q: "Can I add pages from another document?",
      a: "Yes! The 'Advanced Page Transfer' visual editor allows you to extract specific pages from a source document and precisely insert them anywhere in your target PDF."
    },
    {
      q: "How do I add a blank page online?",
      a: "Easily drag and drop a blank PDF template file into your upload queue, reorder it to your preferred position, and hit merge."
    },
    {
      q: "Is Genz PDF free to use?",
      a: "Absolutely. 100% free forever. No premium subscriptions, no paywalls, no daily limits, and no hidden fees."
    },
    {
      q: "Does it protect my files?",
      a: "Yes. Using Client-Side Architecture, files are processed in your device's RAM and never uploaded to our servers. Data breaches are impossible."
    },
    {
      q: "Does it work on mobile phones?",
      a: "Yes! Genz PDF is fully responsive and works flawlessly on iOS (iPhone/iPad) and Android web browsers."
    },
    {
      q: "Can I use Genz PDF if I'm in Europe or Latin America?",
      a: "Yes, Genz PDF is accessible globally. Since we don't collect, upload, or process your files on external servers, we are fully compliant with GDPR and other international privacy laws by default."
    },
    {
      q: "What's the best way to merge two PDFs and add pages?",
      a: "Simply drag and drop your two PDFs into our upload zone, use the drag handles to reorder them if necessary, and click the big 'Merge' button. If you need specific pages swapped, use our 'Set Target' and 'Edit Pages' tools."
    },
    {
      q: "Can I add pages to a PDF from my phone?",
      a: "Yes! Genz PDF is fully responsive and works flawlessly on iOS (iPhone/iPad) and Android web browsers without needing to download any cumbersome apps."
    },
    {
      q: "Does Genz PDF work offline?",
      a: "Because Genz PDF runs entirely in your browser using JavaScript, once the website initially loads, the actual merging and editing process happens locally. It does not require an active internet connection to process the files."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 selection:bg-indigo-100 selection:text-indigo-900">
      {/* 🤖 SEO SCHEMA MARKUP */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "HowTo",
              "name": "How to Merge PDF Files Offline Securely",
              "description": "Step-by-step guide on how to combine PDF documents for free without uploading them to any server using Genz PDF.",
              "step": [
                { "@type": "HowToStep", "name": "Upload Your Files", "text": "Drag and drop multiple PDF files into the tool." },
                { "@type": "HowToStep", "name": "Rearrange the Order", "text": "Drag the files up or down to set them in your preferred order." },
                { "@type": "HowToStep", "name": "Merge and Download", "text": "Click the Merge Files button and download your combined document instantly." }
              ]
            },
            {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": `Why is adding pages to PDFs still useful in ${currentYear}?`,
                  "acceptedAnswer": { "@type": "Answer", "text": `Even in ${currentYear}, as digital documentation evolves, combining contracts, assignment portfolios, and financial reports into a single, cohesive PDF remains the gold standard for professional sharing, legal compliance, and archiving.` }
                },
                {
                  "@type": "Question",
                  "name": "Can I add pages to a PDF from another document?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Yes! Genz PDF's unique 'Advanced Page Transfer' visual editor allows you to extract specific pages from a source document and precisely insert them anywhere into your target PDF." }
                },
                {
                  "@type": "Question",
                  "name": "Is Genz PDF free to use?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. Genz PDF is 100% free forever. There are no premium subscriptions, no annoying paywalls, no daily limits, and no hidden fees." }
                }
              ]
            }
          ]
        })}
      </script>

      <article className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        
        {/* 🍞 Breadcrumb Navigation */}
        <nav className="flex items-center justify-center gap-2 text-xs md:text-sm text-slate-500 mb-10 font-medium">
          <a href="/" className="hover:text-indigo-600 transition-colors">Home</a>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-slate-400">Blog</span>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-indigo-700 font-bold bg-indigo-100/50 px-3 py-1 rounded-full shadow-sm">Merge PDF Guide</span>
        </nav>

        {/* Blog Header (Premium Hero Section) */}
        <header className="text-center mb-16 relative">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent blur-3xl rounded-full"></div>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
            <Zap size={14} className="fill-indigo-600 text-indigo-600" /> Ultimate Guide & Tech Deep Dive
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
            How to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">Merge & Edit PDF Files</span> Like a Pro
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Discover how to easily combine files, transfer specific pages between PDFs, and how our <strong className="text-slate-800">100% secure, offline-browser technology</strong> protects your data in {currentYear}.
          </p>
          
          {/* ⏱️ Meta Info */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm font-semibold text-slate-500 bg-white inline-flex px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
            <span className="flex items-center gap-2"><Calendar size={16} className="text-indigo-400" /> {currentYear}</span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="flex items-center gap-2"><Clock size={16} className="text-emerald-400" /> 5 min read</span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="flex items-center gap-2"><img src="/logo.png" alt="Genz PDF" className="w-5 h-5 object-contain" /> Genz PDF Team</span>
          </div>
        </header>

        {/* 📑 Table of Contents (Glassmorphism Card) */}
        <div className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-slate-200/60 mb-16 shadow-xl shadow-slate-200/40">
          <h3 className="font-black text-slate-900 mb-5 uppercase tracking-widest text-sm flex items-center gap-2">
            <Layers size={18} className="text-indigo-500" /> Table of Contents
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-indigo-600 font-medium text-sm">
            <li><a href="#exclusive-features" className="flex items-center gap-2 hover:text-indigo-800 hover:translate-x-1 transition-transform"><ChevronRight size={14}/> 1. Exclusive Features</a></li>
            <li><a href="#standard-merge" className="flex items-center gap-2 hover:text-indigo-800 hover:translate-x-1 transition-transform"><ChevronRight size={14}/> 2. Method 1: Standard Merge</a></li>
            <li><a href="#advanced-transfer" className="flex items-center gap-2 hover:text-indigo-800 hover:translate-x-1 transition-transform"><ChevronRight size={14}/> 3. Method 2: Advanced Page Transfer</a></li>
            <li><a href="#comparison" className="flex items-center gap-2 hover:text-indigo-800 hover:translate-x-1 transition-transform"><ChevronRight size={14}/> 4. Why Genz PDF is Better</a></li>
            <li><a href="#tech-stack" className="flex items-center gap-2 hover:text-indigo-800 hover:translate-x-1 transition-transform"><ChevronRight size={14}/> 5. The Tech Stack (Offline)</a></li>
            <li><a href="#faq" className="flex items-center gap-2 hover:text-indigo-800 hover:translate-x-1 transition-transform"><ChevronRight size={14}/> 6. Ultimate FAQ Guide</a></li>
            <li className="md:col-span-2 mt-2 pt-2 border-t border-slate-100"><a href="#more-tools" className="flex items-center gap-2 text-violet-600 font-bold hover:text-violet-800 hover:translate-x-1 transition-transform"><Zap size={14}/> 7. Explore More Free PDF Tools</a></li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="prose prose-lg prose-indigo max-w-none text-slate-700 marker:text-indigo-400">
          
          {/* Core Features Overview */}
          <h2 id="exclusive-features" className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3 scroll-mt-24">
            <span className="p-2 bg-indigo-100 rounded-xl text-indigo-600"><Layers size={24} /></span>
            Exclusive Features of Genz PDF Merge
          </h2>
          <p className="text-lg mb-8">Unlike standard PDF tools that just stick files together, Genz PDF gives you full control over your documents without ever uploading them to a server:</p>
          
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none pl-0 mb-16">
            <li className="flex items-start gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all m-0 group">
              <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                <ShieldCheck className="text-emerald-500" size={24} />
              </div>
              <div>
                <strong className="block text-slate-900 text-base mb-1">100% Privacy</strong>
                <span className="text-sm text-slate-500 leading-snug block">Files are processed locally in your browser.</span>
              </div>
            </li>
            <li className="flex items-start gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all m-0 group">
              <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                <Settings2 className="text-indigo-500" size={24} />
              </div>
              <div>
                <strong className="block text-slate-900 text-base mb-1">Advanced Transfer</strong>
                <span className="text-sm text-slate-500 leading-snug block">Move specific pages from one PDF to another.</span>
              </div>
            </li>
            <li className="flex items-start gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all m-0 group">
              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                <Download className="text-blue-500" size={24} />
              </div>
              <div>
                <strong className="block text-slate-900 text-base mb-1">Individual Downloads</strong>
                <span className="text-sm text-slate-500 leading-snug block">Download edited files separately or merge all.</span>
              </div>
            </li>
            <li className="flex items-start gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all m-0 group">
              <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                <Zap className="text-amber-500" size={24} />
              </div>
              <div>
                <strong className="block text-slate-900 text-base mb-1">No Size Limits</strong>
                <span className="text-sm text-slate-500 leading-snug block">Combine massive documents instantly via RAM.</span>
              </div>
            </li>
          </ul>

          {/* Cinematic Video Demo Placeholder */}
          <div className="my-16 relative rounded-3xl overflow-hidden bg-slate-900 aspect-video shadow-2xl border border-slate-800 flex flex-col items-center justify-center group cursor-pointer hover:shadow-indigo-500/20 transition-all">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-600/30 via-slate-900 to-slate-900 opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]"></div>
            <PlayCircle size={80} className="text-white/90 group-hover:text-indigo-400 group-hover:scale-110 transition-all duration-500 z-10 drop-shadow-2xl" />
            <span className="text-white font-black text-xl md:text-2xl mt-6 z-10 tracking-wide drop-shadow-md">Watch 1-Minute Interactive Demo</span>
            <span className="text-indigo-300 font-medium text-sm mt-2 z-10 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">(Coming Soon)</span>
          </div>

          {/* Basic Merge Guide */}
          <h2 id="standard-merge" className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3 scroll-mt-24">
            <span className="p-2 bg-violet-100 rounded-xl text-violet-600"><FileStack size={24} /></span>
            Method 1: The Standard Merge
          </h2>
          <p className="text-lg">If you just want to combine whole documents quickly:</p>
          <div className="space-y-4 my-8 pl-2">
            {[
              { step: 1, title: 'Upload', desc: 'Drag and drop multiple PDF files into the tool.' },
              { step: 2, title: 'Reorder', desc: 'Drag the files up or down to set them in your preferred order.' },
              { step: 3, title: 'Merge', desc: 'Click the massive "Merge Files" button on the right to combine them all into a single file instantly.' }
            ].map((item) => (
              <div key={item.step} className="flex gap-5 items-start bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-200">
                  {item.step}
                </div>
                <div className="pt-1">
                  <strong className="text-slate-900 text-lg">{item.title}:</strong> <span className="text-slate-600">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 💡 PREMIUM PRO TIP BOX */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6 md:p-8 rounded-3xl shadow-lg shadow-amber-100/50 my-12 flex flex-col sm:flex-row gap-6 items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Lightbulb size={120} className="text-amber-600" />
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-100 flex-shrink-0 z-10">
              <Lightbulb className="text-amber-500" size={32} />
            </div>
            <div className="z-10">
              <h4 className="text-amber-900 font-black text-xl m-0 mb-2 tracking-tight">Pro Tip for Faster Merging</h4>
              <p className="text-amber-800 text-base m-0 leading-relaxed">
                If your PDFs are extremely large, try using our <a href="/compress" className="text-amber-600 font-black hover:text-amber-700 underline decoration-amber-300 decoration-2 underline-offset-4 transition-colors">Compress PDF</a> tool first before merging them. This reduces the file size significantly, making your final merged document easier to share via email!
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-16"></div>

          {/* Advanced Page Transfer Guide */}
          <h2 id="advanced-transfer" className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3 scroll-mt-24">
            <span className="p-2 bg-rose-100 rounded-xl text-rose-600"><Settings2 size={24} /></span>
            Method 2: Advanced Page Transfer
          </h2>
          <p className="text-lg">Need to take just page 3 from "Document B" and insert it into the middle of "Document A"? Our visual editor makes this complex task incredibly simple:</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
            {[
              { step: 1, title: 'Set Target PDF', desc: 'Find the main document. Click "Set Target" to tell the tool where new pages will go.' },
              { step: 2, title: 'Extract Pages', desc: 'Go to your source document, click "Edit Pages", and select the specific pages you want.' },
              { step: 3, title: 'Choose Position', desc: 'Click exactly where you want the extracted pages to be inserted in the Target PDF.' }
            ].map((item) => (
              <div key={item.step} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-shadow relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 text-9xl font-black text-slate-50 group-hover:text-indigo-50 transition-colors z-0 select-none">{item.step}</div>
                <div className="relative z-10">
                  <h3 className="text-xl font-black text-slate-800 m-0 mb-3">{item.title}</h3>
                  <p className="text-sm text-slate-600 m-0 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50/50 rounded-3xl p-8 border border-indigo-100 mt-12">
            <h3 className="text-2xl font-black text-slate-900 m-0 mb-6">Flexible Download Options</h3>
            <ul className="space-y-4 list-none pl-0 m-0">
              <li className="flex items-start gap-3 text-slate-700 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <CheckCircle2 className="text-emerald-500 mt-0.5 flex-shrink-0" size={20}/>
                <span><strong className="text-slate-900">Download Target PDF:</strong> Get the updated document containing the inserted pages.</span>
              </li>
              <li className="flex items-start gap-3 text-slate-700 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <CheckCircle2 className="text-emerald-500 mt-0.5 flex-shrink-0" size={20}/>
                <span><strong className="text-slate-900">Download Source PDF:</strong> Get the updated version with the extracted pages removed.</span>
              </li>
              <li className="flex items-start gap-3 text-slate-700 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <CheckCircle2 className="text-emerald-500 mt-0.5 flex-shrink-0" size={20}/>
                <span><strong className="text-slate-900">Merge Everything:</strong> Stitch both newly updated documents together into one massive PDF.</span>
              </li>
            </ul>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-16"></div>

          {/* Comparison Section (Modern Table) */}
          <h2 id="comparison" className="text-3xl font-black text-slate-900 mb-10 text-center scroll-mt-24">
            Why Genz PDF is Better
          </h2>
          <div className="overflow-x-auto mb-16 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 bg-white">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-5 font-black text-slate-800 text-sm uppercase tracking-wider w-1/3">Feature</th>
                  <th className="p-5 font-black text-indigo-700 text-sm uppercase tracking-wider bg-indigo-50/50 w-1/3 border-x border-indigo-100">Genz PDF 🚀</th>
                  <th className="p-5 font-black text-slate-500 text-sm uppercase tracking-wider w-1/3">Standard Cloud Tools</th>
                </tr>
              </thead>
              <tbody className="text-base">
                {[
                  ['File Processing', 'Offline (Your Browser)', 'text-emerald-600 font-black', 'Cloud Servers', 'text-slate-500'],
                  ['Privacy Risk', 'Zero (Data stays with you)', 'text-emerald-600 font-black', 'High (Data sent online)', 'text-red-500 font-bold'],
                  ['File Size Limit', 'Unlimited (Based on RAM)', 'text-emerald-600 font-black', 'Capped at 10MB - 50MB', 'text-slate-500'],
                  ['Advanced Page Transfer', 'Yes (Visual Editor)', 'text-emerald-600 font-black', 'Paid feature / N/A', 'text-slate-500'],
                  ['Price', '100% Free Forever', 'text-indigo-600 font-black', 'Premium subscriptions', 'text-slate-500']
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 font-semibold text-slate-700">{row[0]}</td>
                    <td className={`p-5 bg-indigo-50/30 border-x border-indigo-50 ${row[2]}`}>{row[1]}</td>
                    <td className={`p-5 ${row[4]}`}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* The Tech Stack (Offline) */}
          <h2 id="tech-stack" className="text-3xl font-black text-slate-900 mt-16 mb-8 flex items-center gap-3 scroll-mt-24">
            <span className="p-2 bg-slate-800 rounded-xl text-white"><ServerOff size={24} /></span>
            The Tech Stack: How It Works Offline
          </h2>
          <p className="text-lg">Most PDF tools force you to upload your sensitive documents to their servers. We built Genz PDF using a <strong className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">100% Client-Side Architecture</strong>, meaning your files never leave your computer.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-10">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-black text-xl">Re</div>
              <h4 className="font-black text-slate-800 mb-2 m-0">React.js & Vite</h4>
              <p className="text-sm text-slate-600 m-0">Provides a smooth, ultra-fast user interface.</p>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 font-black text-xl">JS</div>
              <h4 className="font-black text-slate-800 mb-2 m-0">pdf-lib Engine</h4>
              <p className="text-sm text-slate-600 m-0">Reads, splits, and modifies PDFs directly in-browser.</p>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 font-black text-xl">API</div>
              <h4 className="font-black text-slate-800 mb-2 m-0">Modern Web APIs</h4>
              <p className="text-sm text-slate-600 m-0">Utilizes ArrayBuffer & Blob to handle massive files in RAM.</p>
            </div>
          </div>

          {/* Premium Testimonials Section */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 md:p-12 rounded-[2rem] shadow-2xl my-16 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50"></div>
            <h2 className="text-3xl font-black text-center m-0 mb-10 text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 relative z-10">Loved by Students & Professionals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
                <div className="flex text-amber-400 mb-4"><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/></div>
                <p className="text-indigo-50 italic text-base m-0 leading-relaxed">"The page extraction feature is a lifesaver. I was able to pull specific pages from my massive textbook PDF and merge them with my class notes in seconds without uploading anything!"</p>
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold">AS</div>
                  <p className="font-bold text-white m-0 tracking-wide">Ananya S. <span className="block text-xs text-indigo-300 font-medium">CS Student</span></p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
                <div className="flex text-amber-400 mb-4"><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/></div>
                <p className="text-indigo-50 italic text-base m-0 leading-relaxed">"Finally, a tool that lets me merge confidential legal contracts without worrying about cloud server data breaches. Genz PDF is incredibly fast and secure."</p>
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold">RM</div>
                  <p className="font-bold text-white m-0 tracking-wide">Rahul M. <span className="block text-xs text-indigo-300 font-medium">Corporate Lawyer</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-16"></div>

          {/* MEGA FAQ SECTION (with all items from both versions) */}
          <h2 id="faq" className="text-3xl font-black text-slate-900 mt-16 mb-10 flex items-center gap-3 scroll-mt-24">
            <span className="p-2 bg-sky-100 rounded-xl text-sky-600"><HelpCircle size={24} /></span>
            Ultimate FAQ Guide ({currentYear})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqItems.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                <h4 className="font-black text-slate-900 text-lg m-0 mb-3 leading-tight">{faq.q}</h4>
                <p className="text-slate-600 text-sm leading-relaxed m-0">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* Social Media Updates - Follow Us (from second version) */}
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl shadow-sm mt-8">
            <h4 className="font-bold text-indigo-900 text-lg m-0 mb-3">How do I stay updated with new Genz PDF tools in {currentYear}?</h4>
            <p className="text-indigo-800 text-sm leading-relaxed m-0 mb-5">Follow our official channels to get the latest updates, tutorials, and new tool announcements:</p>
            <div className="flex flex-wrap gap-4">
              <a href="https://www.youtube.com/channel/UCBV_lAS0ElDQv6Wu8kz5G8A" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-100 rounded-lg shadow-sm transition-all text-sm font-bold no-underline">
                <Youtube size={18} /> YouTube
              </a>
              <a href="https://instagram.com/genzpdftool" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-pink-50 text-pink-600 border border-pink-100 rounded-lg shadow-sm transition-all text-sm font-bold no-underline">
                <Instagram size={18} /> Instagram
              </a>
              <a href="https://x.com/genzpdftool?s=20" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg shadow-sm transition-all text-sm font-bold no-underline">
                <Twitter size={18} /> Twitter / X
              </a>
              <a href="https://www.facebook.com/share/v/1AuVepXHUQ/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 text-blue-600 border border-blue-100 rounded-lg shadow-sm transition-all text-sm font-bold no-underline">
                <Facebook size={18} /> Facebook
              </a>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-16"></div>

          {/* Use Cases Grid */}
          <h2 className="text-3xl font-black text-slate-900 mt-16 mb-8 text-center">
            Who Uses Genz PDF Merge?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            <div className="bg-gradient-to-b from-indigo-50 to-white p-6 rounded-3xl border border-indigo-100 text-center shadow-sm">
              <div className="text-4xl mb-4">🎓</div>
              <h4 className="font-black text-slate-900 mb-2">Students</h4>
              <p className="text-sm text-slate-600 m-0">Combine lecture slides, assignments, and research papers neatly.</p>
            </div>
            <div className="bg-gradient-to-b from-emerald-50 to-white p-6 rounded-3xl border border-emerald-100 text-center shadow-sm">
              <div className="text-4xl mb-4">💼</div>
              <h4 className="font-black text-slate-900 mb-2">Professionals</h4>
              <p className="text-sm text-slate-600 m-0">Stitch together invoices, reports, and portfolios securely.</p>
            </div>
            <div className="bg-gradient-to-b from-rose-50 to-white p-6 rounded-3xl border border-rose-100 text-center shadow-sm">
              <div className="text-4xl mb-4">⚖️</div>
              <h4 className="font-black text-slate-900 mb-2">Legal & Finance</h4>
              <p className="text-sm text-slate-600 m-0">Handle confidential contracts safely. Files never touch a server.</p>
            </div>
          </div>

          {/* Cross-Platform Compatibility Section (from second version) */}
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl my-10 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-3">Merge PDFs on Any Device</h3>
              <p className="text-slate-300 text-sm md:text-base max-w-xl">
                Whether you are on a Windows PC, Mac, Android phone, or iPhone, Genz PDF works flawlessly directly in your browser. <strong>No apps to install. No extensions required.</strong>
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-20">
              <Zap size={150} />
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-16"></div>

          {/* 🔗 FULL INTERNAL LINKING SECTION (All 7 Tools Included) */}
          <h2 id="more-tools" className="text-3xl font-black text-slate-900 mb-8 scroll-mt-24 text-center">
            Explore More Free PDF Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {[
              { href: '/split', icon: Scissors, color: 'indigo', title: 'Split PDF', desc: 'Extract or remove specific pages.' },
              { href: '/compress', icon: Minimize2, color: 'emerald', title: 'Compress PDF', desc: 'Reduce file size instantly.' },
              { href: '/protect', icon: Lock, color: 'rose', title: 'Protect PDF', desc: 'Add secure passwords.' },
              { href: '/unlock', icon: Unlock, color: 'amber', title: 'Unlock PDF', desc: 'Remove PDF passwords.' },
              { href: '/signature', icon: PenTool, color: 'blue', title: 'Sign PDF', desc: 'Add your e-signature securely.' },
              { href: '/convert', icon: ArrowRightLeft, color: 'fuchsia', title: 'Convert PDF', desc: 'Convert PDF to Word, JPG, etc.' }
            ].map((tool, i) => (
              <a key={i} href={tool.href} className="flex items-center gap-4 p-5 rounded-3xl border border-slate-200 hover:border-slate-300 hover:shadow-xl hover:-translate-y-1 transition-all group no-underline bg-white">
                <div className={`p-4 bg-${tool.color}-50 rounded-2xl group-hover:bg-${tool.color}-500 transition-colors`}>
                  <tool.icon size={24} className={`text-${tool.color}-600 group-hover:text-white`} />
                </div>
                <div>
                  <h4 className={`m-0 font-black text-slate-900 group-hover:text-${tool.color}-600 leading-tight text-lg`}>{tool.title}</h4>
                  <p className="m-0 text-xs text-slate-500 mt-1">{tool.desc}</p>
                </div>
              </a>
            ))}
            
            <a href="/resize" className="flex items-center gap-4 p-5 rounded-3xl border border-slate-200 hover:border-slate-300 hover:shadow-xl hover:-translate-y-1 transition-all group no-underline bg-white sm:col-span-2 lg:col-span-3 lg:max-w-md mx-auto w-full">
              <div className="p-4 bg-cyan-50 rounded-2xl group-hover:bg-cyan-500 transition-colors">
                <Scaling size={24} className="text-cyan-600 group-hover:text-white" />
              </div>
              <div>
                <h4 className="m-0 font-black text-slate-900 group-hover:text-cyan-600 leading-tight text-lg">Resize Image</h4>
                <p className="m-0 text-xs text-slate-500 mt-1">Change image dimensions & KB accurately.</p>
              </div>
            </a>
          </div>

          {/* Final CTA Button */}
          <div className="text-center my-20">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Ready to merge like a pro?</h3>
            <a 
              href="/merge" 
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-lg rounded-full shadow-2xl shadow-indigo-300 transition-all hover:-translate-y-1 hover:scale-105 no-underline"
            >
              <FileStack size={24} />
              Open Merge PDF Tool Now
            </a>
          </div>

          {/* 🆕 🌟 INTERACTIVE FEEDBACK WIDGET */}
          <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-[2rem] shadow-lg mb-12 text-center max-w-lg mx-auto">
            {!feedbackGiven ? (
              <>
                <h4 className="font-black text-slate-900 text-xl m-0 mb-6">Was this guide helpful?</h4>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setFeedbackGiven(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 rounded-full transition-all font-bold text-slate-700"
                  >
                    <ThumbsUp size={18} /> Yes, great!
                  </button>
                  <button 
                    onClick={() => setFeedbackGiven(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-2 border-slate-100 hover:border-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-full transition-all font-bold text-slate-700"
                  >
                    <ThumbsDown size={18} /> Needs work
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 text-emerald-600 animate-in fade-in zoom-in duration-500">
                <CheckCircle2 size={48} />
                <h4 className="font-black text-xl m-0 text-slate-900">Thank you!</h4>
                <p className="text-base text-slate-500 m-0">Your feedback helps us improve.</p>
              </div>
            )}
          </div>

          {/* 📤 SHARE & SOCIALS */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900 p-8 rounded-[2rem] shadow-xl mb-16 text-white">
            <div className="text-center md:text-left">
              <h4 className="font-black text-xl m-0 mb-2 flex items-center justify-center md:justify-start gap-2">
                <Share2 className="text-indigo-400"/> Share the knowledge
              </h4>
              <p className="text-slate-400 text-sm m-0">Help others discover secure, offline PDF tools.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 hover:bg-[#1DA1F2] rounded-full transition-colors" title="Twitter"><Twitter size={20}/></a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 hover:bg-[#0A66C2] rounded-full transition-colors" title="LinkedIn"><Linkedin size={20}/></a>
              <a href={`https://api.whatsapp.com/send?text=${shareTitle} ${shareUrl}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 hover:bg-[#25D366] rounded-full transition-colors" title="WhatsApp">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </a>
              <a href="https://www.youtube.com/channel/UCBV_lAS0ElDQv6Wu8kz5G8A" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 hover:bg-[#FF0000] rounded-full transition-colors" title="YouTube"><Youtube size={20}/></a>
              <a href="https://instagram.com/genzpdftool" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 hover:bg-[#E1306C] rounded-full transition-colors" title="Instagram"><Instagram size={20}/></a>
            </div>
          </div>

          {/* ✍️ AUTHOR BIO BOX (Premium E-E-A-T Card) */}
          <div className="bg-white border-2 border-indigo-50 p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[2rem] blur-md opacity-40"></div>
              <img src="/logo.png" alt="Pintu and Raushan" className="relative w-28 h-28 bg-white p-3 rounded-[2rem] shadow-lg border border-slate-100 object-contain flex-shrink-0 z-10" />
            </div>
            
            <div className="relative z-10 text-center md:text-left">
              <h4 className="font-black text-2xl text-slate-900 m-0 mb-2 flex items-center justify-center md:justify-start gap-2">
                Pintu & Raushan <ShieldCheck size={24} className="text-blue-500" />
              </h4>
              <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 uppercase tracking-widest m-0 mb-4">Founders & Developers</p>
              <p className="text-slate-600 text-base m-0 leading-relaxed max-w-2xl">
                Creators behind Genz PDF. With a mission to provide fast, unlimited, and 100% secure offline PDF tools, they built Genz PDF so users never have to upload their private documents to sketchy cloud servers again.
              </p>
              <div className="flex justify-center md:justify-start gap-4 mt-6">
                <a href="https://www.linkedin.com/in/pintu-chauhan-ctuap/" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"><Linkedin size={20} /></a>
                <a href="https://www.linkedin.com/in/raushan-kumar-0b5340373/" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"><Linkedin size={20} /></a>
                <a href="https://x.com/genzpdftool?s=20" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-50 text-slate-500 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"><Twitter size={20} /></a>
              </div>
            </div>
          </div>

        </div>
      </article>
    </div>
  );
};

export default MergePdfBlog;
