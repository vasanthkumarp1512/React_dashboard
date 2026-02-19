
// List of CORS-enabled Piped instances
// Robust list of Piped and Invidious instances
const INSTANCES = [
    // Piped Instances (High Reliability)
    { url: "https://pipedapi.kavin.rocks", type: "piped" },
    { url: "https://api.piped.privacy.com.de", type: "piped" },
    { url: "https://pipedapi.adminforge.de", type: "piped" },
    { url: "https://pipedapi.drgns.space", type: "piped" },
    { url: "https://api.piped.projectsegfau.lt", type: "piped" },
    { url: "https://pipedapi.moomoo.me", type: "piped" },
    { url: "https://pipedapi.smnz.de", type: "piped" },
    { url: "https://pipedapi.ducks.party", type: "piped" },

    // Invidious Instances (Fallback)
    { url: "https://inv.tux.pizza", type: "invidious" },
    { url: "https://invidious.flokinet.to", type: "invidious" },
    { url: "https://invidious.privacydev.net", type: "invidious" },
    { url: "https://vid.puffyan.us", type: "invidious" },
    { url: "https://invidious.fdn.fr", type: "invidious" },
    { url: "https://invidious.perennialteks.com", type: "invidious" },
    { url: "https://yt.artemislena.eu", type: "invidious" }
];

export async function fetchTranscriptClient(videoId: string): Promise<string | null> {
    console.log(`[Client] Attempting to fetch transcript for ${videoId}...`);

    for (const instance of INSTANCES) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

            let transcriptText: string | null = null;

            if (instance.type === "piped") {
                const response = await fetch(`${instance.url}/streams/${videoId}`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!response.ok) continue;

                const data = await response.json();
                if (data.subtitles && data.subtitles.length > 0) {
                    const track = data.subtitles.find((t: any) =>
                        t.code === 'en' || t.code.startsWith('en') || t.name?.toLowerCase().includes('english')
                    ) || data.subtitles[0];

                    if (track) {
                        const subRes = await fetch(track.url);
                        const vtt = await subRes.text();
                        transcriptText = cleanVTT(vtt);
                    }
                }

            } else if (instance.type === "invidious") {
                const response = await fetch(`${instance.url}/api/v1/captions/${videoId}`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!response.ok) continue;

                const data = await response.json();
                if (data.captions && data.captions.length > 0) {
                    const track = data.captions.find((t: any) =>
                        t.languageCode === 'en' || t.languageCode.startsWith('en')
                    ) || data.captions[0];

                    if (track) {
                        const subRes = await fetch(`${instance.url}${track.url}`);
                        const vtt = await subRes.text();
                        transcriptText = cleanVTT(vtt);
                    }
                }
            }

            if (transcriptText && transcriptText.length > 50) {
                console.log(`[Client] Successfully fetched from ${instance.url} (${instance.type})`);
                return transcriptText;
            }

        } catch (err) {
            // console.warn(`[Client] Failed ${instance.url}`);
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
