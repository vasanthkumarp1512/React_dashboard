
import fs from 'fs';

const VIDEO_ID = "TckGcxwknYU";

async function main() {
    console.log(`Debug HTML dump for ${VIDEO_ID}...`);
    const watchUrl = `https://www.youtube.com/watch?v=${VIDEO_ID}`;

    try {
        const response = await fetch(watchUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            },
        });
        const html = await response.text();
        console.log("HTML fetched. Length:", html.length);

        fs.writeFileSync("debug_youtube.html", html);
        console.log("Saved to debug_youtube.html");

        // Check for common blocking phrases
        if (html.includes("Consent")) console.log("Detected 'Consent'");
        if (html.includes("Sign in")) console.log("Detected 'Sign in'");
        if (html.includes("robot")) console.log("Detected 'robot'");
        if (html.includes("captionTracks")) console.log("Detected 'captionTracks'");

    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

main();
