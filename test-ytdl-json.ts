import ytdl from "@distube/ytdl-core";

async function test() {
    const videoId = "i5WYp4wMXfc";
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    console.log("Fetching info with ytdl-core for:", url);

    try {
        const info = await ytdl.getInfo(url);

        const captions = info.player_response.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        if (!captions || captions.length === 0) {
            console.log("No captions found");
            return;
        }

        const track = captions.find((t: any) => t.languageCode === "en") || captions[0];
        console.log("Base URL:", track.baseUrl.substring(0, 50) + "...");

        // Try fetching with fmt=json3
        const jsonUrl = track.baseUrl + "&fmt=json3";
        console.log("Fetching JSON3 from:", jsonUrl.substring(0, 50) + "...");

        const resp = await fetch(jsonUrl);
        const text = await resp.text();
        console.log("JSON3 length:", text.length);
        if (text.length > 0) {
            console.log("First 200 chars:", text.substring(0, 200));
        } else {
            console.log("JSON3 returned empty.");
        }

    } catch (err: any) {
        console.error("Error:", err.message);
    }
}

test();
