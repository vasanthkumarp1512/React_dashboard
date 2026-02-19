async function test() {
    const videoId = "UUheH1seQuE";
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

    console.log("Fetching page...");
    const response = await fetch(watchUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
        },
    });

    const html = await response.text();
    console.log("Page length:", html.length);

    // Look for ytInitialPlayerResponse
    const playerResponseMatch = html.match(/var ytInitialPlayerResponse = ({.*?});/s);
    if (!playerResponseMatch) {
        console.log("No ytInitialPlayerResponse found");
        // Try looking inside window["ytInitialPlayerResponse"]
        const jsonMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
        if (!jsonMatch) {
            console.log("No player response found in any format");
            process.exit(1);
        }
    }

    const playerData = JSON.parse(playerResponseMatch ? playerResponseMatch[1] : (html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/)![1]));

    if (!playerData.captions || !playerData.captions.playerCaptionsTracklistRenderer) {
        console.log("No captions found in player data");
        process.exit(1);
    }

    const tracks = playerData.captions.playerCaptionsTracklistRenderer.captionTracks;
    console.log("Found", tracks.length, "tracks");
    console.log("Track 1:", tracks[0].baseUrl);

    // Try fetching the transcript
    console.log("Fetching transcript...");
    const transcriptResp = await fetch(tracks[0].baseUrl);
    const transcriptXml = await transcriptResp.text();
    console.log("Transcript length:", transcriptXml.length);
    if (transcriptXml.length > 0) {
        console.log("First 200 chars:", transcriptXml.substring(0, 200));
    }

    process.exit(0);
}

test();

export { };
