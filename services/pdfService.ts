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

export const imagesToPdf = async (files: File[]): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();

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

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  return await pdfDoc.save();
};

export const createPdfUrl = (pdfBytes: Uint8Array): string => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
};
