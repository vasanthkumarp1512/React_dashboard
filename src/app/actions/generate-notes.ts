"use server";

import { generateContent } from "@/lib/ai";

export async function generateStudyNotes(text: string) {
    if (!text || text.trim().length < 50) {
        return { error: "Content is too short. Please provide a full transcript or text." };
    }

    // Step 2: Summarize with AI
    try {
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

        const result = await generateContent(prompt);

        if ('error' in result) {
            return { error: result.error };
        }

        return { success: true, notes: result.text };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("AI generation error:", message);
        return { error: "AI processing failed. Please try again in a moment." };
    }
}
