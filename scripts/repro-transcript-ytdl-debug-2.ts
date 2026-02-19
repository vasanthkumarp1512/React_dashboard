
import ytdl from "@distube/ytdl-core";

const VIDEO_ID = "UUheH1seQuE";

async function main() {
    console.log(`Attempting to fetch transcript for ${VIDEO_ID} using ytdl-core...`);
    try {
        const info = await ytdl.getInfo(VIDEO_ID);
        const tracks = info.player_response.captions?.playerCaptionsTracklistRenderer?.captionTracks;

        if (tracks && tracks.length > 0) {
            console.log("Found caption tracks:", tracks.length);
            const track = tracks.find(t => t.languageCode === 'en') || tracks[0];
            console.log("Base URL:", track.baseUrl);

            const headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            };

            const response = await fetch(track.baseUrl, { headers });
            console.log("Fetch Status:", response.status);
            console.log("Content-Length:", response.headers.get("content-length"));

            const xml = await response.text();
            console.log("Raw XML Length:", xml.length);
            console.log("Snippet:", xml.substring(0, 200));

        } else {
            console.log("No caption tracks found.");
        }
    } catch (e: any) {
        console.error("ytdl-core error:", e.message);
    }
}

main();
