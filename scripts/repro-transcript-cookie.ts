
export { };
const VIDEO_ID = "UUheH1seQuE";

async function main() {
    console.log(`Debug cookie fetch for ${VIDEO_ID}...`);
    const watchUrl = `https://www.youtube.com/watch?v=${VIDEO_ID}`;

    try {
        const response = await fetch(watchUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
                "Cookie": "CONSENT=YES+Cb.20230531-13-p0.en+FX+430",
            },
        });
        const html = await response.text();
        const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);

        if (captionMatch) {
            const tracks = JSON.parse(captionMatch[1]);
            const track = tracks.find((t: any) => t.languageCode === 'en' || t.languageCode.startsWith('en')) || tracks[0];

            if (track && track.baseUrl) {
                console.log("Track Base URL:", track.baseUrl);

                const xmlResponse = await fetch(track.baseUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Cookie": "CONSENT=YES+Cb.20230531-13-p0.en+FX+430",
                    }
                });

                const xml = await xmlResponse.text();
                console.log("XML Length:", xml.length);
                if (xml.length > 0) {
                    console.log("Success! XML Snippet:", xml.substring(0, 100));
                }
            }
        } else {
            console.log("No captionTracks found.");
        }
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

main();
