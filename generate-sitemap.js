import fs from 'fs';

const baseUrl = 'https://genzpdf.com';

// 🗓️ Aaj ki date automatically nikalna (Google ko fresh content pasand hai)
const today = new Date().toISOString().split('T')[0]; 

// SEO ke liye file sizes aur formats
const sizes = [10, 20, 30, 40, 50, 100, 150, 200, 300, 500];
const formats = ['jpg', 'jpeg', 'png', 'word'];

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// 📌 TUMHARE SAARE PAGES, SATH ME UNKI PRIORITY AUR FREQUENCY
const corePages = [
  { path: '', freq: 'daily', priority: '1.0' },
  { path: '/merge', freq: 'weekly', priority: '0.9' },
  { path: '/split', freq: 'weekly', priority: '0.9' },
  { path: '/compress-pdf', freq: 'weekly', priority: '0.9' }, 
  { path: '/convert', freq: 'weekly', priority: '0.9' },
  { path: '/resize', freq: 'weekly', priority: '0.9' },
  { path: '/protect', freq: 'weekly', priority: '0.9' },
  { path: '/signature', freq: 'weekly', priority: '0.9' },
  { path: '/unlock', freq: 'weekly', priority: '0.9' },
  
  // 📝 TUMHARE BLOGS (Yahan naye blogs add karte jana future me)
  { path: '/blog/merge-pdf', freq: 'monthly', priority: '0.8' },
  
  // 📄 Naye static pages
  { path: '/about', freq: 'monthly', priority: '0.7' },
  { path: '/contact', freq: 'monthly', priority: '0.7' },
  { path: '/policy', freq: 'yearly', priority: '0.5' },
  { path: '/terms', freq: 'yearly', priority: '0.5' }
];

// 1. Saare main pages ko sitemap me daalna (Automatic Date ke sath)
corePages.forEach(page => {
  xml += `  <url>\n    <loc>${baseUrl}${page.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.freq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
});

// 2. Dynamic Programmatic SEO routes (100kb, 200kb wale pages)
sizes.forEach(size => {
  xml += `  <url>\n    <loc>${baseUrl}/resize-image-${size}kb</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  xml += `  <url>\n    <loc>${baseUrl}/compress-pdf-${size}kb</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
});

// 3. Formats wale routes (jpg-to-pdf)
formats.forEach(format => {
  xml += `  <url>\n    <loc>${baseUrl}/${format}-to-pdf</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
});

// 4. Split PDF ke SEO keywords wale routes
const splitKeywords = [
  'split-pdf-by-size', 'split-large-pdf-offline', 'split-pdf-under-10mb', 
  'split-pdf-under-5mb', 'split-pdf-under-2mb', 'split-pdf-under-1mb', 
  'split-pdf-into-100kb-parts', 'chunk-large-pdf-files', 'split-heavy-pdf-free', 
  'split-50mb-pdf-offline', 'extract-odd-even-pages-pdf', 'split-pdf-in-half', 
  'separate-pdf-pages-free', 'extract-specific-pages-from-pdf', 'split-pdf-into-single-pages', 
  'save-one-page-of-pdf', 'extract-first-page-of-pdf', 'extract-last-page-of-pdf', 
  'split-pdf-by-page-ranges', 'remove-pages-from-pdf-offline', 'extract-landscape-pages-pdf', 
  'extract-portrait-pages-pdf', 'split-pdf-multiple-files', 'burst-pdf-into-images', 
  'divide-pdf-document-online', 'split-pdf-safely', 'split-confidential-pdf-offline', 
  'secure-pdf-splitter-client-side', 'split-pdf-without-uploading', 'private-pdf-page-extractor', 
  'offline-pdf-splitter-browser', 'split-pdf-no-server-upload', 'secure-document-splitter', 
  'zero-trust-pdf-splitter', 'safe-pdf-separator', 'split-pdf-on-mobile', 
  'split-pdf-windows-10-free', 'split-pdf-mac-offline', 'split-pdf-to-jpg-offline', 
  'extract-pdf-pages-to-png', 'split-word-docx-pages-online', 'split-pdf-for-whatsapp', 
  'split-pdf-for-email-attachment', 'split-legal-documents-securely', 'split-student-assignment-pdf', 
  'extract-invoices-from-pdf', 'split-bank-statements-offline', 'split-resume-pdf-pages', 
  'extract-book-chapters-pdf', 'split-scanned-pdf-offline'
];

splitKeywords.forEach(keyword => {
  xml += `  <url>\n    <loc>${baseUrl}/${keyword}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
});

xml += `</urlset>`;

// 🛡️ SAFETY CHECK: Public folder nahi hai toh Vercel khud bana lega
if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

fs.writeFileSync('./public/sitemap.xml', xml);
console.log('Massive sitemap generated for Vercel deployment!');
