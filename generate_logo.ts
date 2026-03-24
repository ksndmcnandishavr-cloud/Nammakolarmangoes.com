import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function generateLogo() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: 'A beautiful minimalist logo of a mango tree with a farmer, elegant, suitable for a premium mango brand, high quality, vector style, white background',
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
      aspectRatio: '1:1',
    },
  });

  const base64EncodeString = response.generatedImages[0].image.imageBytes;
  fs.writeFileSync("public/logo.png", Buffer.from(base64EncodeString, 'base64'));
  console.log("Logo generated and saved to public/logo.png");
}

generateLogo().catch(console.error);
