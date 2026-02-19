
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export async function generateContent(prompt: string): Promise<{ text: string } | { error: string }> {
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    // 1. Try Gemini
    if (geminiKey) {
        try {
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            if (text) return { text };
        } catch (error: any) {
            console.error("Gemini Error:", error.message);
            // Fallthrough to Groq if configured
        }
    }

    // 2. Try Groq
    if (groqKey) {
        try {
            const groq = new Groq({ apiKey: groqKey });
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
            });
            const text = completion.choices[0]?.message?.content;
            if (text) return { text };
        } catch (error: any) {
            console.error("Groq Error:", error.message);
        }
    }

    return { error: "AI service is not configured or failed. Please contact administrator." };
}

export async function embedText(text: string): Promise<number[] | null> {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
        console.error("Gemini API Key missing for embeddings");
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        // Use the model found in the list
        const model = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error: any) {
        console.error("Embedding Error:", error.message);
        return null;
    }
}
