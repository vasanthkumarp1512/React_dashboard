async function test() {
    const videoId = "UUheH1seQuE";
    // Using a reliable public Invidious instance
    const invidiousUrl = `https://invidious.jing.rocks/api/v1/captions/${videoId}`;

    console.log("Fetching from Invidious:", invidiousUrl);
    const response = await fetch(invidiousUrl);

    if (!response.ok) {
        console.log("Invidious error:", response.status);
        const text = await response.text();
        console.log("Response:", text);
        return;
    }

    const captions = await response.json();
    console.log("Found captions:", captions.captions.length);

    // Get English captions
    const track = captions.captions.find((c: any) => c.languageCode === "en") || captions.captions[0];
    const url = `https://invidious.jing.rocks${track.url}`;

    console.log("Fetching VTT from:", url);
    const vttResp = await fetch(url);
    const vttText = await vttResp.text();

    console.log("VTT length:", vttText.length);
    console.log("First 200 chars:", vttText.substring(0, 200));

    // Parse VTT cleanly
    const cleanText = vttText
        .split("\n")
        .filter(line => !line.match(/-->/) && line.trim().length > 0 && !line.match(/^\d+$/))
        .join(" ")
        .replace(/WEBVTT/g, "")
        .replace(/Files are available under the CC.*/g, "")
        .trim();

    console.log("\nClean text length:", cleanText.length);
    console.log("Clean text start:", cleanText.substring(0, 200));
}

test();
