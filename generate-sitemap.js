import fs from 'fs';

const baseUrl = 'https://genzpdf.com';

// File sizes and formats that people actively search for on Google
const sizes = [10, 20, 30, 40, 50, 100, 150, 200, 300, 500];
const formats = ['jpg', 'jpeg', 'png', 'word'];

// Start building the basic XML format for the sitemap
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// 📌 WHENEVER YOU BUILD A NEW TOOL IN THE FUTURE, ADD ITS URL PATH HERE
const corePages = [
  '', 
  '/merge', 
  '/split', 
  '/compress-pdf', 
  '/convert', 
  '/resize', 
  '/protect', 
  '/unlock', 
  '/signature'
];

// Add the main pages to the sitemap
corePages.forEach(page => {
  xml += `  <url>\n    <loc>${baseUrl}${page}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
});

// Generate dynamic Programmatic SEO routes (To capture searches like "compress pdf to 100kb")
sizes.forEach(size => {
  xml += `  <url>\n    <loc>${baseUrl}/resize-image-${size}kb</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  xml += `  <url>\n    <loc>${baseUrl}/compress-pdf-${size}kb</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
});

// Add pages that convert different formats to PDF
formats.forEach(format => {
  xml += `  <url>\n    <loc>${baseUrl}/${format}-to-pdf</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
});

// Close the XML file properly
xml += `</urlset>`;

// 🛡️ SAFETY CHECK: Ensure the 'public' folder exists before trying to save the file
if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

// Save the file into the public folder so Vercel can publish it live
fs.writeFileSync('./public/sitemap.xml', xml);
console.log('Massive sitemap generated for Vercel deployment!');
