"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateStudyNotes(text: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return { error: "AI service is not configured. Please contact the administrator." };
    }

    if (!text || text.trim().length < 50) {
        return { error: "Content is too short. Please provide a full transcript or text." };
    }

    // Step 2: Summarize with Gemini AI
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `You are an expert study assistant. I will give you the transcript of a YouTube video or text. Please provide:

1. **📋 Summary** — A clear, concise summary of the content in 3-5 paragraphs.

2. **📝 Study Notes** — Well-organized study notes with:
   - Main topics and subtopics as headings
   - Key concepts explained clearly
   - Important definitions or terms highlighted in **bold**
   - Bullet points for easy scanning
   - Any formulas, dates, or facts clearly listed

3. **🔑 Key Takeaways** — A numbered list of the 5-8 most important things to remember.

4. **❓ Review Questions** — 5 questions that test understanding of the material.

Format the output in clean Markdown. Make it student-friendly and easy to review.

Here is the text/transcript:
${text.substring(0, 30000)}`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const notes = response.text();

        if (!notes) {
            return { error: "AI could not generate notes. Please try again." };
        }

        return { success: true, notes };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Gemini AI error:", message);
        return { error: "AI processing failed. Please try again in a moment." };
    }
}
