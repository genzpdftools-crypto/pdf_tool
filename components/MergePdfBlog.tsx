import React from 'react';
import { ShieldCheck, Zap, ServerOff, FileStack } from 'lucide-react';

export const MergePdfBlog = () => {
  return (
    <article className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      {/* Blog Header */}
      <header className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-indigo-100">
          <Zap size={14} /> Tech Deep Dive
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
          Inside Genz PDF: The Technology Behind Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Merge PDF Tool</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Discover how we process your sensitive documents locally in your browser without ever uploading them to a server.
        </p>
      </header>

      {/* Main Content */}
      <div className="prose prose-lg prose-indigo max-w-none text-slate-700">
        <p>
          Merging PDF files used to be a tedious task that required downloading heavy software or trusting cloud-based servers with your highly sensitive personal documents. At Genz PDF, we decided to change the paradigm. 
        </p>
        <p>
          We built a <strong>100% Client-Side Architecture</strong>. But what does that actually mean? Let's break down the technology and flow that powers our Merge PDF tool.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6 flex items-center gap-3">
          <ServerOff className="text-indigo-500" /> The Tech Stack
        </h2>
        <p>
          To achieve blazing-fast speeds and military-grade privacy, we rely on a modern web development stack:
        </p>
        <ul className="space-y-4 list-disc pl-6 mb-8">
          <li><strong>React.js & Vite:</strong> Our frontend is built on React, providing a smooth, app-like user interface. Vite acts as our build tool, ensuring ultra-fast load times.</li>
          <li><strong>pdf-lib:</strong> This is the core engine of our application. <code>pdf-lib</code> is a powerful JavaScript library that allows us to read, create, and modify PDF documents directly within the JavaScript environment.</li>
          <li><strong>Web APIs:</strong> We heavily utilize modern browser APIs like <code>Blob</code> and <code>URL.createObjectURL()</code> to handle massive files entirely in your device's Random Access Memory (RAM).</li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6 flex items-center gap-3">
          <FileStack className="text-indigo-500" /> Step-by-Step: How It Actually Works
        </h2>
        
        <div className="space-y-8 my-8">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-2">1. The Selection Phase</h3>
            <p className="text-sm">When you drag and drop your files into our uploader, they are captured using the HTML5 File API. We store a temporary reference to these files in your browser's local state. <strong>No network request is made. Zero bytes leave your computer.</strong></p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-2">2. Processing & Array Buffers</h3>
            <p className="text-sm">When you click "Merge," our tool converts your physical files into <code>ArrayBuffer</code> objects. This translates the PDF into raw binary data that our JavaScript engine can understand and manipulate.</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-2">3. The Merging Engine</h3>
            <p className="text-sm">Using <code>pdf-lib</code>, we create a brand new, empty PDF document in the background. We then iterate through your selected files, copy the pages from the original documents, and inject them sequentially into the new document.</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-2">4. Rendering the Blob</h3>
            <p className="text-sm">Finally, the newly merged document is saved as a <code>Uint8Array</code> and converted into a <code>Blob</code> (Binary Large Object). Your browser then generates a secure, local download link, allowing you to save the file instantly.</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6 flex items-center gap-3">
          <ShieldCheck className="text-indigo-500" /> Frequently Asked Questions (FAQ)
        </h2>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-slate-800">Is my data secure?</h4>
            <p className="text-slate-600 mt-1">Absolutely. Because of our client-side architecture, your files are processed using your own device's CPU and RAM. We do not have servers that store your documents, meaning data breaches are technically impossible.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Is there a file size limit?</h4>
            <p className="text-slate-600 mt-1">There are no artificial limits imposed by us. The only limitation is the available RAM on your device (mobile phone or computer) and the browser's maximum memory capacity.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Can I merge password-protected PDFs?</h4>
            <p className="text-slate-600 mt-1">Our system will detect encrypted PDFs and prompt you to unlock them first. You can use our integrated "Unlock PDF" tool to remove the password before merging.</p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default MergePdfBlog;
