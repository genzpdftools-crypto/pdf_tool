import fs from 'fs';

const baseUrl = 'https://genzpdf.com';
const sizes = [10, 20, 30, 40, 50, 100, 150, 200, 300, 500];
const formats = ['jpg', 'jpeg', 'png', 'word'];

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// Generate core pages
const corePages = ['', '/merge', '/split', '/compress', '/convert', '/resize', '/protect', '/unlock', '/signature'];
corePages.forEach(page => {
  xml += `  <url>\n    <loc>${baseUrl}${page}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
});

// Generate dynamic Programmatic SEO routes
sizes.forEach(size => {
  xml += `  <url>\n    <loc>${baseUrl}/resize-image-${size}kb</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  xml += `  <url>\n    <loc>${baseUrl}/compress-pdf-${size}kb</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
});

formats.forEach(format => {
  xml += `  <url>\n    <loc>${baseUrl}/${format}-to-pdf</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
});

xml += `</urlset>`;

fs.writeFileSync('./public/sitemap.xml', xml);
console.log('Massive sitemap generated for Vercel deployment!');
