import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function detectAIImage(base64Image: string) {
    if (!API_KEY) {
        return {
            isAI: false,
            confidence: 0,
            analysis: "Gemini API key is missing. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local",
            error: true
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Remove the data area if present
        const base64Data = base64Image.split(",")[1] || base64Image;

        const prompt = `Analyze this image of a shipping package/parcel. 
        Determine if this image is likely to be real (human-captured) or AI-generated.
        Look for common AI artifacts like:
        1. Warped or nonsensical text on labels.
        2. Inconsistent lighting or shadows.
        3. Overly smooth textures or "plastic" look.
        4. Distorted hands or background elements.
        5. Inconsistent geometry of the box/parcel.

        Return your analysis in JSON format:
        {
            "isAI": boolean,
            "confidence": number (0-100),
            "reasoning": "Brief explanation of your findings in Indonesian language"
        }`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up the response if it's wrapped in triple backticks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : text;

        const data = JSON.parse(jsonStr);
        return {
            isAI: data.isAI,
            confidence: data.confidence,
            analysis: data.reasoning,
            error: false
        };
    } catch (error: any) {
        console.error("AI Detection Error:", error);
        return {
            isAI: false,
            confidence: 0,
            analysis: "Gagal menganalisis gambar: " + error.message,
            error: true
        };
    }
}
