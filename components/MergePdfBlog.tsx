import React, { useState } from 'react';
import { 
  ShieldCheck, Zap, ServerOff, FileStack, Settings2, Download, Layers, 
  PlayCircle, Star, Scissors, Minimize2, Lock, Unlock, PenTool, Scaling, ArrowRightLeft,
  Youtube, Instagram, Twitter, Facebook, HelpCircle, Clock, Calendar, Share2, Linkedin,
  ChevronRight, Lightbulb, ThumbsUp, ThumbsDown, CheckCircle
} from 'lucide-react';

export const MergePdfBlog = () => {
  // 🆕 Feedback State
  const [feedback, setFeedback] = useState(null);

  // Share URLs
  const shareUrl = encodeURIComponent('https://genzpdf.com/blog/merge-pdf');
  const shareTitle = encodeURIComponent('Check out this ultimate guide on how to merge & edit PDFs offline securely! 🚀');
  
  // Dynamic Year for Evergreen SEO Content
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-200 selection:text-indigo-900">
      {/* 🤖 SEO SCHEMA MARKUP FOR GOOGLE RICH SNIPPETS (HowTo & FAQ) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "HowTo",
              "name": "How to Merge PDF Files Offline Securely",
              "description": "Step-by-step guide on how to combine PDF documents for free without uploading them to any server using Genz PDF.",
              "step": [
                {
                  "@type": "HowToStep",
                  "name": "Upload Your Files",
                  "text": "Drag and drop multiple PDF files into the tool."
                },
                {
                  "@type": "HowToStep",
                  "name": "Rearrange the Order",
                  "text": "Drag the files up or down to set them in your preferred order."
                },
                {
                  "@type": "HowToStep",
                  "name": "Merge and Download",
                  "text": "Click the Merge Files button and download your combined document instantly."
                }
              ]
            },
            {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": `Why is adding pages to PDFs still useful in ${currentYear}?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `Even in ${currentYear}, as digital documentation evolves, combining contracts, assignment portfolios, and financial reports into a single, cohesive PDF remains the gold standard for professional sharing, legal compliance, and archiving.`
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I add pages to a PDF from another document?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Genz PDF's unique 'Advanced Page Transfer' visual editor allows you to extract specific pages from a source document and precisely insert them anywhere into your target PDF."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is Genz PDF free to use?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Absolutely. Genz PDF is 100% free forever. There are no premium subscriptions, no annoying paywalls, no daily limits, and no hidden fees."
                  }
                }
              ]
            }
          ]
        })}
      </script>

      {/* Hero Background Elements */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-100/60 to-transparent pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 md:w-96 md:h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none z-0 animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute top-20 left-0 -ml-20 w-56 h-56 md:w-72 md:h-72 bg-blue-200/40 rounded-full blur-3xl pointer-events-none z-0 animate-pulse" style={{ animationDuration: '5s' }}></div>

      <article className="relative z-10 max-w-4xl mx-auto py-10 md:py-16 px-4 sm:px-6 lg:px-8">
        
        {/* 🍞 Breadcrumb Navigation */}
        <nav className="flex items-center justify-center gap-2 text-xs md:text-sm text-slate-500 mb-8 md:mb-10 font-medium">
          <div className="flex items-center gap-2 bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-sm border border-slate-200/60 overflow-hidden whitespace-nowrap">
            <a href="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">Home</a>
            <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
            <span className="text-slate-400">Blog</span>
            <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
            <span className="text-indigo-700 font-bold bg-indigo-50 px-2 md:px-3 py-1 rounded-full border border-indigo-100">Merge PDF Guide</span>
          </div>
        </nav>

        {/* Blog Header */}
        <header className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6 border border-indigo-200/50 shadow-sm">
            <Zap size={14} className="text-indigo-500" /> Ultimate Guide & Tech Deep Dive
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-4 md:mb-6 leading-tight">
            How to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600">Merge & Edit PDF Files</span> Like a Pro
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-6 md:mb-8 leading-relaxed px-2">
            Discover how to easily combine files, transfer specific pages between PDFs, and how our 100% secure, offline-browser technology protects your data in {currentYear}.
          </p>
          
          {/* ⏱️ Meta Info */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm font-semibold text-slate-500 bg-white inline-flex mx-auto px-4 md:px-6 py-2.5 md:py-3 rounded-2xl shadow-sm border border-slate-100">
            <span className="flex items-center gap-1.5 md:gap-2"><Calendar size={14} className="text-slate-400 md:w-4 md:h-4" /> {currentYear}</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5 md:gap-2"><Clock size={14} className="text-slate-400 md:w-4 md:h-4" /> 5 min read</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5 md:gap-2 text-indigo-900">
              <img src="/logo.png" alt="" className="w-4 h-4 md:w-5 md:h-5 object-contain" onError={(e) => e.target.style.display='none'} /> 
              Genz PDF Team
            </span>
          </div>
        </header>

        {/* 📑 Table of Contents */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 mb-12 md:mb-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-500 rounded-l-3xl"></div>
          <h3 className="font-bold text-slate-900 mb-4 md:mb-5 uppercase tracking-widest text-xs md:text-sm flex items-center gap-2">
            <Layers size={18} className="text-indigo-500" /> Table of Contents
          </h3>
          <ul className="space-y-3 text-slate-600 font-medium text-sm md:text-base ml-2">
            {[
              { id: "exclusive-features", text: "1. Exclusive Features of Genz PDF Merge" },
              { id: "standard-merge", text: "2. Method 1: The Standard Merge" },
              { id: "advanced-transfer", text: "3. Method 2: Advanced Page Transfer" },
              { id: "comparison", text: "4. Why Genz PDF is Better (Comparison)" },
              { id: "tech-stack", text: "5. The Tech Stack: How It Works Offline" },
              { id: "faq", text: `6. Frequently Asked Questions (${currentYear} Guide)` },
              { id: "more-tools", text: "7. Explore More Free PDF Tools" }
            ].map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="hover:text-indigo-600 transition-colors flex items-center gap-2 group-hover:translate-x-1 duration-300">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-slate-300 group-hover:bg-indigo-400"></span>
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className="prose prose-slate md:prose-lg prose-indigo prose-headings:font-bold prose-headings:tracking-tight prose-p:text-slate-600 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline max-w-none text-slate-700">
          
          {/* Core Features Overview */}
          <h2 id="exclusive-features" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mb-6 md:mb-8 flex items-center gap-3 scroll-mt-24 not-prose">
            <div className="p-2 md:p-2.5 bg-indigo-100 text-indigo-600 rounded-xl"><Layers className="w-5 h-5 md:w-6 md:h-6" /></div> 
            Exclusive Features of Genz PDF Merge
          </h2>
          <p className="text-base md:text-lg mb-6 md:mb-8">Unlike standard PDF tools that just stick files together, Genz PDF gives you full control over your documents without ever uploading them to a server:</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mb-10 md:mb-14 not-prose">
            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="p-2.5 md:p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors flex-shrink-0">
                <ShieldCheck className="text-emerald-600 w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">100% Privacy</strong>
                <span className="text-xs md:text-sm text-slate-500 leading-relaxed">Files are processed locally in your browser.</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="p-2.5 md:p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors flex-shrink-0">
                <Settings2 className="text-indigo-600 w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">Advanced Page Transfer</strong>
                <span className="text-xs md:text-sm text-slate-500 leading-relaxed">Move specific pages from one PDF directly into another.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="p-2.5 md:p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors flex-shrink-0">
                <Download className="text-blue-600 w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">Individual Downloads</strong>
                <span className="text-xs md:text-sm text-slate-500 leading-relaxed">Download edited files separately or merge them all together.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="p-2.5 md:p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors flex-shrink-0">
                <Zap className="text-amber-600 w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">No File Size Limits</strong>
                <span className="text-xs md:text-sm text-slate-500 leading-relaxed">Combine massive documents instantly using your device's RAM.</span>
              </div>
            </div>
          </div>

          {/* Video Demo Placeholder */}
          <div className="my-10 md:my-16 relative rounded-2xl md:rounded-3xl overflow-hidden bg-slate-900 aspect-video shadow-xl md:shadow-2xl border border-slate-800 flex flex-col items-center justify-center group cursor-pointer hover:shadow-indigo-500/20 transition-all duration-500 not-prose">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-slate-900 to-slate-900"></div>
            
            <div className="relative z-10 flex flex-col items-center p-4 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-110 group-hover:bg-indigo-500/30 transition-all duration-500 mb-3 md:mb-4">
                <PlayCircle className="text-white fill-white/20 ml-1 w-8 h-8 md:w-10 md:h-10" />
              </div>
              <span className="text-white font-bold text-base md:text-xl tracking-wide">Watch 1-Minute Interactive Demo</span>
              <span className="inline-block mt-2 md:mt-3 px-3 py-1 bg-white/10 rounded-full text-slate-300 text-[10px] md:text-xs font-medium uppercase tracking-widest backdrop-blur-sm border border-white/10">Coming Soon</span>
            </div>
          </div>

          {/* Basic Merge Guide */}
          <h2 id="standard-merge" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mb-6 md:mb-8 flex items-center gap-3 scroll-mt-24 not-prose">
            <div className="p-2 md:p-2.5 bg-blue-100 text-blue-600 rounded-xl"><FileStack className="w-5 h-5 md:w-6 md:h-6" /></div> 
            Method 1: The Standard Merge
          </h2>
          <p className="text-base md:text-lg mb-4 md:mb-6">If you just want to combine whole documents quickly, follow these 3 simple steps:</p>
          
          <div className="space-y-4 my-6 md:my-8 not-prose">
            {[
              { step: 1, title: "Upload", desc: "Drag and drop multiple PDF files into the tool." },
              { step: 2, title: "Reorder", desc: "Drag the files up or down to set them in your preferred order." },
              { step: 3, title: "Merge", desc: "Click the massive \"Merge Files\" button on the right to combine them all into a single file instantly." }
            ].map((item) => (
              <div key={item.step} className="flex gap-4 md:gap-5 items-start bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md text-sm md:text-base">
                  {item.step}
                </div>
                <div className="pt-1 md:pt-2">
                  <strong className="text-slate-900 text-base md:text-lg block mb-0.5 md:mb-1">{item.title}</strong>
                  <span className="text-slate-600 text-sm md:text-base">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 💡 PRO TIP BOX */}
          <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm my-10 md:my-12 overflow-hidden not-prose group">
            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-amber-400/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-amber-400/20 transition-all duration-500"></div>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-5 relative z-10">
              <div className="flex-shrink-0 self-start p-3 bg-amber-100 rounded-2xl text-amber-600">
                <Lightbulb size={24} className="animate-pulse md:w-7 md:h-7" />
              </div>
              <div>
                <h4 className="text-amber-900 font-bold text-base md:text-lg mb-1 md:mb-2">Pro Tip for Faster Merging</h4>
                <p className="text-amber-800/90 text-sm md:text-base leading-relaxed">
                  If your PDFs are extremely large, try using our <a href="/compress" className="text-amber-700 font-black underline decoration-amber-300 underline-offset-4 hover:text-amber-900 transition-colors">Compress PDF</a> tool first before merging them. This reduces the file size significantly, making your final merged document easier to share via email!
                </p>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-10 md:my-14 not-prose"></div>

          {/* Advanced Page Transfer Guide */}
          <h2 id="advanced-transfer" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mb-6 md:mb-8 flex items-center gap-3 scroll-mt-24 not-prose">
            <div className="p-2 md:p-2.5 bg-purple-100 text-purple-600 rounded-xl"><Settings2 className="w-5 h-5 md:w-6 md:h-6" /></div> 
            Method 2: Advanced Page Transfer
          </h2>
          <p className="text-base md:text-lg mb-6 md:mb-8">Need to take just page 3 from "Document B" and insert it into the middle of "Document A"? Our visual editor makes this complex task incredibly simple:</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 my-8 md:my-10 not-prose">
            {[
              { step: "Step 1", title: "Set Your Target PDF", desc: "Find the main document you want to add pages into. Click the 'Set Target' button on that specific file. This tells the tool where the new pages will eventually go." },
              { step: "Step 2", title: "Extract Pages", desc: "Go to your second document (the source) and click 'Edit Pages'. A visual grid will open. Select the specific pages you want to extract and click confirm." },
              { step: "Step 3", title: "Choose Insert Position", desc: "Immediately after extracting, the visual editor for your Target PDF will open. Click exactly where you want the extracted pages to be inserted." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 group-hover:bg-indigo-500 transition-colors"></div>
                <span className="text-[10px] md:text-xs font-black text-indigo-500 uppercase tracking-widest mb-1 md:mb-2 block">{item.step}</span>
                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 md:mb-3">{item.title}</h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Flexible Download Options */}
          <div className="bg-slate-50 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200/50 my-10 md:my-12 not-prose">
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-4 md:mb-5 flex items-center gap-2">
              <Download className="text-slate-400 w-5 h-5 md:w-5 md:h-5" /> Flexible Download Options
            </h3>
            <p className="text-sm md:text-base text-slate-600 mb-5 md:mb-6">After using the Advanced Page Transfer, you have three distinct choices on how to export your work:</p>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex items-start gap-2.5 md:gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full flex-shrink-0 bg-indigo-500"></div>
                <p className="text-slate-700 text-sm md:text-base leading-relaxed m-0"><strong className="text-slate-900">Download Target PDF:</strong> Click the download icon specifically on your Target file to get the updated document.</p>
              </li>
              <li className="flex items-start gap-2.5 md:gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full flex-shrink-0 bg-purple-500"></div>
                <p className="text-slate-700 text-sm md:text-base leading-relaxed m-0"><strong className="text-slate-900">Download Source PDF:</strong> Click the download icon on your Source file to get the updated version (with extracted pages removed).</p>
              </li>
              <li className="flex items-start gap-2.5 md:gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full flex-shrink-0 bg-emerald-500"></div>
                <p className="text-slate-700 text-sm md:text-base leading-relaxed m-0"><strong className="text-slate-900">Merge Everything:</strong> Click the main "Merge Files" button on the right sidebar to stitch both of these newly updated documents together.</p>
              </li>
            </ul>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-10 md:my-14 not-prose"></div>

          {/* Comparison Section */}
          <h2 id="comparison" className="text-2xl sm:text-3xl font-black text-slate-900 mb-8 md:mb-10 text-center scroll-mt-24 not-prose">
            Why Genz PDF is Better
          </h2>
          <div className="overflow-x-auto mb-12 md:mb-16 px-1 not-prose rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm">
            <table className="w-full text-left border-collapse min-w-[500px] md:min-w-[600px] bg-white">
              <thead>
                <tr>
                  <th className="p-4 md:p-5 font-bold text-slate-500 uppercase tracking-wider text-[10px] md:text-xs border-b border-slate-200 w-1/3">Feature</th>
                  <th className="p-4 md:p-5 font-black text-indigo-700 bg-indigo-50/80 border-x border-b border-slate-200 text-sm md:text-base text-center w-1/3 shadow-[inset_0_0_10px_rgba(0,0,0,0.02)]">
                    Genz PDF 🚀
                  </th>
                  <th className="p-4 md:p-5 font-bold text-slate-400 uppercase tracking-wider text-[10px] md:text-xs border-b border-slate-200 text-center w-1/3">Standard Cloud Tools</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm md:text-base">
                {[
                  { feature: "File Processing", genz: "Offline (Your Browser)", bad: "Cloud Servers (Upload required)", highlight: true },
                  { feature: "Privacy Risk", genz: "Zero (Data stays with you)", bad: "High (Data sent over internet)", highlight: false },
                  { feature: "File Size Limit", genz: "Unlimited (Based on RAM)", bad: "Usually capped at 10MB - 50MB", highlight: true },
                  { feature: "Advanced Page Transfer", genz: "Yes (Visual Editor)", bad: "Paid feature or Not available", highlight: false },
                  { feature: "Price", genz: "100% Free Forever", bad: "Premium subscriptions needed", highlight: true }
                ].map((row, idx) => (
                  <tr key={idx} className={row.highlight ? "bg-slate-50/50" : "bg-white"}>
                    <td className="p-4 md:p-5 border-b border-slate-100 font-semibold text-slate-700">{row.feature}</td>
                    <td className="p-4 md:p-5 border-b border-indigo-100 text-emerald-600 font-bold bg-indigo-50/50 border-x text-center shadow-[inset_0_0_10px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row items-center justify-center gap-1.5 md:gap-2">
                       <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" /> <span className="text-center sm:text-left">{row.genz}</span>
                    </td>
                    <td className="p-4 md:p-5 border-b border-slate-100 text-slate-500 text-center">{row.bad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Technical Deep Dive Section */}
          <div className="bg-slate-900 text-white p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-2xl my-12 md:my-16 relative overflow-hidden not-prose">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 md:w-72 md:h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 md:w-72 md:h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 id="tech-stack" className="text-xl sm:text-2xl md:text-3xl font-black mb-4 md:mb-6 flex items-center gap-2 md:gap-3 scroll-mt-24">
                <ServerOff className="text-indigo-400 w-6 h-6 md:w-8 md:h-8 flex-shrink-0" /> 
                The Tech Stack: How It Works Offline
              </h2>
              <p className="text-slate-300 text-sm md:text-lg leading-relaxed mb-6 md:mb-8">
                Most PDF tools force you to upload your sensitive documents to their servers. We built Genz PDF using a <strong className="text-white">100% Client-Side Architecture</strong>, meaning your files never leave your computer.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[
                  { title: "React.js & Vite", desc: "Provides a smooth, ultra-fast user interface." },
                  { title: "pdf-lib", desc: "The core JavaScript engine that reads, splits, and modifies PDF documents directly inside your web browser." },
                  { title: "Web APIs", desc: "We utilize modern ArrayBuffer and Blob features to handle massive files entirely in your device's memory (RAM)." }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-4 md:p-5 rounded-2xl backdrop-blur-sm">
                    <h4 className="text-indigo-300 font-bold mb-1.5 md:mb-2 text-sm md:text-base">{item.title}</h4>
                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="my-12 md:my-16 not-prose">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-8 md:mb-10 text-center">Loved by Students & Professionals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 relative">
                <div className="absolute top-4 right-4 md:top-6 md:right-6 text-indigo-100"><Layers className="w-8 h-8 md:w-10 md:h-10" /></div>
                <div className="flex text-amber-400 mb-3 md:mb-4 gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" size={16} className="md:w-[18px] md:h-[18px]" />)}
                </div>
                <p className="text-slate-700 italic text-sm md:text-base leading-relaxed mb-5 md:mb-6">"The page extraction feature is a lifesaver. I was able to pull specific pages from my massive textbook PDF and merge them with my class notes in seconds without uploading anything!"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs md:text-sm">AS</div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs md:text-sm">Ananya S.</p>
                    <p className="text-slate-500 text-[10px] md:text-xs">CS Student</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 relative">
                <div className="absolute top-4 right-4 md:top-6 md:right-6 text-emerald-100"><ShieldCheck className="w-8 h-8 md:w-10 md:h-10" /></div>
                <div className="flex text-amber-400 mb-3 md:mb-4 gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" size={16} className="md:w-[18px] md:h-[18px]" />)}
                </div>
                <p className="text-slate-700 italic text-sm md:text-base leading-relaxed mb-5 md:mb-6">"Finally, a tool that lets me merge confidential legal contracts without worrying about cloud server data breaches. Genz PDF is incredibly fast and secure."</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs md:text-sm">RM</div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs md:text-sm">Rahul M.</p>
                    <p className="text-slate-500 text-[10px] md:text-xs">Corporate Lawyer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-10 md:my-14 not-prose"></div>

          {/* MEGA FAQ SECTION */}
          <h2 id="faq" className="text-2xl md:text-3xl font-black text-slate-900 mt-12 md:mt-16 mb-8 md:mb-10 flex items-center gap-3 scroll-mt-24 not-prose">
            <div className="p-2 md:p-2.5 bg-rose-100 text-rose-600 rounded-xl"><HelpCircle className="w-5 h-5 md:w-6 md:h-6" /></div> 
            Ultimate FAQ Guide ({currentYear})
          </h2>
          
          <div className="space-y-3 md:space-y-4 not-prose">
            {[
              { q: `Why is adding pages to PDFs still useful in ${currentYear}?`, a: `Even in ${currentYear}, as digital documentation evolves, combining contracts, assignment portfolios, and financial reports into a single, cohesive PDF remains the gold standard for professional sharing, legal compliance, and archiving.` },
              { q: "Can I add pages to a PDF from another document?", a: "Yes! Genz PDF's unique Advanced Page Transfer visual editor allows you to extract specific pages from a source document and precisely insert them exactly where you want in your target PDF." },
              { q: "How do I add a blank page to a PDF online?", a: "With Genz PDF, you can easily drag and drop a blank PDF template file into your upload queue, reorder it to your preferred position, and hit merge to insert blank spaces precisely where you need them." },
              { q: "Is Genz PDF free to use?", a: "Absolutely. Genz PDF is 100% free forever. There are no premium subscriptions, no annoying paywalls, no daily limits, and no hidden fees." },
              { q: "Does Genz PDF protect my files when adding pages?", a: "Yes. We use a strict 100% Client-Side Architecture. Your files are processed entirely within your device's RAM and are never uploaded to our servers, making data breaches impossible." },
              { q: "Can I use Genz PDF if I'm in Europe or Latin America?", a: "Yes, Genz PDF is accessible globally. Since we don't collect, upload, or process your files on external servers, we are fully compliant with GDPR and other international privacy laws by default." },
              { q: "What's the best way to merge two PDFs and add pages?", a: "Simply drag and drop your two PDFs into our upload zone, use the drag handles to reorder them if necessary, and click the big 'Merge' button. If you need specific pages swapped, use our 'Set Target' and 'Edit Pages' tools." },
              { q: "Can I add pages to a PDF from my phone?", a: "Yes! Genz PDF is fully responsive and works flawlessly on iOS (iPhone/iPad) and Android web browsers without needing to download any cumbersome apps." },
              { q: "Does Genz PDF work offline?", a: "Because Genz PDF runs entirely in your browser using JavaScript, once the website initially loads, the actual merging and editing process happens locally. It does not require an active internet connection to process the files." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200/80 p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group cursor-default">
                <h4 className="font-bold text-slate-800 text-base md:text-lg mb-2 group-hover:text-indigo-600 transition-colors flex justify-between items-center">
                  {faq.q}
                </h4>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed m-0">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* Social Media Updates Section */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm mt-10 md:mt-12 not-prose">
            <h4 className="font-black text-indigo-900 text-lg md:text-xl mb-2 md:mb-3">Stay Updated with Genz PDF</h4>
            <p className="text-indigo-800/80 text-sm md:text-base leading-relaxed mb-5 md:mb-6">Follow our official channels to get the latest updates, tutorials, and new tool announcements:</p>
            
            <div className="flex flex-wrap gap-3 md:gap-4">
              <a href="https://www.youtube.com/channel/UCBV_lAS0ElDQv6Wu8kz5G8A" target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[130px] justify-center flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-100 rounded-xl shadow-sm hover:shadow transition-all text-xs md:text-sm font-bold no-underline group">
                <Youtube size={16} className="md:w-[18px] md:h-[18px] group-hover:scale-110 transition-transform" /> YouTube
              </a>
              <a href="https://instagram.com/genzpdftool" target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[130px] justify-center flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-pink-50 text-pink-600 border border-pink-100 rounded-xl shadow-sm hover:shadow transition-all text-xs md:text-sm font-bold no-underline group">
                <Instagram size={16} className="md:w-[18px] md:h-[18px] group-hover:scale-110 transition-transform" /> Instagram
              </a>
              <a href="https://x.com/genzpdftool?s=20" target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[130px] justify-center flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl shadow-sm hover:shadow transition-all text-xs md:text-sm font-bold no-underline group">
                <Twitter size={16} className="md:w-[18px] md:h-[18px] group-hover:scale-110 transition-transform" /> Twitter
              </a>
              <a href="https://www.facebook.com/share/v/1AuVepXHUQ/" target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[130px] justify-center flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-blue-50 text-blue-600 border border-blue-100 rounded-xl shadow-sm hover:shadow transition-all text-xs md:text-sm font-bold no-underline group">
                <Facebook size={16} className="md:w-[18px] md:h-[18px] group-hover:scale-110 transition-transform" /> Facebook
              </a>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-10 md:my-14 not-prose"></div>

          {/* Use Cases Section */}
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6 md:mb-8 not-prose text-center">
            Who Uses Genz PDF Merge?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16 not-prose">
            <div className="bg-indigo-50/50 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-indigo-100 hover:bg-indigo-50 transition-colors">
              <h4 className="font-black text-slate-900 mb-2 md:mb-3 text-base md:text-lg">🎓 For Students</h4>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">Combine lecture slides, assignment pages, and research papers into a single organized PDF before submission.</p>
            </div>
            <div className="bg-emerald-50/50 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-emerald-100 hover:bg-emerald-50 transition-colors">
              <h4 className="font-black text-slate-900 mb-2 md:mb-3 text-base md:text-lg">💼 For Professionals</h4>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">Stitch together monthly invoices, business reports, and portfolios into neat, shareable documents.</p>
            </div>
            <div className="bg-blue-50/50 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-blue-100 hover:bg-blue-50 transition-colors sm:col-span-2 md:col-span-1">
              <h4 className="font-black text-slate-900 mb-2 md:mb-3 text-base md:text-lg">⚖️ For Legal & Finance</h4>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">Handle highly sensitive, confidential contracts safely. Since it's client-side, your files never touch a server.</p>
            </div>
          </div>

          {/* Cross-Platform Compatibility */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-xl my-12 md:my-16 relative overflow-hidden not-prose">
            <div className="relative z-10 max-w-2xl">
              <h3 className="text-2xl md:text-3xl font-black mb-3 md:mb-4 tracking-tight">Merge PDFs on Any Device</h3>
              <p className="text-indigo-100/80 text-sm md:text-lg leading-relaxed">
                Whether you are on a Windows PC, Mac, Android phone, or iPhone, Genz PDF works flawlessly directly in your browser. <strong className="text-white">No apps to install. No extensions required.</strong>
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-5 translate-y-5 md:translate-x-10 md:translate-y-10">
              <Zap className="w-32 h-32 md:w-48 md:h-48" />
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 md:my-16 not-prose"></div>

          {/* 🔗 FULL INTERNAL LINKING SECTION */}
          <h2 id="more-tools" className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 md:mb-4 scroll-mt-24 not-prose text-center">
            Explore More Free PDF Tools
          </h2>
          <p className="text-center text-slate-600 mb-8 md:mb-10 text-sm md:text-lg not-prose px-2">Genz PDF offers a complete suite of professional, offline tools.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-12 md:mb-16 not-prose">
            {[
              { href: "/split", icon: <Scissors size={20} className="md:w-6 md:h-6" />, title: "Split PDF", desc: "Extract or remove specific pages.", color: "indigo" },
              { href: "/compress", icon: <Minimize2 size={20} className="md:w-6 md:h-6" />, title: "Compress PDF", desc: "Reduce file size instantly.", color: "emerald" },
              { href: "/protect", icon: <Lock size={20} className="md:w-6 md:h-6" />, title: "Protect PDF", desc: "Add secure passwords.", color: "rose" },
              { href: "/unlock", icon: <Unlock size={20} className="md:w-6 md:h-6" />, title: "Unlock PDF", desc: "Remove PDF passwords.", color: "amber" },
              { href: "/signature", icon: <PenTool size={20} className="md:w-6 md:h-6" />, title: "Sign PDF", desc: "Add your e-signature securely.", color: "blue" },
              { href: "/convert", icon: <ArrowRightLeft size={20} className="md:w-6 md:h-6" />, title: "Convert PDF", desc: "Convert PDF to Word, JPG, etc.", color: "fuchsia" }
            ].map((tool, idx) => (
              <a key={idx} href={tool.href} className={`flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-2xl bg-white border border-slate-200/60 hover:border-${tool.color}-400 hover:ring-4 hover:ring-${tool.color}-50 shadow-sm hover:shadow-lg transition-all group no-underline`}>
                <div className={`p-3 md:p-3.5 bg-${tool.color}-50 rounded-xl group-hover:bg-${tool.color}-500 transition-colors flex-shrink-0`}>
                  {React.cloneElement(tool.icon, { className: `text-${tool.color}-600 group-hover:text-white transition-colors` })}
                </div>
                <div>
                  <h4 className={`m-0 font-bold text-slate-900 group-hover:text-${tool.color}-600 leading-tight text-sm md:text-base`}>{tool.title}</h4>
                  <p className="m-0 text-[11px] md:text-xs text-slate-500 mt-1 md:mt-1.5 font-medium">{tool.desc}</p>
                </div>
              </a>
            ))}
            
            {/* Featured Tool (Resize) spans full width on mobile/tablet */}
            <a href="/resize" className="flex items-center justify-center gap-3 md:gap-4 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100 hover:border-cyan-400 hover:ring-4 hover:ring-cyan-50 shadow-sm hover:shadow-lg transition-all group no-underline sm:col-span-2 lg:col-span-3 lg:max-w-md mx-auto w-full">
              <div className="p-3 md:p-3.5 bg-white rounded-xl group-hover:bg-cyan-500 shadow-sm transition-colors flex-shrink-0">
                <Scaling className="text-cyan-600 group-hover:text-white transition-colors w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="text-left sm:text-center">
                <h4 className="m-0 font-bold text-slate-900 group-hover:text-cyan-600 leading-tight text-sm md:text-base">Resize Image</h4>
                <p className="m-0 text-[11px] md:text-xs text-slate-600 mt-1 md:mt-1.5 font-medium">Change image dimensions & KB accurately.</p>
              </div>
            </a>
          </div>

          {/* Final CTA Button */}
          <div className="text-center my-14 md:my-20 not-prose relative">
            <div className="absolute inset-0 bg-indigo-500/5 blur-2xl md:blur-3xl rounded-full w-48 h-48 md:w-64 md:h-64 mx-auto -z-10 animate-pulse"></div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-5 md:mb-6 tracking-tight">Ready to experience the best?</h3>
            <a 
              href="/merge" 
              className="inline-flex items-center justify-center gap-2 md:gap-3 w-full sm:w-auto px-6 md:px-10 py-4 md:py-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-base md:text-lg rounded-xl md:rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-300 no-underline group"
            >
              <FileStack className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform duration-300" />
              Go to Merge PDF Tool
            </a>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-10 md:my-14 not-prose"></div>

          {/* 🆕 💡 FEEDBACK SECTION (Was this helpful?) */}
          <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-100 mb-10 md:mb-12 not-prose flex flex-col items-center text-center transform transition-all duration-500 hover:shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {!feedback ? (
              <div className="relative z-10 w-full animate-in fade-in duration-500">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-1 md:mb-2">Was this guide helpful?</h3>
                <p className="text-slate-500 mb-6 md:mb-8 text-xs md:text-base">Let us know so we can improve our content for you.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
                  <button 
                    onClick={() => setFeedback('liked')}
                    className="flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-3.5 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border-2 border-slate-100 hover:border-emerald-200 rounded-xl md:rounded-2xl font-bold text-sm md:text-base transition-all hover:-translate-y-1 active:scale-95 shadow-sm hover:shadow-emerald-100/50 w-full sm:w-auto group/btn"
                  >
                    <ThumbsUp className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover/btn:scale-125 group-hover/btn:-rotate-12 group-hover/btn:text-emerald-500" /> Yes, absolutely!
                  </button>
                  <button 
                    onClick={() => setFeedback('disliked')}
                    className="flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-3.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border-2 border-slate-100 hover:border-rose-200 rounded-xl md:rounded-2xl font-bold text-sm md:text-base transition-all hover:-translate-y-1 active:scale-95 shadow-sm hover:shadow-rose-100/50 w-full sm:w-auto group/btn"
                  >
                    <ThumbsDown className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover/btn:scale-125 group-hover/btn:rotate-12 group-hover/btn:text-rose-500" /> Not really
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative z-10 w-full animate-in zoom-in-95 duration-500 flex flex-col items-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4 md:mb-5 shadow-inner border border-emerald-100">
                  <CheckCircle className="w-6 h-6 md:w-8 md:h-8 animate-bounce" style={{ animationIterationCount: 1.5 }} />
                </div>
                <h3 className="text-lg md:text-2xl font-black text-slate-900 mb-2 md:mb-3">Thank you for your feedback! 🎉</h3>
                <p className="text-slate-500 text-xs md:text-base max-w-md mx-auto leading-relaxed px-2">
                  {feedback === 'liked' 
                    ? "We're thrilled you found this helpful! Keep exploring and don't forget to share it with your friends." 
                    : "We're sorry this didn't fully answer your questions. We'll use your feedback to make it better!"}
                </p>
              </div>
            )}
          </div>

          {/* 📤 SHARE THIS GUIDE */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 md:gap-6 bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-100 mb-10 md:mb-12 not-prose">
            <div className="flex items-center gap-2 md:gap-3 font-black text-slate-800 text-base md:text-lg m-0">
              <div className="p-1.5 md:p-2 bg-indigo-50 rounded-lg text-indigo-500"><Share2 className="w-5 h-5 md:w-6 md:h-6" /></div> 
              Share this Ultimate Guide
            </div>
            <div className="flex gap-3 md:gap-4">
              <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener noreferrer" className="p-2.5 md:p-3 bg-slate-50 text-slate-600 hover:bg-[#1DA1F2] hover:text-white rounded-xl shadow-sm transition-all hover:-translate-y-1" title="Share on Twitter"><Twitter className="w-4 h-4 md:w-5 md:h-5"/></a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="p-2.5 md:p-3 bg-slate-50 text-slate-600 hover:bg-[#0A66C2] hover:text-white rounded-xl shadow-sm transition-all hover:-translate-y-1" title="Share on LinkedIn"><Linkedin className="w-4 h-4 md:w-5 md:h-5"/></a>
              <a href={`https://api.whatsapp.com/send?text=${shareTitle} ${shareUrl}`} target="_blank" rel="noopener noreferrer" className="p-2.5 md:p-3 bg-slate-50 text-slate-600 hover:bg-[#25D366] hover:text-white rounded-xl shadow-sm transition-all hover:-translate-y-1" title="Share on WhatsApp">
                <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </a>
            </div>
          </div>

          {/* ✍️ AUTHOR BIO BOX (E-E-A-T) */}
          <div className="relative bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8 mt-12 md:mt-16 not-prose overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-200 rounded-2xl md:rounded-3xl rotate-6 group-hover:rotate-12 transition-transform"></div>
              <img src="/logo.png" alt="Pintu and Raushan" className="relative w-20 h-20 md:w-24 md:h-24 bg-white p-2 md:p-3 rounded-2xl md:rounded-3xl shadow-md border border-slate-100 object-contain flex-shrink-0 z-10" onError={(e) => e.target.style.display='none'} />
            </div>

            <div className="flex-1 relative z-10 text-center sm:text-left">
              <h4 className="font-black text-xl md:text-2xl text-slate-900 mb-1.5 md:mb-2 flex items-center gap-1.5 md:gap-2 justify-center sm:justify-start">
                Pintu And Raushan <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-blue-500 fill-blue-500/20" />
              </h4>
              <p className="text-[10px] md:text-xs font-black text-indigo-500 uppercase tracking-widest mb-3 md:mb-4 bg-indigo-100 inline-block px-2.5 py-1 rounded-full">Founders & Developers</p>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-5 md:mb-6">
                Pintu And Raushan are the creators behind Genz PDF. With a mission to provide fast, unlimited, and 100% secure offline PDF tools, they built Genz PDF so users never have to upload their private documents to sketchy cloud servers again.
              </p>
              
              <div className="flex justify-center sm:justify-start gap-2.5 md:gap-3">
                <a href="https://www.linkedin.com/in/pintu-chauhan-ctuap/" target="_blank" rel="noopener noreferrer" className="p-2 md:p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-[#0A66C2] hover:border-[#0A66C2] rounded-lg md:rounded-xl transition-all hover:shadow-sm"><Linkedin className="w-4 h-4 md:w-[18px] md:h-[18px]" /></a>
                <a href="https://www.linkedin.com/in/raushan-kumar-0b5340373/" target="_blank" rel="noopener noreferrer" className="p-2 md:p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-[#0A66C2] hover:border-[#0A66C2] rounded-lg md:rounded-xl transition-all hover:shadow-sm"><Linkedin className="w-4 h-4 md:w-[18px] md:h-[18px]" /></a>
                <a href="https://x.com/genzpdftool?s=20" target="_blank" rel="noopener noreferrer" className="p-2 md:p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 rounded-lg md:rounded-xl transition-all hover:shadow-sm"><Twitter className="w-4 h-4 md:w-[18px] md:h-[18px]" /></a>
              </div>
            </div>
          </div>

        </div>
      </article>
    </div>
  );
};

export default MergePdfBlog;
