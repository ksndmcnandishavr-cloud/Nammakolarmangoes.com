import { GoogleGenAI } from "@google/genai";

async function generateFeaturedAssets() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  console.log("Generating high-quality orchard image...");
  const orchardResponse = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: { parts: [{ text: "Vibrant mango orchard in Kolar, Karnataka, during golden hour, 4k resolution, cinematic lighting, lush green trees with golden mangoes hanging, traditional Indian farm landscape" }] },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "1K"
      }
    }
  });

  let orchardBase64 = "";
  for (const part of orchardResponse.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      orchardBase64 = part.inlineData.data;
      break;
    }
  }

  console.log("Generating close-up mango image...");
  const mangoResponse = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: { parts: [{ text: "Close-up of a perfectly ripe Mallika mango with water droplets, on a wooden rustic table, soft morning light, 4k resolution, hyper-realistic" }] },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      }
    }
  });

  let mangoBase64 = "";
  for (const part of mangoResponse.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      mangoBase64 = part.inlineData.data;
      break;
    }
  }

  return { orchardBase64, mangoBase64 };
}

// I'll use these in the App.tsx
