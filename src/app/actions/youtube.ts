"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { YoutubeTranscript } from "youtube-transcript";

function extractVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

export async function summarizeVideo(url: string) {
    const videoId = extractVideoId(url);

    if (!videoId) {
        return { error: "Invalid YouTube URL. Please paste a valid YouTube video link." };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return { error: "AI service is not configured. Please contact the administrator." };
    }

    // Step 1: Fetch transcript
    let transcriptText: string;
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        if (!transcript || transcript.length === 0) {
            return { error: "No transcript available for this video. The video may not have captions enabled." };
        }
        transcriptText = transcript.map((entry) => entry.text).join(" ");
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Transcript fetch error:", message);
        return {
            error: "Could not fetch the video transcript. Make sure the video has captions/subtitles enabled.",
        };
    }

    // Step 2: Summarize with Gemini AI
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `You are an expert study assistant. I will give you the transcript of a YouTube video. Please provide:

1. **📋 Video Summary** — A clear, concise summary of the video content in 3-5 paragraphs.

2. **📝 Study Notes** — Well-organized study notes with:
   - Main topics and subtopics as headings
   - Key concepts explained clearly
   - Important definitions or terms highlighted in **bold**
   - Bullet points for easy scanning
   - Any formulas, dates, or facts clearly listed

3. **🔑 Key Takeaways** — A numbered list of the 5-8 most important things to remember.

4. **❓ Review Questions** — 5 questions that test understanding of the material.

Format the output in clean Markdown. Make it student-friendly and easy to review.

Here is the transcript:
${transcriptText.substring(0, 30000)}`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        if (!text) {
            return { error: "AI could not generate notes. Please try again." };
        }

        return {
            success: true,
            notes: text,
            videoId,
        };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Gemini AI error:", message);
        return { error: "AI processing failed. Please try again in a moment." };
    }
}
