
export { };
const VIDEO_ID = "UUheH1seQuE";

async function main() {
    console.log(`Debug manual fetch for ${VIDEO_ID}...`);
    const watchUrl = `https://www.youtube.com/watch?v=${VIDEO_ID}`;

    try {
        const response = await fetch(watchUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            },
        });
        const html = await response.text();
        const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);

        if (captionMatch) {
            const tracks = JSON.parse(captionMatch[1]);
            const track = tracks.find((t: any) => t.languageCode === 'en' || t.languageCode.startsWith('en')) || tracks[0];

            if (track && track.baseUrl) {
                console.log("Track Base URL:", track.baseUrl);

                // Fetch XML
                const xmlResponse = await fetch(track.baseUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    }
                });

                console.log("XML Status:", xmlResponse.status);
                const xml = await xmlResponse.text();
                console.log("XML Length:", xml.length);
                console.log("XML Snippet:", xml.substring(0, 500));
            }
        } else {
            console.log("No captionTracks found.");
        }
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

main();
