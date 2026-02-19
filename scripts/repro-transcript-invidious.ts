
export { };
const VIDEO_ID = "TckGcxwknYU";

async function main() {
    console.log(`Debug Invidious fetch for ${VIDEO_ID}...`);

    // Invidious instances
    const instances = [
        "https://inv.tux.pizza",
        "https://invidious.flokinet.to",
        "https://invidious.io.lol",
        "https://vid.uff.anze.moe",
        "https://yt.artemislena.eu"
    ];

    for (const instance of instances) {
        console.log(`Trying ${instance}...`);
        try {
            // Invidious API: /api/v1/captions/{videoId}
            // Actually, it's /api/v1/videos/{videoId} -> captions field
            // Or /api/v1/captions/{videoId}?label=English&lang=en

            // First get video info to find captions
            const response = await fetch(`${instance}/api/v1/videos/${VIDEO_ID}`);
            if (!response.ok) {
                console.log(`Failed video info: ${response.status}`);
                continue;
            }

            const data = await response.json();
            if (data.captions && data.captions.length > 0) {
                console.log(`Found ${data.captions.length} captions on ${instance}`);
                const caption = data.captions.find((c: any) => c.language === 'English' || c.label === 'English');

                if (caption) {
                    console.log(`Fetching caption: ${instance}${caption.url}`);
                    const capResp = await fetch(`${instance}${caption.url}`);
                    const vtt = await capResp.text();
                    if (vtt.length > 0) {
                        console.log("Success! VTT Snippet:", vtt.substring(0, 100));
                        return; // Success
                    }
                }
            } else {
                console.log(`No captions found on ${instance}`);
            }

        } catch (e: any) {
            console.log(`Error on ${instance}:`, e.message);
        }
    }
    console.log("All Invidious attempts failed.");
}

main();
