import { YoutubeTranscript } from "youtube-transcript";

async function test() {
    try {
        const videoId = "i5WYp4wMXfc";
        console.log("Fetching transcript with youtube-transcript for:", videoId);
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        console.log("Transcript entries:", transcript.length);
        if (transcript.length > 0) {
            console.log("First entry:", transcript[0]);
            console.log("SUCCESS!");
        }
    } catch (err: any) {
        console.error("Error:", err.message);
    }
}

test();
