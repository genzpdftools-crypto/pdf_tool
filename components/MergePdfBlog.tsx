import React from 'react';
import { ShieldCheck, Zap, ServerOff, FileStack, Settings2, Download, Layers } from 'lucide-react';

export const MergePdfBlog = () => {
  return (
    <article className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      {/* Blog Header */}
      <header className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-indigo-100">
          <Zap size={14} /> Ultimate Guide & Tech Deep Dive
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
          How to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Merge & Edit PDF Files</span> Like a Pro
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Discover how to easily combine files, transfer specific pages between PDFs, and how our 100% secure, offline-browser technology protects your data.
        </p>
      </header>

      {/* Main Content */}
      <div className="prose prose-lg prose-indigo max-w-none text-slate-700">
        
        {/* Core Features Overview */}
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <Layers className="text-indigo-500" /> Exclusive Features of Genz PDF Merge
        </h2>
        <p>
          Unlike standard PDF tools that just stick files together, Genz PDF gives you full control over your documents without ever uploading them to a server:
        </p>
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

        {/* Basic Merge Guide */}
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
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

        {/* Advanced Page Transfer Guide (The Unique Feature) */}
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <Settings2 className="text-indigo-500" /> Method 2: Advanced Page Transfer (Extract & Insert)
        </h2>
        <p>
          Need to take just page 3 from "Document B" and insert it into the middle of "Document A"? Our visual editor makes this complex task incredibly simple:
        </p>

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

        {/* Technical Deep Dive Section */}
        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6 flex items-center gap-3">
          <ServerOff className="text-indigo-500" /> The Tech Stack: How It Works Offline
        </h2>
        <p>
          Most PDF tools force you to upload your sensitive documents to their servers. We built Genz PDF using a <strong>100% Client-Side Architecture</strong>, meaning your files never leave your computer.
        </p>
        
        <ul className="space-y-4 list-disc pl-6 mb-8 text-slate-600">
          <li><strong>React.js & Vite:</strong> Provides a smooth, ultra-fast user interface.</li>
          <li><strong>pdf-lib:</strong> The core JavaScript engine that reads, splits, and modifies PDF documents directly inside your web browser.</li>
          <li><strong>Web APIs:</strong> We utilize modern <code>ArrayBuffer</code> and <code>Blob</code> features to handle massive files entirely in your device's memory (RAM) without any network uploads.</li>
        </ul>

        {/* FAQ Section */}
        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6 flex items-center gap-3">
          <ShieldCheck className="text-indigo-500" /> Frequently Asked Questions (FAQ)
        </h2>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-slate-800">Is my data really secure?</h4>
            <p className="text-slate-600 mt-1">Absolutely. Because of our client-side architecture, your files are processed using your own device's hardware. We literally have no backend servers capable of storing your documents.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Can I merge password-protected PDFs?</h4>
            <p className="text-slate-600 mt-1">Our system detects encrypted PDFs and will alert you. You can easily use our integrated "Unlock PDF" tool from the menu to remove the password before merging or editing.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Will I lose quality when transferring pages?</h4>
            <p className="text-slate-600 mt-1">No. Genz PDF copies the raw binary data of the pages. The resolution, text, and images remain exactly identical to your original uploaded file.</p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default MergePdfBlog;
