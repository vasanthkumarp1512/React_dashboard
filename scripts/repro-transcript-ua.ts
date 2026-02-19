
export { };
const VIDEO_ID = "UUheH1seQuE";

async function main() {
    console.log(`Debug advanced fetch for ${VIDEO_ID}...`);
    const watchUrl = `https://www.youtube.com/watch?v=${VIDEO_ID}`;

    // List of common User-Agents to rotate
    const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0"
    ];

    for (const ua of userAgents) {
        console.log(`Trying User-Agent: ${ua.substring(0, 50)}...`);
        try {
            const response = await fetch(watchUrl, {
                headers: {
                    "User-Agent": ua,
                    "Accept-Language": "en-US,en;q=0.9",
                },
            });
            const html = await response.text();
            const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);

            if (captionMatch) {
                const tracks = JSON.parse(captionMatch[1]);
                const track = tracks.find((t: any) => t.languageCode === 'en' || t.languageCode.startsWith('en')) || tracks[0];

                if (track && track.baseUrl) {
                    console.log("Track Base URL found.");

                    const xmlResponse = await fetch(track.baseUrl, {
                        headers: {
                            "User-Agent": ua,
                        }
                    });

                    const xml = await xmlResponse.text();
                    console.log(`XML Length with this UA: ${xml.length}`);

                    if (xml.length > 0) {
                        console.log("Success! XML Snippet:", xml.substring(0, 100));
                        return; // Success, exit
                    }
                }
            }
        } catch (e: any) {
            console.error("Error:", e.message);
        }
    }
    console.log("All attempts failed.");
}

main();
