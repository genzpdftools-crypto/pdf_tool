// services/pdfService.ts
import { PDFDocument } from 'pdf-lib';

export const mergePdfs = async (files: File[]): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    try {
      const arrayBuffer = await file.arrayBuffer();

      // सुधार: यहाँ से { ignoreEncryption: true } हटा दिया है।
      // अब अगर PDF लॉक होगी, तो pdf-lib तुरंत एरर फेंक देगा।
      const pdf = await PDFDocument.load(arrayBuffer);

      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));

    } catch (error: any) {
      console.error(`Error processing file ${file.name}:`, error);

      // अगर फाइल पासवर्ड प्रोटेक्टेड है, तो यह खास एरर पकड़ लेगा
      if (error.message && error.message.toLowerCase().includes('encrypted')) {
        throw new Error(`File "${file.name}" password protected hai. Kripya pehle password hatayein.`);
      }

      // अगर फाइल करप्ट है
      throw new Error(`File "${file.name}" merge nahi ho payi. Ye file corrupted ho sakti hai.`);
    }
  }

  const savedPdf = await mergedPdf.save();
  return savedPdf;
};

export const insertPdfAtPage = async (baseFile: File, insertFile: File, targetIndex: number): Promise<Uint8Array> => {
  try {
    // 1. Dono files ko memory me load karo
    const baseBuffer = await baseFile.arrayBuffer();
    const basePdf = await PDFDocument.load(baseBuffer);

    const insertBuffer = await insertFile.arrayBuffer();
    const insertPdf = await PDFDocument.load(insertBuffer);

    // 2. Jo PDF beech me dalni hai, uske saare pages copy karo
    const copiedPages = await basePdf.copyPages(insertPdf, insertPdf.getPageIndices());

    // 3. Ek-ek karke pages ko target position par fasa do (insert)
    let currentIndex = targetIndex;
    for (const page of copiedPages) {
      basePdf.insertPage(currentIndex, page);
      currentIndex++; // Agle page ke liye jagah aage badhao
    }

    const savedPdf = await basePdf.save();
    return savedPdf;
  } catch (error: any) {
    console.error("Insert error:", error);
    throw new Error("File insert karne me problem aayi. Kripya check karein file lock toh nahi hai.");
  }
};

export const removePagesFromPdf = async (file: File, pagesToRemove: number[]): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();

  // Create a new PDF
  const newPdf = await PDFDocument.create();

  // Calculate indices to keep
  const indicesToKeep = [];
  for (let i = 0; i < totalPages; i++) {
    if (!pagesToRemove.includes(i)) {
      indicesToKeep.push(i);
    }
  }

  const copiedPages = await newPdf.copyPages(pdfDoc, indicesToKeep);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
};

// ========== REPLACED imagesToPdf FUNCTION ==========
export const imagesToPdf = async (files: File[]): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();

  // Standard A4 page dimensions (points mein)
  const A4_WIDTH = 595.28;
  const A4_HEIGHT = 841.89;

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let image;

    // Embed based on type
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(arrayBuffer);
    } else if (file.type === 'image/png') {
      image = await pdfDoc.embedPng(arrayBuffer);
    } else {
      continue; // Skip unsupported
    }

    // Har page ko standard A4 size ka banate hain, image ke size ka nahi
    const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);

    // Image ka aspect ratio maintain karne ke liye scaling calculate karte hain
    const imgWidth = image.width;
    const imgHeight = image.height;

    const widthRatio = A4_WIDTH / imgWidth;
    const heightRatio = A4_HEIGHT / imgHeight;
    
    // Jo ratio chota hai use lenge taaki image page ke bahar na nikal jaye
    const scale = Math.min(widthRatio, heightRatio);

    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    // Image ko page ke ekdum center mein place karne ke liye math
    const x = (A4_WIDTH - scaledWidth) / 2;
    const y = (A4_HEIGHT - scaledHeight) / 2;

    page.drawImage(image, {
      x: x,
      y: y,
      width: scaledWidth,
      height: scaledHeight,
    });
  }

  return await pdfDoc.save();
};
// ===================================================

export const createPdfUrl = (pdfBytes: Uint8Array): string => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
};

// Naya function: Ek PDF se pages nikal kar dusri me dalne ke liye
export const transferPagesBetweenPdfs = async (
  targetFile: File,      // 1st PDF (Jisme insert karna hai)
  sourceFile: File,      // 2nd PDF (Jisse nikalna hai)
  pagesToTransfer: number[], // [0, 2, 4] (Jo pages user ne select kiye)
  insertIndex: number    // Kis page ke baad dalna hai (Index 0 se start)
): Promise<{ newTargetFile: File; newSourceFile: File }> => {
  try {
    const targetBuffer = await targetFile.arrayBuffer();
    const sourceBuffer = await sourceFile.arrayBuffer();

    const targetPdf = await PDFDocument.load(targetBuffer);
    const sourcePdf = await PDFDocument.load(sourceBuffer);

    // 1. PDF 2 se select kiye gaye pages copy karo
    const copiedPages = await targetPdf.copyPages(sourcePdf, pagesToTransfer);

    // 2. PDF 1 me unko target index par insert karo
    let currentIndex = insertIndex;
    for (const page of copiedPages) {
      targetPdf.insertPage(currentIndex, page);
      currentIndex++;
    }

    // 3. PDF 2 se un pages ko hatao (reverse loop taaki aage ke index gadbad na hon)
    const sortedPagesToDelete = [...pagesToTransfer].sort((a, b) => b - a);
    for (const pageIndex of sortedPagesToDelete) {
      sourcePdf.removePage(pageIndex);
    }

    const savedTarget = await targetPdf.save();
    const savedSource = await sourcePdf.save();

    // Naye File objects return karo
    const newTargetBlob = new Blob([savedTarget], { type: 'application/pdf' });
    const newSourceBlob = new Blob([savedSource], { type: 'application/pdf' });

    return {
      newTargetFile: new File([newTargetBlob], targetFile.name, { type: 'application/pdf' }),
      newSourceFile: new File([newSourceBlob], sourceFile.name, { type: 'application/pdf' })
    };
  } catch (error: any) {
    console.error("Transfer error:", error);
    throw new Error("Pages transfer karne me problem aayi. Kripya check karein ki pages sahi hain aur files lock nahi hain.");
  }
};
