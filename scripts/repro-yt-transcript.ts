
export { };
const { YoutubeTranscript } = require('youtube-transcript');

const VIDEO_ID = "jNQXAC9IVRw"; // Me at the zoo
const VIDEO_ID_2 = "TckGcxwknYU"; // The user's video

async function main() {
    console.log("Testing youtube-transcript...");

    try {
        console.log(`Fetching transcript for ${VIDEO_ID}...`);
        const transcript = await YoutubeTranscript.fetchTranscript(VIDEO_ID);

        if (transcript && transcript.length > 0) {
            console.log("✅ Transcript found:", transcript.length, "lines");
            console.log("First line:", transcript[0].text);
        } else {
            console.log("❌ No transcript found.");
        }

    } catch (e) {
        console.log("❌ Error:", e.message);
    }

    try {
        console.log(`\nFetching transcript for ${VIDEO_ID_2} (User's video)...`);
        const transcript = await YoutubeTranscript.fetchTranscript(VIDEO_ID_2);

        if (transcript && transcript.length > 0) {
            console.log("✅ Transcript found:", transcript.length, "lines");
            console.log("First line:", transcript[0].text);
        } else {
            console.log("❌ No transcript found.");
        }

    } catch (e) {
        console.log("❌ Error:", e.message);
    }
}

main();
