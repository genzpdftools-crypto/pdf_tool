import { GoogleGenAI } from "@google/genai";

// ---------------------------------------------------------
// 1. Helper: API Keys Management
// ---------------------------------------------------------
const getApiKeys = (): string[] => {
  // Vercel environment variable se key uthayenge
  const keysString = import.meta.env.VITE_API_KEY || process.env.API_KEY || "";

  // Comma se split karke array banayenge aur extra spaces hatayenge
  const keys = keysString.split(',').map(k => k.trim()).filter(k => k);

  if (keys.length === 0) {
    console.error("No API Keys found in environment variables.");
  }
  return keys;
};

// ---------------------------------------------------------
// 2. Helper: Retry Logic (Rotation Strategy)
// ---------------------------------------------------------
const generateContentWithRetry = async (modelName: string, params: any) => {
  const apiKeys = getApiKeys();
  let lastError = null;

  // Har ek key ke liye loop chalayenge
  for (const apiKey of apiKeys) {
    try {
      // Current key ke saath naya client banayein
      const ai = new GoogleGenAI({ apiKey });

      // Request bhejein
      const response = await ai.models.generateContent({
        model: modelName,
        ...params
      });

      // Agar success ho gaya, toh response return karein aur loop tod dein
      return response;

    } catch (error: any) {
      // Sirf last ke 4 chars dikhayenge security ke liye
      const keySuffix = apiKey.slice(-4);
      console.warn(`Key ending in ...${keySuffix} failed. Switching to next key... Error:`, error.message);

      lastError = error;
      // Continue to next key in the loop
      continue;
    }
  }

  // Agar saari keys try karne ke baad bhi fail ho gaya
  throw lastError || new Error("All API keys exhausted or failed.");
};

// ---------------------------------------------------------
// 3. Exported Function: Document Analysis
// ---------------------------------------------------------
export const analyzeDocumentImage = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    // Hum 'gemini-2.5-flash' use kar rahe hain jo fast aur stable hai
    const response = await generateContentWithRetry('gemini-2.5-flash', {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: "Analyze this document image. Tell me what type of document it is (e.g., Invoice, Contract, Report), extract the main title if visible, and give a 1-sentence summary of its likely purpose. This will help the user decide how to sort it in a PDF merger app."
          }
        ]
      }
    });

    return response?.text || "Could not analyze the image.";
  } catch (error) {
    console.error("Error analyzing image after all retries:", error);
    return "Failed to analyze the document. Please try again later.";
  }
};

// ---------------------------------------------------------
// 4. Exported Function: AI Chat Assistance
// ---------------------------------------------------------
export const getAiAssistance = async (
  prompt: string,
  history: { role: string; text: string }[]
): Promise<string> => {

  const modelName = 'gemini-2.5-flash';

  // 👇 Yahan AI ke liye updated aur advance System Prompt diya gaya hai
  const systemPrompt = `You are the highly advanced AI Assistant for 'GenzPDF', an online PDF utility website. 
Act like a smart, highly efficient, and helpful friend. Write like a human — professional but conversational, clear, direct, and natural. Do not use buzzwords or a robotic press-release tone.

CRITICAL KNOWLEDGE & RULES:
1. IDENTITY & CREATORS: Your name is the GenzPDF AI. You were proudly created by the founders of GenzPDF: **Pintu and Raushan**.
2. PLATFORM EXCLUSIVITY: When asked how to do something, ONLY explain how to do it using GenzPDF's tools. NEVER mention, recommend, or provide examples of competitors (like Adobe Acrobat, iLovePDF, Smallpdf, etc.).
3. OUR FEATURES & PAGES: You know all the features of GenzPDF. If a user asks, guide them to these tools:
   - Merge PDF: Combine multiple PDFs into one.
   - Split PDF: Extract pages or split documents.
   - Compress PDF: Reduce file size without losing quality.
   - Convert PDF: Convert to Word, JPG, PNG, TXT, etc.
   - Protect PDF: Add AES-256 encryption/passwords.
   - Unlock PDF: Remove passwords from PDFs.
   - eSign PDF: Add digital signatures to documents.
   - Visual PDF Editor: Visually edit, rearrange, or delete pages.
   - Resize Image: Resize JPG/PNG/WebP images.
4. CORE SELLING POINT: Always assure users that all processing is **100% Client-Side, Secure, Free, and requires NO uploads** to our servers. Their data never leaves their browser.
5. TEACHING STYLE: If a user asks "how" to use a tool, break the instructions into bite-sized, super-clear, step-by-step points so they can't fail. Use direct analogies if helpful.
6. FORMATTING: Be direct and concise. Use native emojis like ⚡, 📄, 🔒 to make the chat engaging. Use Markdown formatting like **bold** for emphasis, but NEVER output malformed markdown.
7. RELEVANCE: Answer exactly what the user asked, nothing more. Do not wander off-topic.`;

  try {
    const contents = [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: prompt }] }
    ];

    const response = await generateContentWithRetry(modelName, {
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    let text = response?.text || "";

    // Extract grounding sources if available (Google Search integration fallback)
    const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      const links = chunks
        .map((c: any) => c.web?.uri)
        .filter((uri: string) => uri)
        .map((uri: string) => `\nSource: ${uri}`)
        .join('');
      if (links) text += `\n\n${links}`;
    }

    return text || "I couldn't generate a response.";

  } catch (error) {
    console.error("Error getting AI assistance after all retries:", error);
    return "System overloaded. Please try again in a moment. ⚡";
  }
};
