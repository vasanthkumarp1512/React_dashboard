// List of CORS-enabled Piped instances
// Robust list of Piped and Invidious instances
const INSTANCES = [
    // Reliable instances that often support CORS
    { url: "https://pipedapi.kavin.rocks", type: "piped" },
    { url: "https://api.piped.privacy.com.de", type: "piped" },
    { url: "https://pipedapi.adminforge.de", type: "piped" },
    { url: "https://pipedapi.drgns.space", type: "piped" },
    { url: "https://api.piped.projectsegfau.lt", type: "piped" },
    { url: "https://pipedapi.moomoo.me", type: "piped" },
    { url: "https://pipedapi.smnz.de", type: "piped" },
    { url: "https://pipedapi.ducks.party", type: "piped" },
    { url: "https://inv.tux.pizza", type: "invidious" },
    { url: "https://invidious.flokinet.to", type: "invidious" },
    { url: "https://invidious.privacydev.net", type: "invidious" },
    { url: "https://vid.puffyan.us", type: "invidious" },
    { url: "https://invidious.fdn.fr", type: "invidious" },
    { url: "https://invidious.perennialteks.com", type: "invidious" },
    { url: "https://yt.artemislena.eu", type: "invidious" },
    { url: "https://invidious.protokolla.fi", type: "invidious" },
    { url: "https://invidious.drgns.space", type: "invidious" },
    { url: "https://iv.ggtyler.dev", type: "invidious" },
];

export async function fetchTranscriptClient(videoId: string): Promise<{ transcript: string | null; logs: string[] }> {
    const logs: string[] = [];
    logs.push(`[Client] Starting fetch for ${videoId}...`);

    for (const instance of INSTANCES) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

            let transcriptText: string | null = null;

            if (instance.type === "piped") {
                const response = await fetch(`${instance.url}/streams/${videoId}`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    logs.push(`[Client] ${instance.url} failed: ${response.status}`);
                    continue;
                }

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
                } else {
                    logs.push(`[Client] ${instance.url}: No subtitles found.`);
                }

            } else if (instance.type === "invidious") {
                const response = await fetch(`${instance.url}/api/v1/captions/${videoId}`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    logs.push(`[Client] ${instance.url} failed: ${response.status}`);
                    continue;
                }

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
                } else {
                    logs.push(`[Client] ${instance.url}: No captions found.`);
                }
            }

            if (transcriptText && transcriptText.length > 50) {
                logs.push(`[Client] Success from ${instance.url}`);
                return { transcript: transcriptText, logs };
            }

        } catch (err: any) {
            logs.push(`[Client] ${instance.url} error: ${err.message}`);
        }
    }

    logs.push("[Client] All instances failed.");
    return { transcript: null, logs };
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
