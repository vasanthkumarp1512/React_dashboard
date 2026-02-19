
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
            console.log("Selected track:", track.name.simpleText, track.languageCode);
            console.log("Base URL:", track.baseUrl);

            const response = await fetch(track.baseUrl);
            console.log("Fetch Status:", response.status, response.statusText);

            const xml = await response.text();
            console.log("Raw XML Snippet (first 500 chars):");
            console.log(xml.substring(0, 500));

        } else {
            console.log("No caption tracks found.");
        }
    } catch (e: any) {
        console.error("ytdl-core error:", e.message);
    }
}

main();
