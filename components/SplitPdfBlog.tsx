import React, { useState } from 'react';
import { 
  ShieldCheck, Zap, ServerOff, Scissors, Settings2, Download, Layers, 
  PlayCircle, Star, Minimize2, Lock, Unlock, PenTool, Scaling, ArrowRightLeft,
  Youtube, Instagram, Twitter, Facebook, HelpCircle, Clock, Calendar, Share2, Linkedin,
  ChevronRight, Lightbulb, ThumbsUp, ThumbsDown, CheckCircle, FilePlus, MousePointerClick,
  FileText, Image as ImageIcon, Move, CheckSquare, Eye, Undo2, Hash, Timer, AlertTriangle,
  Archive, Copy, Keyboard, ArrowDownAZ, RotateCw, UploadCloud
} from 'lucide-react';

export const SplitPdfBlog = () => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const shareUrl = encodeURIComponent('https://genzpdf.com/blog/split-pdf');
  const shareTitle = encodeURIComponent('Learn how to easily split, extract, and edit PDF pages offline with this visual guide! ✂️📄');
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-rose-200 selection:text-rose-900">
      {/* 🤖 SEO SCHEMA MARKUP FOR GOOGLE RICH SNIPPETS */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "HowTo",
              "name": "How to Split and Extract PDF Pages Visually",
              "description": "Step-by-step guide on how to visually extract pages, split PDFs by size or count, and export them securely without uploading to any server.",
              "step": [
                {
                  "@type": "HowToStep",
                  "name": "Upload Files",
                  "text": "Drag and drop your PDF, DOCX, or Image files into the secure visual editor."
                },
                {
                  "@type": "HowToStep",
                  "name": "Select Pages",
                  "text": "Click to select pages, use Shift+Click for ranges, or use smart filters like Odd/Even and Landscape/Portrait."
                },
                {
                  "@type": "HowToStep",
                  "name": "Export & Download",
                  "text": "Choose to export as a new PDF, individual JPG/PNG images, or split the document into bulk chunks via ZIP."
                }
              ]
            },
            {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How can I extract specific pages from a PDF for free?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Using Genz PDF Splitter, you can visually select the exact pages you need from the thumbnail grid and click 'Export as PDF'. It is 100% free and offline."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I split a large PDF by MB size?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Genz PDF has an advanced 'Split by Max Size (MB)' feature. Just enter your target size (e.g., 10MB), and the tool will automatically split your heavy PDF into smaller chunks inside a ZIP file."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is it safe to split confidential PDFs online?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, it is completely safe with Genz PDF because we use a 100% Client-Side Architecture. Your confidential documents are processed in your browser's RAM and never uploaded to our servers."
                  }
                }
              ]
            }
          ]
        })}
      </script>

      {/* Hero Background */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-rose-100/60 to-transparent pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 md:w-96 md:h-96 bg-orange-200/40 rounded-full blur-3xl pointer-events-none z-0 animate-pulse" style={{ animationDuration: '4s' }}></div>

      <article className="relative z-10 max-w-4xl mx-auto py-10 md:py-16 px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center justify-center gap-2 text-xs md:text-sm text-slate-500 mb-8 md:mb-10 font-medium">
          <div className="flex items-center gap-2 bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-sm border border-slate-200/60 overflow-hidden whitespace-nowrap">
            <a href="/" className="hover:text-rose-600 transition-colors flex items-center gap-1">Home</a>
            <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
            <span className="text-slate-400">Blog</span>
            <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
            <span className="text-rose-700 font-bold bg-rose-50 px-2 md:px-3 py-1 rounded-full border border-rose-100">Split PDF Guide</span>
          </div>
        </nav>

        {/* Blog Header */}
        <header className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 bg-gradient-to-r from-rose-50 to-orange-50 text-rose-700 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6 border border-rose-200/50 shadow-sm">
            <Scissors size={14} className="text-rose-500" /> Ultimate Guide & Tech Deep Dive
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-4 md:mb-6 leading-tight">
            How to <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-orange-500 to-red-500">Split & Extract PDF Pages</span> Like a Pro
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-6 md:mb-8 leading-relaxed px-2">
            Discover how to visually extract specific pages, rearrange them, split massive PDFs by size, and do it all 100% securely offline in {currentYear}.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm font-semibold text-slate-500 bg-white inline-flex mx-auto px-4 md:px-6 py-2.5 md:py-3 rounded-2xl shadow-sm border border-slate-100">
            <span className="flex items-center gap-1.5 md:gap-2"><Calendar size={14} className="text-slate-400" /> {currentYear}</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5 md:gap-2"><Clock size={14} className="text-slate-400" /> 6 min read</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5 md:gap-2 text-rose-900">
              <img src="/logo.png" alt="Genz PDF" className="w-4 h-4 md:w-5 md:h-5 object-contain" /> 
              Genz PDF Team
            </span>
          </div>
        </header>

        {/* Table of Contents */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 mb-12 md:mb-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-rose-500 to-orange-500 rounded-l-3xl"></div>
          <h3 className="font-bold text-slate-900 mb-4 md:mb-5 uppercase tracking-widest text-xs md:text-sm flex items-center gap-2">
            <Layers size={18} className="text-rose-500" /> Table of Contents
          </h3>
          <ul className="space-y-3 text-slate-600 font-medium text-sm md:text-base ml-2">
            {[
              { id: "exclusive-features", text: "1. Exclusive Features of Genz PDF Splitter" },
              { id: "step-by-step-guide", text: "2. Step-by-Step Guide: How Our Tool Works" },
              { id: "comparison", text: "3. Why Genz PDF is Better (Comparison)" },
              { id: "faq", text: `4. Frequently Asked Questions (${currentYear} Guide)` },
              { id: "more-tools", text: "5. Explore More Free PDF Tools" }
            ].map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="hover:text-rose-600 transition-colors flex items-center gap-2 group-hover:translate-x-1 duration-300">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-slate-300 group-hover:bg-rose-400"></span>
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className="prose prose-slate md:prose-lg prose-rose prose-headings:font-bold prose-headings:tracking-tight prose-p:text-slate-600 prose-a:text-rose-600 prose-a:no-underline hover:prose-a:underline max-w-none text-slate-700">
          
          <h2 id="exclusive-features" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mb-6 md:mb-8 flex items-center gap-3 scroll-mt-24 not-prose">
            <div className="p-2 md:p-2.5 bg-rose-100 text-rose-600 rounded-xl"><Settings2 className="w-5 h-5 md:w-6 md:h-6" /></div> 
            Exclusive Features of Genz PDF Splitter
          </h2>
          <p className="text-base md:text-lg mb-6 md:mb-8">Unlike basic PDF tools that ask you to blindly type page numbers, Genz PDF gives you a powerful visual workspace. Here is what makes our tool industry-leading:</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-5 mb-10 md:mb-14 not-prose">
            
            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 md:p-3 bg-blue-50 rounded-xl flex-shrink-0"><MousePointerClick className="text-blue-600 w-5 h-5 md:w-6 md:h-6" /></div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">Smart Visual Selection</strong>
                <span className="text-xs md:text-sm text-slate-500">See thumbnails of every page. Visually select what you want to keep or delete instantly.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 md:p-3 bg-emerald-50 rounded-xl flex-shrink-0"><UploadCloud className="text-emerald-600 w-5 h-5 md:w-6 md:h-6" /></div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">Multi-Format Batch Upload</strong>
                <span className="text-xs md:text-sm text-slate-500">Select and upload multiple PDFs, Word documents (DOCX), and Images simultaneously into one unified workspace.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 md:p-3 bg-pink-50 rounded-xl flex-shrink-0"><Move className="text-pink-600 w-5 h-5 md:w-6 md:h-6" /></div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">Drag & Drop Reordering</strong>
                <span className="text-xs md:text-sm text-slate-500">Easily drag and arrange pages into the perfect sequence before exporting. A lifesaver for scanned files!</span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 md:p-3 bg-indigo-50 rounded-xl flex-shrink-0"><RotateCw className="text-indigo-600 w-5 h-5 md:w-6 md:h-6" /></div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">Universal Page Rotation</strong>
                <span className="text-xs md:text-sm text-slate-500">Easily rotate individual pages from PDFs, DOCX files, or Images to fix orientation issues before exporting.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 md:p-3 bg-cyan-50 rounded-xl flex-shrink-0"><CheckSquare className="text-cyan-600 w-5 h-5 md:w-6 md:h-6" /></div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">Advanced Selection Filters</strong>
                <span className="text-xs md:text-sm text-slate-500">1-click 'Select All', 'Odd/Even' filters, 'Invert Selection', and Shift+Click for massive ranges.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 md:p-3 bg-amber-50 rounded-xl flex-shrink-0"><Eye className="text-amber-600 w-5 h-5 md:w-6 md:h-6" /></div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">Full-Screen Page Preview</strong>
                <span className="text-xs md:text-sm text-slate-500">Not sure what a page says? Click the eye icon to read contents clearly in a full-screen lightbox modal.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 md:p-3 bg-rose-50 rounded-xl flex-shrink-0"><Undo2 className="text-rose-600 w-5 h-5 md:w-6 md:h-6" /></div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">Undo & Redo System</strong>
                <span className="text-xs md:text-sm text-slate-500">Accidentally deleted a vital page? Use the undo button or Ctrl+Z to reverse your last actions instantly.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 md:p-3 bg-indigo-50 rounded-xl flex-shrink-0"><Hash className="text-indigo-600 w-5 h-5 md:w-6 md:h-6" /></div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">Split by Range Input</strong>
                <span className="text-xs md:text-sm text-slate-500">Prefer typing? Enter custom ranges like "1-5, 8, 12" in the text box to automatically highlight specific pages.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 md:p-3 bg-teal-50 rounded-xl flex-shrink-0"><Timer className="text-teal-600 w-5 h-5 md:w-6 md:h-6" /></div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">Live Processing Progress</strong>
                <span className="text-xs md:text-sm text-slate-500">No more frozen screens. Watch real-time loading progress as your files render and export smoothly.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 md:p-3 bg-red-50 rounded-xl flex-shrink-0"><AlertTriangle className="text-red-600 w-5 h-5 md:w-6 md:h-6" /></div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">Smart Performance Saver</strong>
                <span className="text-xs md:text-sm text-slate-500">Auto-detects massive files (50+ MB) and offers a "Fast Mode" to prevent your browser from lagging or crashing.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 md:p-3 bg-emerald-50 rounded-xl flex-shrink-0"><ShieldCheck className="text-emerald-600 w-5 h-5 md:w-6 md:h-6" /></div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">100% Client-Side Privacy</strong>
                <span className="text-xs md:text-sm text-slate-500">Your files are sliced in your browser's RAM. Zero server uploads. Maximum security.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 md:p-3 bg-purple-50 rounded-xl flex-shrink-0"><PenTool className="text-purple-600 w-5 h-5 md:w-6 md:h-6" /></div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">Watermarks & Page Numbers</strong>
                <span className="text-xs md:text-sm text-slate-500">Easily stamp custom watermarks and page numbers on your extracted files.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 md:p-3 bg-fuchsia-50 rounded-xl flex-shrink-0"><Archive className="text-fuchsia-600 w-5 h-5 md:w-6 md:h-6" /></div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">Separate PDFs (ZIP Download) 🔥</strong>
                <span className="text-xs md:text-sm text-slate-500">Extract each selected page as a separate PDF and download them all at once in a .zip folder. Just like iLovePDF!</span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 md:p-3 bg-slate-100 rounded-xl flex-shrink-0"><Layers className="text-slate-600 w-5 h-5 md:w-6 md:h-6" /></div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">Split in Fixed Ranges (Bulk Chunker)</strong>
                <span className="text-xs md:text-sm text-slate-500">Automatically break down a 500-page PDF into equal parts (e.g., every 50 pages) and download them together.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 md:p-3 bg-violet-50 rounded-xl flex-shrink-0"><Scaling className="text-violet-600 w-5 h-5 md:w-6 md:h-6" /></div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">Landscape vs Portrait Selection 🚀</strong>
                <span className="text-xs md:text-sm text-slate-500">Automatically detect all sideways (landscape) pages in scanned PDFs and select them in one click to rotate.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 md:p-3 bg-lime-50 rounded-xl flex-shrink-0"><FilePlus className="text-lime-600 w-5 h-5 md:w-6 md:h-6" /></div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">Duplicate & Blank Pages</strong>
                <span className="text-xs md:text-sm text-slate-500">Insert a blank page in the middle of the grid for printing alignment, or instantly duplicate any existing page.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 md:p-3 bg-sky-50 rounded-xl flex-shrink-0"><Keyboard className="text-sky-600 w-5 h-5 md:w-6 md:h-6" /></div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">Native Keyboard Shortcuts ⌨️</strong>
                <span className="text-xs md:text-sm text-slate-500">Get a desktop software feel! Use the Delete key to remove pages, Ctrl+A to select all, and Esc to deselect.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 md:p-3 bg-orange-50 rounded-xl flex-shrink-0"><ArrowDownAZ className="text-orange-600 w-5 h-5 md:w-6 md:h-6" /></div>
              <div>
                <strong className="block text-slate-900 text-sm md:text-base mb-1">Auto-Sort (A-Z) Magic 🔀</strong>
                <span className="text-xs md:text-sm text-slate-500">Uploaded dozens of images? Click once to automatically arrange them from A to Z based on their filenames.</span>
              </div>
            </div>

          </div>

          <h2 id="step-by-step-guide" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mb-6 md:mb-8 flex items-center gap-3 scroll-mt-24 not-prose">
            <div className="p-2 md:p-2.5 bg-indigo-100 text-indigo-600 rounded-xl"><ImageIcon className="w-5 h-5 md:w-6 md:h-6" /></div> 
            Step-by-Step Guide: How Our Tool Works
          </h2>
          
          <div className="space-y-4 my-6 md:my-8 not-prose">
            {[
              { 
                step: 1, 
                title: "Smart Batch Upload", 
                content: (
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-sm md:text-base mt-2">
                    <li><strong>Visit:</strong> Go to GenZPDF.com and select the "Split PDF" tool.</li>
                    <li><strong>Select Files:</strong> Drag and drop multiple PDFs, Word documents (DOCX), and Images (JPG/PNG) simultaneously.</li>
                    <li><strong>Workspace:</strong> All your pages will instantly appear as visual thumbnails in a unified grid workspace.</li>
                  </ul>
                )
              },
              { 
                step: 2, 
                title: "Manage and Organize Pages", 
                content: (
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-sm md:text-base mt-2">
                    <li><strong>Reorder (Drag & Drop):</strong> Click and drag any page to move it to your desired sequence.</li>
                    <li><strong>Rotate:</strong> Click the Rotate icon on any sideways page to fix its orientation. <em>Pro Tip: Use the 'Landscape' filter to select and rotate all sideways pages at once!</em></li>
                    <li><strong>Preview:</strong> Click the Eye icon to view a readable, full-screen preview of any page.</li>
                  </ul>
                )
              },
              { 
                step: 3, 
                title: "The Magic of Selection", 
                content: (
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-sm md:text-base mt-2">
                    <li><strong>Manual Click:</strong> Simply click on individual pages to select them.</li>
                    <li><strong>Range Input:</strong> Type ranges like "1-5, 10, 15-20" in the box to automatically highlight those specific pages.</li>
                    <li><strong>Smart Filters:</strong> Use toolbar buttons to quickly 'Select All', pick 'Odd Pages', or 'Even Pages'.</li>
                    <li><strong>Keyboard Shortcuts:</strong> Use <code>Ctrl + A</code> to select all and <code>Ctrl + Z</code> (Undo) to fix mistakes easily.</li>
                  </ul>
                )
              },
              { 
                step: 4, 
                title: "Add Special Features (Optional)", 
                content: (
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-sm md:text-base mt-2">
                    <li><strong>Watermarks & Numbers:</strong> Easily stamp custom text or page numbers onto your extracted pages using the options below the grid.</li>
                    <li><strong>Insert Blank Page:</strong> Click the 'Add Blank' button to insert an empty page into the grid, which is perfect for fixing printing alignments.</li>
                  </ul>
                )
              },
              { 
                step: 5, 
                title: "Choose Your Output Mode", 
                content: (
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-sm md:text-base mt-2">
                    <li><strong>Extract All into 1 PDF:</strong> Merge all your selected pages into a single new document.</li>
                    <li><strong>Separate PDFs (ZIP Download):</strong> Generate an individual PDF file for every selected page, delivered in one ZIP folder.</li>
                    <li><strong>Bulk Chunker (Fixed Range):</strong> Split a massive document into equal parts (e.g., choose to split every 10 pages).</li>
                  </ul>
                )
              },
              { 
                step: 6, 
                title: "Instant Export", 
                content: (
                  <p className="text-slate-600 text-sm md:text-base mt-2 leading-relaxed">
                    Click the <strong>Export/Download</strong> button. Because everything is processed locally in your device's RAM, your download starts in <strong>0 seconds</strong>. Say goodbye to annoying "Uploading..." or "Processing..." wait times!
                  </p>
                )
              }
            ].map((item) => (
              <div key={item.step} className="flex gap-4 md:gap-5 items-start bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-md">
                  {item.step}
                </div>
                <div className="pt-1 md:pt-1.5 flex-1">
                  <strong className="text-slate-900 text-base md:text-lg block mb-1">{item.title}</strong>
                  {item.content}
                </div>
              </div>
            ))}
          </div>

          <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/60 p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm my-10 md:my-12 overflow-hidden not-prose group">
            <div className="flex flex-col sm:flex-row gap-4 md:gap-5 relative z-10">
              <div className="flex-shrink-0 self-start p-3 bg-blue-100 rounded-2xl text-blue-600">
                <Lightbulb size={24} className="animate-pulse md:w-7 md:h-7" />
              </div>
              <div>
                <h4 className="text-blue-900 font-bold text-base md:text-lg mb-1 md:mb-2">Pro Tip: Smart Dropdown</h4>
                <p className="text-blue-800/90 text-sm md:text-base leading-relaxed">
                  Click the <strong>'Select'</strong> dropdown in the top toolbar to automatically highlight all Odd pages, Even pages, or even filter by Landscape/Portrait orientations! This saves hours of manual clicking on 100+ page documents.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-10 md:my-14 not-prose"></div>

          <h2 id="comparison" className="text-2xl sm:text-3xl font-black text-slate-900 mb-8 md:mb-10 text-center scroll-mt-24 not-prose">
            Why Genz PDF is Better
          </h2>
          <div className="overflow-x-auto mb-12 md:mb-16 px-1 not-prose rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm">
            <table className="w-full text-left border-collapse min-w-[500px] md:min-w-[600px] bg-white">
              <thead>
                <tr>
                  <th className="p-4 md:p-5 font-bold text-slate-500 uppercase tracking-wider text-[10px] md:text-xs border-b border-slate-200 w-1/3">Feature</th>
                  <th className="p-4 md:p-5 font-black text-rose-600 bg-rose-50/80 border-x border-b border-rose-100 text-sm md:text-base text-center w-1/3 shadow-[inset_0_0_10px_rgba(0,0,0,0.02)]">
                    Genz PDF Splitter
                  </th>
                  <th className="p-4 md:p-5 font-bold text-slate-400 uppercase tracking-wider text-[10px] md:text-xs border-b border-slate-200 text-center w-1/3">Other Cloud Tools</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm md:text-base">
                {[
                  { feature: "Data Privacy & Speed", genz: "100% Offline, Zero upload wait time", bad: "Slow server uploads", highlight: true },
                  { feature: "File Size Limits", genz: "Unlimited (Based on your RAM)", bad: "Max 10MB - 50MB restrictions", highlight: false },
                  { feature: "Input Formats", genz: "Mix PDFs, DOCX, JPG & PNG together", bad: "Strictly PDF files only", highlight: true },
                  { feature: "Editing Flow", genz: "Unified Grid: Reorder, Rotate, Split", bad: "Blindly type page numbers", highlight: false },
                  { feature: "Smart Automations", genz: "1-Click Landscape, Odd/Even, Invert", bad: "Manual click one-by-one", highlight: true },
                  { feature: "Advanced Exporting", genz: "Separate PDFs (ZIP), Range (1-5, 8)", bad: "Basic single PDF export", highlight: false },
                  { feature: "Watermarks & Numbers", genz: "Free built-in stamping", bad: "Premium / Paid feature", highlight: true },
                  { feature: "Price", genz: "100% Free Forever", bad: "Paid Subscriptions required", highlight: false }
                ].map((row, idx) => (
                  <tr key={idx} className={row.highlight ? "bg-slate-50/50" : "bg-white"}>
                    <td className="p-4 md:p-5 border-b border-slate-100 font-semibold text-slate-700">{row.feature}</td>
                    <td className="p-4 md:p-5 border-b border-rose-100 text-emerald-600 font-bold bg-rose-50/50 border-x text-center flex flex-col sm:flex-row items-center justify-center gap-1.5 md:gap-2">
                       <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 flex-shrink-0" /> <span className="text-center sm:text-left">{row.genz}</span>
                    </td>
                    <td className="p-4 md:p-5 border-b border-slate-100 text-slate-500 text-center">{row.bad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-10 md:my-14 not-prose"></div>

          <h2 id="faq" className="text-2xl md:text-3xl font-black text-slate-900 mt-12 md:mt-16 mb-8 md:mb-10 flex items-center gap-3 scroll-mt-24 not-prose">
            <div className="p-2 md:p-2.5 bg-orange-100 text-orange-600 rounded-xl"><HelpCircle className="w-5 h-5 md:w-6 md:h-6" /></div> 
            Ultimate FAQ Guide ({currentYear})
          </h2>
          
          <div className="space-y-3 md:space-y-4 not-prose">
            {[
              { q: "How can I extract specific pages from a PDF for free?", a: "Using Genz PDF Splitter, simply drag your file in. Once the thumbnails load, click the pages you want to keep. Then, click 'Export' > 'Export as PDF'. It's 100% free and offline." },
              { q: "Can I split a large PDF by MB size?", a: "Yes! Open the Export dropdown and look for the 'Split by Max Size (MB)' section. Enter your target size (e.g., 10), and the engine will intelligently chunk your heavy PDF into smaller pieces inside a ZIP file." },
              { q: "Is it safe to split confidential PDFs online?", a: "With standard websites? No. But with Genz PDF? Yes. We use WebAssembly and JS to process your files locally on your own computer. Your data never leaves your device." },
              { q: "How do I split a PDF and save it as images?", a: "Load your PDF into our visual editor, select the pages, open the Export menu, and click 'Export as JPGs' or 'Export as PNGs'. The tool will download a ZIP file containing high-res images of your pages." },
              { q: "Why did my browser slow down while splitting?", a: "Because processing happens locally, massive files (e.g., 500+ pages) use your computer's RAM. If it's slow, toggle off the 'HD Mode' button in the top toolbar to switch to 'Fast Mode'." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200/80 p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                <h4 className="font-bold text-slate-800 text-base md:text-lg mb-2 group-hover:text-rose-600 transition-colors">
                  {faq.q}
                </h4>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed m-0">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* Final CTA Button */}
          <div className="text-center my-14 md:my-20 not-prose relative">
            <div className="absolute inset-0 bg-rose-500/5 blur-2xl md:blur-3xl rounded-full w-48 h-48 md:w-64 md:h-64 mx-auto -z-10 animate-pulse"></div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-5 md:mb-6 tracking-tight">Ready to slice your PDFs securely?</h3>
            <a 
              href="/split" 
              className="inline-flex items-center justify-center gap-2 md:gap-3 w-full sm:w-auto px-6 md:px-10 py-4 md:py-5 bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 text-white font-black text-base md:text-lg rounded-xl md:rounded-2xl shadow-xl shadow-rose-200 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-300 no-underline group"
            >
              <Scissors className="w-5 h-5 md:w-6 md:h-6 group-hover:-rotate-12 transition-transform duration-300" />
              Go to Split PDF Tool
            </a>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-10 md:my-14 not-prose"></div>

          {/* INTERNAL LINKING */}
          <h2 id="more-tools" className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 md:mb-4 scroll-mt-24 not-prose text-center">
            Explore More Free PDF Tools
          </h2>
          <p className="text-center text-slate-600 mb-8 md:mb-10 text-sm md:text-lg not-prose px-2">Genz PDF offers a complete suite of professional, offline tools.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-12 md:mb-16 not-prose">
            {[
              { href: "/merge", icon: <Layers size={20} className="md:w-6 md:h-6" />, title: "Merge PDF", desc: "Combine files easily.", color: "indigo" },
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
          </div>

          {/* Feedback Section */}
          <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-100 mb-10 md:mb-12 not-prose flex flex-col items-center text-center">
            {!feedback ? (
              <div className="w-full animate-in fade-in duration-500">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Was this guide helpful?</h3>
                <p className="text-slate-500 mb-6">Let us know so we can improve our content for you.</p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => setFeedback('liked')} className="px-6 py-3 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border-2 border-slate-100 hover:border-emerald-200 rounded-xl font-bold shadow-sm transition-all hover:-translate-y-1">👍 Yes</button>
                  <button onClick={() => setFeedback('disliked')} className="px-6 py-3 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border-2 border-slate-100 hover:border-rose-200 rounded-xl font-bold shadow-sm transition-all hover:-translate-y-1">👎 No</button>
                </div>
              </div>
            ) : (
              <div className="w-full animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Thank you! 🎉</h3>
                <p className="text-slate-500">We appreciate your feedback.</p>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default SplitPdfBlog;
