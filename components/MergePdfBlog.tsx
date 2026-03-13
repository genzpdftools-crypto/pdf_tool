import React from 'react';
import { 
  ShieldCheck, Zap, ServerOff, FileStack, Settings2, Download, Layers, 
  PlayCircle, Star, Scissors, Minimize2, Lock, Unlock, PenTool, Scaling, ArrowRightLeft,
  Youtube, Instagram, Twitter, Facebook, HelpCircle
} from 'lucide-react';

export const MergePdfBlog = () => {
  return (
    <>
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
                  "name": "Why is adding pages to PDFs still useful in 2026?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Even in 2026, as digital documentation evolves, combining contracts, assignment portfolios, and financial reports into a single, cohesive PDF remains the gold standard for professional sharing, legal compliance, and archiving."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I add pages to a PDF from another document?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Genz PDF's unique Advanced Page Transfer visual editor allows you to extract specific pages from a source document and precisely insert them anywhere into your target PDF."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do I add a blank page to a PDF online?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "With Genz PDF, you can easily drag and drop a blank PDF template file into your upload queue, reorder it to your preferred position, and hit merge to insert blank spaces precisely where you need them."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is Genz PDF free to use?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Absolutely. Genz PDF is 100% free forever. There are no premium subscriptions, no annoying paywalls, no daily limits, and no hidden fees."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Does Genz PDF protect my files when adding pages?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. We use a strict 100% Client-Side Architecture. Your files are processed entirely within your device's RAM and are never uploaded to our servers, making data breaches impossible."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I use Genz PDF if I'm in Europe or Latin America?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, Genz PDF is accessible globally. Since we don't collect, upload, or process your files on external servers, we are fully compliant with GDPR and other international privacy laws by default."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What's the best way to merge two PDFs and add pages?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Simply drag and drop your two PDFs into our upload zone, use the drag handles to reorder them if necessary, and click the big Merge button. If you need specific pages swapped, use our Set Target and Edit Pages tools."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I add pages to a PDF from my phone?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Genz PDF is fully responsive and works flawlessly on iOS (iPhone/iPad) and Android web browsers without needing to download any cumbersome apps."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Does Genz PDF work offline?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Because Genz PDF runs entirely in your browser using JavaScript, once the website initially loads, the actual merging and editing process happens locally. It does not require an active internet connection to process the files."
                  }
                }
              ]
            }
          ]
        })}
      </script>

      <article className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        {/* Blog Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-indigo-100">
            <Zap size={14} /> Ultimate Guide & Tech Deep Dive
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
            How to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Merge & Edit PDF Files</span> Like a Pro
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover how to easily combine files, transfer specific pages between PDFs, and how our 100% secure, offline-browser technology protects your data in 2026.
          </p>
        </header>

        {/* 📑 Table of Contents */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-12">
          <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Table of Contents</h3>
          <ul className="space-y-2 text-indigo-600 font-medium text-sm">
            <li><a href="#exclusive-features" className="hover:underline">1. Exclusive Features of Genz PDF Merge</a></li>
            <li><a href="#standard-merge" className="hover:underline">2. Method 1: The Standard Merge</a></li>
            <li><a href="#advanced-transfer" className="hover:underline">3. Method 2: Advanced Page Transfer (Extract & Insert)</a></li>
            <li><a href="#comparison" className="hover:underline">4. Why Genz PDF is Better (Comparison)</a></li>
            <li><a href="#tech-stack" className="hover:underline">5. The Tech Stack: How It Works Offline</a></li>
            <li><a href="#faq" className="hover:underline">6. Frequently Asked Questions (Ultimate 2026 Guide)</a></li>
            <li><a href="#more-tools" className="hover:underline">7. Explore More Free PDF Tools</a></li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="prose prose-lg prose-indigo max-w-none text-slate-700">
          
          {/* Core Features Overview */}
          <h2 id="exclusive-features" className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3 scroll-mt-24">
            <Layers className="text-indigo-500" /> Exclusive Features of Genz PDF Merge
          </h2>
          <p>Unlike standard PDF tools that just stick files together, Genz PDF gives you full control over your documents without ever uploading them to a server:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none pl-0 mb-10">
            <li className="flex items-start gap-2 bg-white p-4 rounded-xl border border-slate-100 shadow-sm m-0">
              <ShieldCheck className="text-emerald-500 flex-shrink-0 mt-1" size={20} />
              <span className="text-sm"><strong>100% Privacy:</strong> Files are processed locally in your browser.</span>
            </li>
            <li className="flex items-start gap-2 bg-white p-4 rounded-xl border border-slate-100 shadow-sm m-0">
              <Settings2 className="text-indigo-500 flex-shrink-0 mt-1" size={20} />
              <span className="text-sm"><strong>Advanced Page Transfer:</strong> Move specific pages from one PDF directly into another.</span>
            </li>
            <li className="flex items-start gap-2 bg-white p-4 rounded-xl border border-slate-100 shadow-sm m-0">
              <Download className="text-blue-500 flex-shrink-0 mt-1" size={20} />
              <span className="text-sm"><strong>Individual Downloads:</strong> Download edited files separately or merge them all together.</span>
            </li>
            <li className="flex items-start gap-2 bg-white p-4 rounded-xl border border-slate-100 shadow-sm m-0">
              <Zap className="text-amber-500 flex-shrink-0 mt-1" size={20} />
              <span className="text-sm"><strong>No File Size Limits:</strong> Combine massive documents instantly using your device's RAM.</span>
            </li>
          </ul>

          {/* Video Demo Placeholder */}
          <div className="my-12 relative rounded-2xl overflow-hidden bg-slate-900 aspect-video shadow-xl border border-slate-800 flex flex-col items-center justify-center group cursor-pointer hover:shadow-2xl transition-all">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900 opacity-80"></div>
            <PlayCircle size={72} className="text-white/80 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-300 z-10" />
            <span className="text-white/80 font-bold mt-4 z-10 group-hover:text-white transition-colors tracking-wide">Watch 1-Minute Interactive Demo</span>
            <span className="text-slate-400 text-xs mt-2 z-10">(Coming Soon)</span>
          </div>

          {/* Basic Merge Guide */}
          <h2 id="standard-merge" className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3 scroll-mt-24">
            <FileStack className="text-indigo-500" /> Method 1: The Standard Merge
          </h2>
          <p>If you just want to combine whole documents quickly:</p>
          <div className="space-y-4 my-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">1</div>
              <div><strong>Upload:</strong> Drag and drop multiple PDF files into the tool.</div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">2</div>
              <div><strong>Reorder:</strong> Drag the files up or down to set them in your preferred order.</div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">3</div>
              <div><strong>Merge:</strong> Click the massive "Merge Files" button on the right to combine them all into a single file instantly.</div>
            </div>
          </div>

          <hr className="my-10 border-slate-200" />

          {/* Advanced Page Transfer Guide */}
          <h2 id="advanced-transfer" className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3 scroll-mt-24">
            <Settings2 className="text-indigo-500" /> Method 2: Advanced Page Transfer (Extract & Insert)
          </h2>
          <p>Need to take just page 3 from "Document B" and insert it into the middle of "Document A"? Our visual editor makes this complex task incredibly simple:</p>

          <div className="space-y-6 my-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 m-0 mb-2">Step 1: Set Your Target PDF</h3>
              <p className="text-sm text-slate-600 m-0">Find the main document you want to add pages into. Click the <strong>"Set Target"</strong> button on that specific file. This tells the tool where the new pages will eventually go.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 m-0 mb-2">Step 2: Extract Pages from Source</h3>
              <p className="text-sm text-slate-600 m-0">Go to your second document (the source) and click <strong>"Edit Pages"</strong>. A visual grid will open. Select the specific pages you want to extract and click confirm.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 m-0 mb-2">Step 3: Choose Insert Position</h3>
              <p className="text-sm text-slate-600 m-0">Immediately after extracting, the visual editor for your Target PDF will open. Simply click exactly where you want the extracted pages to be inserted, and confirm. The tool will instantly update both files.</p>
            </div>
          </div>

          {/* Flexible Download Options */}
          <h3 className="text-xl font-bold text-slate-900 mt-10 mb-4">Flexible Download Options</h3>
          <p>After using the Advanced Page Transfer, you have three distinct choices on how to export your work:</p>
          <ul className="list-disc pl-6 mb-8 text-slate-600">
            <li><strong>Download Target PDF:</strong> Click the download icon specifically on your Target file to get the updated document (now containing the inserted pages).</li>
            <li><strong>Download Source PDF:</strong> Click the download icon on your Source file to get the updated version (with the extracted pages removed).</li>
            <li><strong>Merge Everything:</strong> Click the main "Merge Files" button on the right sidebar to stitch both of these newly updated documents together into one massive PDF.</li>
          </ul>

          <hr className="my-12 border-slate-200" />

          {/* Comparison Section */}
          <h2 id="comparison" className="text-2xl font-bold text-slate-900 mb-6 text-center scroll-mt-24">
            Why Genz PDF is Better
          </h2>
          <div className="overflow-x-auto mb-12">
            <table className="w-full text-left border-collapse rounded-2xl overflow-hidden shadow-sm border border-slate-200">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-4 font-bold text-slate-800 border-b border-slate-200">Feature</th>
                  <th className="p-4 font-black text-indigo-600 border-b border-slate-200 bg-indigo-50/50">Genz PDF 🚀</th>
                  <th className="p-4 font-bold text-slate-500 border-b border-slate-200">Standard Cloud Tools</th>
                </tr>
              </thead>
              <tbody className="bg-white text-sm">
                <tr>
                  <td className="p-4 border-b border-slate-100 font-medium text-slate-700">File Processing</td>
                  <td className="p-4 border-b border-slate-100 text-emerald-600 font-bold bg-indigo-50/30">Offline (Your Browser)</td>
                  <td className="p-4 border-b border-slate-100 text-slate-500">Cloud Servers (Upload required)</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-slate-100 font-medium text-slate-700">Privacy Risk</td>
                  <td className="p-4 border-b border-slate-100 text-emerald-600 font-bold bg-indigo-50/30">Zero (Data stays with you)</td>
                  <td className="p-4 border-b border-slate-100 text-red-400">High (Data sent over internet)</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-slate-100 font-medium text-slate-700">File Size Limit</td>
                  <td className="p-4 border-b border-slate-100 text-emerald-600 font-bold bg-indigo-50/30">Unlimited (Based on RAM)</td>
                  <td className="p-4 border-b border-slate-100 text-slate-500">Usually capped at 10MB - 50MB</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-slate-100 font-medium text-slate-700">Advanced Page Transfer</td>
                  <td className="p-4 border-b border-slate-100 text-emerald-600 font-bold bg-indigo-50/30">Yes (Visual Editor)</td>
                  <td className="p-4 border-b border-slate-100 text-slate-500">Paid feature or Not available</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-slate-100 font-medium text-slate-700">Price</td>
                  <td className="p-4 border-b border-slate-100 text-emerald-600 font-bold bg-indigo-50/30">100% Free Forever</td>
                  <td className="p-4 border-b border-slate-100 text-slate-500">Premium subscriptions needed</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Technical Deep Dive Section */}
          <h2 id="tech-stack" className="text-2xl font-bold text-slate-900 mt-12 mb-6 flex items-center gap-3 scroll-mt-24">
            <ServerOff className="text-indigo-500" /> The Tech Stack: How It Works Offline
          </h2>
          <p>Most PDF tools force you to upload your sensitive documents to their servers. We built Genz PDF using a <strong>100% Client-Side Architecture</strong>, meaning your files never leave your computer.</p>
          
          <ul className="space-y-4 list-disc pl-6 mb-8 text-slate-600">
            <li><strong>React.js & Vite:</strong> Provides a smooth, ultra-fast user interface.</li>
            <li><strong>pdf-lib:</strong> The core JavaScript engine that reads, splits, and modifies PDF documents directly inside your web browser.</li>
            <li><strong>Web APIs:</strong> We utilize modern <code>ArrayBuffer</code> and <code>Blob</code> features to handle massive files entirely in your device's memory (RAM) without any network uploads.</li>
          </ul>

          {/* Testimonials Section */}
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 my-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center m-0">Loved by Students & Professionals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex text-amber-400 mb-3"><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/></div>
                <p className="text-slate-600 italic text-sm m-0">"The page extraction feature is a lifesaver. I was able to pull specific pages from my massive textbook PDF and merge them with my class notes in seconds without uploading anything!"</p>
                <p className="mt-4 font-bold text-slate-800 text-sm m-0">- Ananya S., CS Student</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex text-amber-400 mb-3"><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/></div>
                <p className="text-slate-600 italic text-sm m-0">"Finally, a tool that lets me merge confidential legal contracts without worrying about cloud server data breaches. Genz PDF is incredibly fast and secure."</p>
                <p className="mt-4 font-bold text-slate-800 text-sm m-0">- Rahul M., Corporate Lawyer</p>
              </div>
            </div>
          </div>

          <hr className="my-12 border-slate-200" />

          {/* MEGA FAQ SECTION */}
          <h2 id="faq" className="text-2xl font-bold text-slate-900 mt-12 mb-8 flex items-center gap-3 scroll-mt-24">
            <HelpCircle className="text-indigo-500" /> Ultimate FAQ Guide (2026 Edition)
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-slate-800 m-0">Why is adding pages to PDFs still useful in 2026?</h4>
              <p className="text-slate-600 mt-2 text-sm leading-relaxed m-0">Even in 2026, as digital documentation evolves, combining contracts, assignment portfolios, and financial reports into a single, cohesive PDF remains the gold standard for professional sharing, legal compliance, and archiving.</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-slate-800 m-0">Can I add pages to a PDF from another document?</h4>
              <p className="text-slate-600 mt-2 text-sm leading-relaxed m-0">Yes! Genz PDF's unique <strong>Advanced Page Transfer</strong> visual editor allows you to extract specific pages from a source document and precisely insert them exactly where you want in your target PDF.</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-slate-800 m-0">How do I add a blank page to a PDF online?</h4>
              <p className="text-slate-600 mt-2 text-sm leading-relaxed m-0">With Genz PDF, you can easily drag and drop a blank PDF template file into your upload queue, reorder it to your preferred position, and hit merge to insert blank spaces precisely where you need them.</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-slate-800 m-0">Is Genz PDF free to use?</h4>
              <p className="text-slate-600 mt-2 text-sm leading-relaxed m-0">Absolutely. Genz PDF is <strong>100% free forever</strong>. There are no premium subscriptions, no annoying paywalls, no daily limits, and no hidden fees.</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-slate-800 m-0">Does Genz PDF protect my files when adding pages?</h4>
              <p className="text-slate-600 mt-2 text-sm leading-relaxed m-0">Yes. We use a strict 100% Client-Side Architecture. Your files are processed entirely within your device's RAM and are <strong>never uploaded to our servers</strong>, making data breaches impossible.</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-slate-800 m-0">Can I use Genz PDF if I'm in Europe or Latin America?</h4>
              <p className="text-slate-600 mt-2 text-sm leading-relaxed m-0">Yes, Genz PDF is accessible globally. Since we don't collect, upload, or process your files on external servers, we are fully compliant with GDPR and other international privacy laws by default.</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-slate-800 m-0">What's the best way to merge two PDFs and add pages?</h4>
              <p className="text-slate-600 mt-2 text-sm leading-relaxed m-0">Simply drag and drop your two PDFs into our upload zone, use the drag handles to reorder them if necessary, and click the big 'Merge' button. If you need specific pages swapped, use our 'Set Target' and 'Edit Pages' tools.</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-slate-800 m-0">Can I add pages to a PDF from my phone?</h4>
              <p className="text-slate-600 mt-2 text-sm leading-relaxed m-0">Yes! Genz PDF is fully responsive and works flawlessly on iOS (iPhone/iPad) and Android web browsers without needing to download any cumbersome apps.</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-slate-800 m-0">Does Genz PDF work offline?</h4>
              <p className="text-slate-600 mt-2 text-sm leading-relaxed m-0">Because Genz PDF runs entirely in your browser using JavaScript, once the website initially loads, the actual merging and editing process happens locally. It does not require an active internet connection to process the files.</p>
            </div>

            {/* Social Media Updates Section */}
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl shadow-sm mt-8">
              <h4 className="font-bold text-indigo-900 text-lg m-0 mb-3">How do I stay updated with new Genz PDF tools in 2026?</h4>
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
          </div>

          <hr className="my-12 border-slate-200" />

          {/* Use Cases Section */}
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Who Uses Genz PDF Merge?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
              <h4 className="font-bold text-slate-800 mb-2">🎓 For Students</h4>
              <p className="text-sm text-slate-600 m-0">Combine lecture slides, assignment pages, and research papers into a single organized PDF before submission.</p>
            </div>
            <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100">
              <h4 className="font-bold text-slate-800 mb-2">💼 For Professionals</h4>
              <p className="text-sm text-slate-600 m-0">Stitch together monthly invoices, business reports, and portfolios into neat, shareable documents.</p>
            </div>
            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
              <h4 className="font-bold text-slate-800 mb-2">⚖️ For Legal & Finance</h4>
              <p className="text-sm text-slate-600 m-0">Handle highly sensitive, confidential contracts safely. Since it's client-side, your files never touch a server.</p>
            </div>
          </div>

          {/* Cross-Platform Compatibility */}
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl my-10 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-3">Merge PDFs on Any Device</h3>
              <p className="text-slate-300 text-sm md:text-base max-w-xl">
                Whether you are on a Windows PC, Mac, Android phone, or iPhone, Genz PDF works flawlessly directly in your browser. <strong>No apps to install. No extensions required.</strong>
              </p>
            </div>
            {/* Decorative background element */}
            <div className="absolute -right-10 -bottom-10 opacity-20">
              <Zap size={150} />
            </div>
          </div>

          <hr className="my-12 border-slate-200" />

          {/* 🔗 FULL INTERNAL LINKING SECTION (All 7 Tools Included) */}
          <h2 id="more-tools" className="text-2xl font-bold text-slate-900 mb-6 scroll-mt-24">
            Explore More Free PDF Tools
          </h2>
          <p>Genz PDF offers a complete suite of professional, offline tools. Check out our other free utilities:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-8">
            <a href="/split" className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group no-underline bg-white">
              <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-600 transition-colors"><Scissors size={20} className="text-indigo-600 group-hover:text-white" /></div>
              <div>
                <h4 className="m-0 font-bold text-slate-900 group-hover:text-indigo-600 leading-tight">Split PDF</h4>
                <p className="m-0 text-[11px] text-slate-500 mt-1 leading-snug">Extract or remove specific pages.</p>
              </div>
            </a>
            
            <a href="/compress" className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all group no-underline bg-white">
              <div className="p-3 bg-emerald-50 rounded-lg group-hover:bg-emerald-600 transition-colors"><Minimize2 size={20} className="text-emerald-600 group-hover:text-white" /></div>
              <div>
                <h4 className="m-0 font-bold text-slate-900 group-hover:text-emerald-600 leading-tight">Compress PDF</h4>
                <p className="m-0 text-[11px] text-slate-500 mt-1 leading-snug">Reduce file size instantly.</p>
              </div>
            </a>
            
            <a href="/protect" className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-rose-400 hover:shadow-md transition-all group no-underline bg-white">
              <div className="p-3 bg-rose-50 rounded-lg group-hover:bg-rose-600 transition-colors"><Lock size={20} className="text-rose-600 group-hover:text-white" /></div>
              <div>
                <h4 className="m-0 font-bold text-slate-900 group-hover:text-rose-600 leading-tight">Protect PDF</h4>
                <p className="m-0 text-[11px] text-slate-500 mt-1 leading-snug">Add secure passwords.</p>
              </div>
            </a>

            <a href="/unlock" className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all group no-underline bg-white">
              <div className="p-3 bg-amber-50 rounded-lg group-hover:bg-amber-500 transition-colors"><Unlock size={20} className="text-amber-600 group-hover:text-white" /></div>
              <div>
                <h4 className="m-0 font-bold text-slate-900 group-hover:text-amber-500 leading-tight">Unlock PDF</h4>
                <p className="m-0 text-[11px] text-slate-500 mt-1 leading-snug">Remove PDF passwords.</p>
              </div>
            </a>

            <a href="/signature" className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group no-underline bg-white">
              <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-500 transition-colors"><PenTool size={20} className="text-blue-600 group-hover:text-white" /></div>
              <div>
                <h4 className="m-0 font-bold text-slate-900 group-hover:text-blue-500 leading-tight">Sign PDF</h4>
                <p className="m-0 text-[11px] text-slate-500 mt-1 leading-snug">Add your e-signature securely.</p>
              </div>
            </a>

            <a href="/convert" className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-fuchsia-400 hover:shadow-md transition-all group no-underline bg-white">
              <div className="p-3 bg-fuchsia-50 rounded-lg group-hover:bg-fuchsia-500 transition-colors"><ArrowRightLeft size={20} className="text-fuchsia-600 group-hover:text-white" /></div>
              <div>
                <h4 className="m-0 font-bold text-slate-900 group-hover:text-fuchsia-500 leading-tight">Convert PDF</h4>
                <p className="m-0 text-[11px] text-slate-500 mt-1 leading-snug">Convert PDF to Word, JPG, etc.</p>
              </div>
            </a>

            <a href="/resize" className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-cyan-400 hover:shadow-md transition-all group no-underline bg-white md:col-span-2 lg:col-span-3 lg:max-w-sm mx-auto w-full">
              <div className="p-3 bg-cyan-50 rounded-lg group-hover:bg-cyan-500 transition-colors"><Scaling size={20} className="text-cyan-600 group-hover:text-white" /></div>
              <div>
                <h4 className="m-0 font-bold text-slate-900 group-hover:text-cyan-500 leading-tight">Resize Image</h4>
                <p className="m-0 text-[11px] text-slate-500 mt-1 leading-snug">Change image dimensions & KB accurately.</p>
              </div>
            </a>
          </div>

          {/* Final CTA Button */}
          <div className="text-center mt-16 mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Ready to try it out?</h3>
            <a 
              href="/merge" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1 no-underline"
            >
              <FileStack size={20} />
              Go to Merge PDF Tool
            </a>
          </div>

        </div>
      </article>
    </>
  );
};

export default MergePdfBlog;
