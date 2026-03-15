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

xml += `</urlset>`;

// 🛡️ SAFETY CHECK: Public folder nahi hai toh Vercel khud bana lega
if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

fs.writeFileSync('./public/sitemap.xml', xml);
console.log('Massive sitemap generated for Vercel deployment!');
