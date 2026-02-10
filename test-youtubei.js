const { Innertube, UniversalCache } = require("youtubei.js");

async function test() {
    try {
        console.log("Initializing Innertube...");
        const youtube = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true,
        });

        const videoId = "UUheH1seQuE";
        console.log("Fetching info for:", videoId);

        const info = await youtube.getInfo(videoId);
        console.log("Video title:", info.basic_info.title);

        console.log("Fetching transcript...");
        const transcriptData = await info.getTranscript();

        if (!transcriptData || !transcriptData.transcript) {
            console.log("No transcript data found");
            return;
        }

        const transcriptText = transcriptData.transcript.content.body.initial_segments
            .map(segment => segment.snippet.text)
            .join(" ");

        console.log("\nSUCCESS!");
        console.log("Transcript length:", transcriptText.length);
        console.log("First 200 chars:", transcriptText.substring(0, 200));

    } catch (err) {
        console.error("FAILED:", err.message);
        if (err.info) console.error("Error info:", err.info);
    }
}

test();
