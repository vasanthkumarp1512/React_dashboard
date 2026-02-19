"use server";

import { generateContent } from "@/lib/ai";
import { Innertube, UniversalCache } from "youtubei.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Initialize YouTube clients lazily
let youtube: Innertube | null = null;
let youtubeAndroid: Innertube | null = null;

async function getYoutubeClient(type: "WEB" | "ANDROID" = "WEB") {
    if (type === "ANDROID") {
        if (!youtubeAndroid) {
            youtubeAndroid = await Innertube.create({
                cache: new UniversalCache(false),
                generate_session_locally: true,
                client_type: "ANDROID" as any,
            });
        }
        return youtubeAndroid;
    }

    if (!youtube) {
        youtube = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true,
            cookie: process.env.YOUTUBE_COOKIES,
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

export async function summarizeVideo(url: string, manualTranscript?: string) {
    if (!process.env.GEMINI_API_KEY) {
        return { error: "Gemini API Key is missing. Please add it to your .env file." };
    }

    const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
        return { error: "Invalid YouTube URL. Please use a valid video link." };
    }

    // Step 1: Fetch transcript (or use provided one)
    let transcriptText: string = "";
    let fetchError: string = "";

    if (manualTranscript && manualTranscript.length > 50) {
        console.log("Using manual/client-side transcript...");
        transcriptText = manualTranscript;
    } else {
        try {
            try {
                // Strategy 0: Python Fallback (Most Robust)
                console.log("Strategy 0: Python Native Client...");
                const { stdout } = await execAsync(`python scripts/fetch_transcript.py ${videoId}`);
                if (stdout && stdout.trim().length > 50) {
                    transcriptText = stdout.trim();
                    console.log("Python strategy successful!");
                }
            } catch (pyErr) {
                console.log("Python strategy failed, falling back...");
            }

            if (!transcriptText) {
                try {
                    // Strategy 1: Default Web Client
                    console.log("Strategy 1: Fetching with WEB client...");
                    const yt = await getYoutubeClient("WEB");
                    const info = await yt.getInfo(videoId);
                    const transcriptData = await info.getTranscript();

                    if (transcriptData && transcriptData.transcript) {
                        transcriptText = transcriptData.transcript.content?.body?.initial_segments
                            .map((segment: any) => segment.snippet.text)
                            .join(" ") ?? "";
                    }
                } catch (err) {
                    console.log("Web client failed, trying Android...");
                }
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

            // Strategy 3: Manual Fallback (Robust Scraping)
            if (!transcriptText) {
                console.log("Strategy 3: Manual extraction...");
                try {
                    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
                    const headers: HeadersInit = {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept-Language": "en-US,en;q=0.9",
                    };

                    if (process.env.YOUTUBE_COOKIES) {
                        console.log("Using provided YouTube cookies for authentication...");
                        headers["Cookie"] = process.env.YOUTUBE_COOKIES;
                    }

                    const response = await fetch(watchUrl, { headers });
                    const html = await response.text();

                    const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
                    if (captionMatch) {
                        try {
                            const tracks = JSON.parse(captionMatch[1]);
                            // Prioritize English, but take the first available if not found
                            const track = tracks.find((t: any) => t.languageCode === 'en' || t.languageCode.startsWith('en')) || tracks[0];

                            if (track && track.baseUrl) {
                                console.log(`Fetching manual transcript from track: ${track.name?.simpleText} (${track.languageCode})`);
                                const transcriptResp = await fetch(track.baseUrl);
                                const xml = await transcriptResp.text();

                                // Simple but effective XML parsing for YouTube transcripts
                                transcriptText = xml.replace(/<[^>]+>/g, " ")
                                    .replace(/&amp;#39;/g, "'")
                                    .replace(/&amp;quot;/g, '"')
                                    .replace(/\s+/g, " ")
                                    .trim();
                            }
                        } catch (e) {
                            console.error("Failed to parse captionTracks JSON:", e);
                        }
                    } else {
                        console.log("No captionTracks found in HTML.");
                    }
                } catch (e) {
                    console.error("Manual strategy failed:", e);
                }
            }

            // Strategy 4: Third-Party APIs (Piped/Invidious)
            if (!transcriptText) {
                console.log("Strategy 4: Third-party APIs...");
                const instances = [
                    "https://pipedapi.kavin.rocks",
                    "https://api.piped.io",
                    "https://piped-api.garudalinux.org"
                ];

                for (const instance of instances) {
                    try {
                        const response = await fetch(`${instance}/streams/${videoId}`);
                        if (!response.ok) continue;
                        const data = await response.json();
                        if (data.subtitles && data.subtitles.length > 0) {
                            const track = data.subtitles.find((t: any) => t.code === 'en' || t.code.startsWith('en')) || data.subtitles[0];
                            if (track) {
                                const subResponse = await fetch(track.url);
                                const vtt = await subResponse.text();
                                // Simple VTT cleanup
                                transcriptText = vtt.replace(/WEBVTT/g, "")
                                    .replace(/(\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3})/g, "")
                                    .replace(/<[^>]+>/g, "")
                                    .replace(/\s+/g, " ")
                                    .trim();
                                if (transcriptText.length > 50) break;
                            }
                        }
                    } catch (e) {
                        console.error(`Piped instance ${instance} failed:`, e);
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
    }

    if (!transcriptText) {
        // Return a more helpful error message
        return {
            error: "We couldn't fetch the transcript for this video. Use the 'Paste Transcript' tab to paste it manually.",
        };
    }

    // Step 2: Summarize with AI
    try {
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

        const result = await generateContent(prompt);

        if ('error' in result) {
            return { error: result.error };
        }

        return {
            success: true,
            notes: result.text,
            videoId,
        };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("AI generation error:", message);
        return { error: "AI processing failed. Please try again in a moment." };
    }
}
