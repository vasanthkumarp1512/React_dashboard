
const VIDEO_ID = "jNQXAC9IVRw";

// Cobalt instances (public)
const COBALT_INSTANCES = [
    "https://api.cobalt.tools",
    "https://cobalt.nipal.dev",
    "https://cobalt.timelesslo.com"
];

async function main() {
    console.log("Verifying Cobalt instances...");
    const working = [];

    for (const instance of COBALT_INSTANCES) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            // Cobalt API: POST /api/json
            const res = await fetch(`${instance}/api/json`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    url: `https://www.youtube.com/watch?v=${VIDEO_ID}`,
                    downloadMode: "auto"
                }),
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (res.ok) {
                const data = await res.json();
                console.log(`✅ ${instance} response:`, JSON.stringify(data).substring(0, 100));
                // Cobalt usually returns a download link, not subtitles directly in JSON unless specified?
                // Actually Cobalt is for video/audio. 
                // Let's check if it returns caption tracks.
            } else {
                console.log(`❌ ${instance} (Status ${res.status})`);
            }
        } catch (e) {
            console.log(`❌ ${instance} (Error: ${e.message})`);
        }
    }
}

main();
