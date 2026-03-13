import React from 'react';
import { ShieldCheck, Zap, ServerOff, FileStack } from 'lucide-react';

export const MergePdfBlog = () => {
  return (
    <article className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      {/* Blog Header */}
      <header className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-indigo-100">
          <Zap size={14} /> Guide & Tech Deep Dive
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
          How to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Merge PDF Files</span> & The Tech Behind It
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Learn the simple steps to combine your PDFs instantly, and discover how our 100% secure, offline-browser technology protects your data.
        </p>
      </header>

      {/* Main Content */}
      <div className="prose prose-lg prose-indigo max-w-none text-slate-700">
        
        {/* User Guide Section */}
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <FileStack className="text-indigo-500" /> How to Merge PDF Files (Step-by-Step)
        </h2>
        <p>
          Combining multiple PDF documents into a single file is incredibly easy with Genz PDF. Follow these three simple steps:
        </p>

        <div className="space-y-6 my-8">
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">1</div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 m-0">Upload Your Files</h3>
              <p className="text-slate-600 mt-2">Click on the upload area or simply drag and drop the PDF files you want to combine. You can add as many files as you need.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">2</div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 m-0">Rearrange the Order</h3>
              <p className="text-slate-600 mt-2">Once uploaded, you will see a list of your files. You can sort them automatically (A-Z) or drag and drop them to get the exact order you want for your final document.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">3</div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 m-0">Click Merge and Download</h3>
              <p className="text-slate-600 mt-2">Hit the "Merge Files" button. Within seconds, your new combined PDF will be ready. Click the download button to save it to your device.</p>
            </div>
          </div>
        </div>

        <hr className="my-12 border-slate-200" />

        {/* Technical Deep Dive Section */}
        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6 flex items-center gap-3">
          <ServerOff className="text-indigo-500" /> The Tech Stack: How It Works Behind the Scenes
        </h2>
        <p>
          Most PDF tools online force you to upload your sensitive documents to their servers. We built Genz PDF using a <strong>100% Client-Side Architecture</strong>. This means your files never leave your computer.
        </p>
        
        <ul className="space-y-4 list-disc pl-6 mb-8">
          <li><strong>React.js & Vite:</strong> Provides a smooth, ultra-fast user interface.</li>
          <li><strong>pdf-lib:</strong> The core engine. This JavaScript library allows us to read and modify PDF documents directly inside your web browser.</li>
          <li><strong>Web APIs:</strong> We utilize modern browser features to handle massive files entirely in your device's memory (RAM) without any network uploads.</li>
        </ul>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 my-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4">The Processing Journey</h3>
          <ol className="list-decimal pl-5 space-y-3 text-sm text-slate-600">
            <li><strong>Selection:</strong> Files are captured using the HTML5 File API and stored temporarily in your browser.</li>
            <li><strong>Conversion:</strong> The tool converts your physical files into raw binary data (<code>ArrayBuffer</code>).</li>
            <li><strong>Merging:</strong> <code>pdf-lib</code> creates a blank document and sequentially copies pages from your selected files into it.</li>
            <li><strong>Rendering:</strong> The final document is generated as a Blob, and your browser gives you a secure, local download link.</li>
          </ol>
        </div>

        {/* FAQ Section */}
        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6 flex items-center gap-3">
          <ShieldCheck className="text-indigo-500" /> Frequently Asked Questions (FAQ)
        </h2>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-slate-800">Is my data secure?</h4>
            <p className="text-slate-600 mt-1">Absolutely. Because of our client-side architecture, your files are processed using your own device. We do not have servers that store your documents, making data breaches impossible.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Is there a file size limit?</h4>
            <p className="text-slate-600 mt-1">We don't impose artificial limits. The only limit is the available RAM on your device (phone or computer).</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Can I merge password-protected PDFs?</h4>
            <p className="text-slate-600 mt-1">Our system detects encrypted PDFs and will ask you to unlock them first. You can use our integrated "Unlock PDF" tool to remove the password before merging.</p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default MergePdfBlog;
