import ytdl from "@distube/ytdl-core";
import fs from "fs";

async function test() {
    const videoId = "i5WYp4wMXfc";
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    console.log("Fetching info with ytdl-core for:", url);

    try {
        const info = await ytdl.getInfo(url);
        console.log("Title:", info.videoDetails.title);

        const captions = info.player_response.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        if (!captions || captions.length === 0) {
            console.log("No captions found in player_response");
        } else {
            console.log("Found captions:", captions.length);
            const track = captions.find((t: any) => t.languageCode === "en") || captions[0];
            console.log("Selected track:", track.baseUrl);

            // Try fetching content
            console.log("Fetching content...");
            const resp = await fetch(track.baseUrl);
            const text = await resp.text();
            console.log("Caption text length:", text.length);
            if (text.length > 0) {
                console.log("First 200 chars:", text.substring(0, 200));
            }
        }

    } catch (err: any) {
        console.error("Error:", err.message);
    }
}

test();
