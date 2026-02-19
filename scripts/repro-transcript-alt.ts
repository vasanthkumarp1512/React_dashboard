
import { YoutubeTranscript } from 'youtube-transcript';

const VIDEO_ID = "UUheH1seQuE";

async function main() {
    console.log(`Attempting to fetch transcript for ${VIDEO_ID} using youtube-transcript...`);
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(VIDEO_ID);
        if (transcript && transcript.length > 0) {
            console.log("Success with youtube-transcript!");
            console.log("Snippet:", transcript[0].text);
            console.log("Total definitions:", transcript.length);
        } else {
            console.log("youtube-transcript returned empty array.");
        }
    } catch (e: any) {
        console.error("youtube-transcript error:", e.message);
        if (e.message.includes("Sign in")) {
            console.log("Error indicates blocking/sign-in required.");
        }
    }
}

main();
