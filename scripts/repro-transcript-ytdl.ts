
import ytdl from "@distube/ytdl-core";
import { DOMParser } from "xmldom";

// Polyfill for DOMParser which youtube-transcript might rely on if used internally, 
// but here we are using ytdl-core which fetches XML captions.
global.DOMParser = DOMParser;

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

            const response = await fetch(track.baseUrl);
            const xml = await response.text();

            // Simple XML parsing to text
            const text = xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            console.log("Snippet:", text.substring(0, 100));
            console.log("Total length:", text.length);
        } else {
            console.log("No caption tracks found in video info.");
        }
    } catch (e: any) {
        console.error("ytdl-core error:", e.message);
    }
}

main();
