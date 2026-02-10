"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Innertube, UniversalCache } from "youtubei.js";

// Initialize YouTube clients lazily
let youtube: Innertube | null = null;
let youtubeAndroid: Innertube | null = null;

async function getYoutubeClient(type: "WEB" | "ANDROID" = "WEB") {
    if (type === "ANDROID") {
        if (!youtubeAndroid) {
            youtubeAndroid = await Innertube.create({
                cache: new UniversalCache(false),
                generate_session_locally: true,
                client_type: "ANDROID",
            });
        }
        return youtubeAndroid;
    }

    if (!youtube) {
        youtube = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true,
        });
    }
    return youtube;
}

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

    // Step 1: Fetch transcript with retries
    let transcriptText: string = "";
    let fetchError: string = "";

    try {
        // Strategy 1: Default Web Client
        try {
            console.log("Strategy 1: Fetching with WEB client...");
            const yt = await getYoutubeClient("WEB");
            const info = await yt.getInfo(videoId);
            const transcriptData = await info.getTranscript();

            if (transcriptData && transcriptData.transcript) {
                transcriptText = transcriptData.transcript.content?.body?.initial_segments
                    .map(segment => segment.snippet.text)
                    .join(" ") ?? "";
            }
        } catch (err) {
            console.log("Web client failed, trying Android...");
        }

        // Strategy 2: Android Client (fallback)
        if (!transcriptText) {
            try {
                console.log("Strategy 2: Fetching with ANDROID client...");
                const ytAndroid = await getYoutubeClient("ANDROID");
                const info = await ytAndroid.getInfo(videoId);
                const transcriptData = await info.getTranscript();

                if (transcriptData && transcriptData.transcript) {
                    transcriptText = transcriptData.transcript.content?.body?.initial_segments
                        .map(segment => segment.snippet.text)
                        .join(" ") ?? "";
                }
            } catch (err) {
                console.log("Android client failed...");
            }
        }

        // Strategy 3: Manual Fallback (ytInitialPlayerResponse)
        if (!transcriptText) {
            console.log("Strategy 3: Manual extraction...");
            const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
            const response = await fetch(watchUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept-Language": "en-US,en;q=0.9",
                },
            });
            const html = await response.text();

            // Try to find the caption tracks in the HTML
            const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
            if (captionMatch) {
                const tracks = JSON.parse(captionMatch[1]);
                const track = tracks.find((t: any) => t.languageCode === 'en') || tracks[0];
                if (track && track.baseUrl) {
                    const transcriptResp = await fetch(track.baseUrl);
                    const xml = await transcriptResp.text();
                    transcriptText = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
                }
            }
        }

        if (!transcriptText || transcriptText.trim().length < 50) {
            throw new Error("Transcript empty or too short");
        }

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Transcript fetch error:", message);
        fetchError = message;
    }

    if (!transcriptText) {
        if (fetchError.includes("No transcript") || fetchError.includes("empty")) {
            return {
                error: "This video doesn't have captions/subtitles available. Please try a different video.",
            };
        }
        return {
            error: "Could not fetch the video transcript. It might be age-restricted or disabled. Try a different video.",
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
