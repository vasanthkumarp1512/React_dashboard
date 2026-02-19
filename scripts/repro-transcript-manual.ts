
export { };
const VIDEO_ID = "TckGcxwknYU";

async function main() {
    console.log(`Attempting manual scrape for ${VIDEO_ID}...`);
    const watchUrl = `https://www.youtube.com/watch?v=${VIDEO_ID}`;

    try {
        const response = await fetch(watchUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            },
        });
        const html = await response.text();
        console.log("HTML fetched. Length:", html.length);

        const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
        if (captionMatch) {
            console.log("Found captionTracks JSON!");
            try {
                const tracks = JSON.parse(captionMatch[1]);
                console.log("Tracks found:", tracks.length);
                const track = tracks.find((t: any) => t.languageCode === 'en' || t.languageCode.startsWith('en')) || tracks[0];

                if (track && track.baseUrl) {
                    console.log(`Fetching manual transcript from track: ${track.name?.simpleText} (${track.languageCode})`);
                    console.log("Base URL:", track.baseUrl);
                    const transcriptResp = await fetch(track.baseUrl);
                    const xml = await transcriptResp.text();
                    console.log("Transcript XML Length:", xml.length);
                    const text = xml.replace(/<[^>]+>/g, " ")
                        .replace(/&#39;/g, "'")
                        .replace(/&quot;/g, '"')
                        .replace(/\s+/g, " ")
                        .trim();
                    console.log("Extracted Snippet:", text.substring(0, 100));
                }
            } catch (e) {
                console.error("Failed to parse captionTracks JSON:", e);
            }
        } else {
            console.log("No captionTracks found in HTML.");
        }
    } catch (e: any) {
        console.error("Manual scrape error:", e.message);
    }
}

main();
