// services/pdfThumbnail.ts
import * as pdfjsLib from 'pdfjs-dist';

// CDN se worker load kar rahe hain taaki Vite build me koi error na aaye
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const generatePdfThumbnails = async (file: File): Promise<string[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    const thumbnails: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      // Thumbnail ke liye scale thoda kam rakha hai taaki fast load ho
      const viewport = page.getViewport({ scale: 0.5 }); 
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) continue;
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport: viewport }).promise;
      thumbnails.push(canvas.toDataURL('image/jpeg', 0.8));
    }
    return thumbnails;
  } catch (error) {
    console.error("Thumbnail generation error:", error);
    throw new Error("PDF ke pages load nahi ho paaye.");
  }
};
