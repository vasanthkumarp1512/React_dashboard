
// List of CORS-enabled Piped instances
const PIPED_INSTANCES = [
    "https://pipedapi.kavin.rocks",
    "https://api.piped.io",
    "https://piped-api.garudalinux.org",
    "https://pipedapi.drgns.space",
    "https://pipedapi.tokhmi.xyz",
    "https://piped-api.lunar.icu",
    "https://api.piped.privacy.com.de",
    "https://pipedapi.ducks.party",
    "https://api.onemandev.net",
    "https://pipedapi.r4fo.com"
];

export async function fetchTranscriptClient(videoId: string): Promise<string | null> {
    console.log(`[Client] Attempting to fetch transcript for ${videoId}...`);

    for (const instance of PIPED_INSTANCES) {
        try {
            // Using AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout per instance

            const response = await fetch(`${instance}/streams/${videoId}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) continue;

            const data = await response.json();

            if (data.subtitles && data.subtitles.length > 0) {
                // Find English subtitles
                const track = data.subtitles.find((t: any) =>
                    t.code === 'en' ||
                    t.code.startsWith('en') ||
                    t.name?.toLowerCase().includes('english')
                ) || data.subtitles[0];

                if (track) {
                    const subResponse = await fetch(track.url);
                    const vtt = await subResponse.text();

                    if (vtt && vtt.length > 0) {
                        const cleaned = cleanVTT(vtt);
                        if (cleaned.length > 50) {
                            console.log(`[Client] Successfully fetched from ${instance}`);
                            return cleaned;
                        }
                    }
                }
            }
        } catch (err) {
            // Ignore errors and try next instance
            console.warn(`[Client] Failed to fetch from ${instance}`);
        }
    }

    console.log("[Client] All instances failed.");
    return null;
}

export function cleanVTT(vtt: string): string {
    return vtt
        // Remove VTT header
        .replace(/WEBVTT\s+/, "")
        // Remove timestamps
        .replace(/(\d{2}:)?\d{2}:\d{2}\.\d{3} --> (\d{2}:)?\d{2}:\d{2}\.\d{3}.*/g, "")
        // Remove styling tags
        .replace(/<[^>]+>/g, "")
        // Remove position/align tags
        .replace(/align:start position:0%/g, "")
        // Remove extra whitespace
        .replace(/\s+/g, " ")
        .trim();
}
