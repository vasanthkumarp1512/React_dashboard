
import fs from 'fs';
import path from 'path';
import { Innertube, UniversalCache } from "youtubei.js";

export { };
const VIDEO_ID = "jNQXAC9IVRw"; // "Me at the zoo"
const LOG_FILE = path.resolve(process.cwd(), 'verification_log.txt');

function log(message: string) {
    console.log(message);
    fs.appendFileSync(LOG_FILE, message + '\n');
}

function parseEnvFile(filePath: string): Record<string, string> {
    try {
        if (!fs.existsSync(filePath)) return {};
        const content = fs.readFileSync(filePath, 'utf-8');
        const env: Record<string, string> = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
                    value = value.replace(/\\n/gm, '\n');
                }
                env[key] = value.replace(/(^['"]|['"]$)/g, '').trim();
            }
        });
        return env;
    } catch (e) {
        log(`Error reading ${filePath}: ${e}`);
        return {};
    }
}

async function testInnertube(cookies: string) {
    log("\n--- Testing Innertube (Strategy 1) WITH COOKIES ---");
    try {
        const yt = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true,
            cookie: cookies
        });
        const info = await yt.getInfo(VIDEO_ID);
        const transcriptData = await info.getTranscript();

        if (transcriptData && transcriptData.transcript) {
            const text = transcriptData.transcript.content?.body?.initial_segments
                .map((segment: any) => segment.snippet.text)
                .join(" ") ?? "";
            if (text.length > 50) {
                log("✅ Innertube Success!");
                log(`Transcript preview: ${text.substring(0, 100)}...`);
            } else {
                log("❌ Innertube returned empty/short transcript.");
            }
        } else {
            log("❌ Innertube: No transcript data found.");
        }
    } catch (e: any) {
        log(`❌ Innertube Failed: ${e.message}`);
    }
}

async function main() {
    fs.writeFileSync(LOG_FILE, ''); // Clear log

    const envPath = path.resolve(process.cwd(), '.env');
    const envLocalPath = path.resolve(process.cwd(), '.env.local');

    const env = { ...parseEnvFile(envPath), ...parseEnvFile(envLocalPath) };
    const cookies = env.YOUTUBE_COOKIES;

    if (!cookies) {
        log("❌ YOUTUBE_COOKIES not found in .env or .env.local");
        return;
    }

    log("✅ YOUTUBE_COOKIES found.");
    log(`Cookies length: ${cookies.length}`);
    log(`Cookies preview: ${cookies.substring(0, 20)}...`);

    if (!cookies.includes('=')) {
        log("⚠️ WARNING: Cookies do not look like key=value pairs. Please check the format.");
    }

    // Run Innertube test first
    await testInnertube(cookies);

    log("\n--- Verifying Manual Fallback (Strategy 3) ---");

    const watchUrl = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
    log(`Fetching video: ${watchUrl}`);

    try {
        const headers: HeadersInit = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            "Cookie": cookies
        };

        const response = await fetch(watchUrl, { headers });
        const html = await response.text();
        log(`Video Page Response Status: ${response.status}`);

        // Check for captionTracks
        const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);

        if (captionMatch) {
            log("✅ Found 'captionTracks' in HTML response.");
            const tracks = JSON.parse(captionMatch[1]);

            log(`Found ${tracks.length} caption tracks.`);

            const track = tracks.find((t: any) => t.languageCode === 'en' || t.languageCode.startsWith('en')) || tracks[0];

            if (track && track.baseUrl) {
                log(`Attempting to fetch transcript from: ${track.name?.simpleText} (${track.languageCode})`);
                log(`URL: ${track.baseUrl.substring(0, 50)}...`);

                // Match src/app/actions/youtube.ts: 2nd fetch has no headers (or minimal)
                // TRYING WITH UA
                const xmlResponse = await fetch(track.baseUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    }
                });
                const xml = await xmlResponse.text();
                log(`Transcript Response Status: ${xmlResponse.status}`);

                if (xml.length > 0 && xml.includes("<transcript>")) {
                    log("✅ Successfully fetched transcript XML!");
                    log(`XML Length: ${xml.length}`);
                    log(`Preview: ${xml.substring(0, 200).replace(/\n/g, ' ')}`);
                } else {
                    log("❌ Fetched XML but it looks invalid or empty.");
                    log(`Response start: ${xml.substring(0, 200)}`);
                    if (xml.length === 0) log("Response is completely empty.");
                }
            } else {
                log("❌ Could not find a valid track URL in the captionTracks.");
            }
        } else {
            log("❌ 'captionTracks' NOT found in HTML.");
            if (html.includes("blocked automated captions")) {
                log("Detected specific 'blocked automated captions' message.");
            }
            if (html.includes("Sign in to confirm your age")) {
                log("Detected age verification requirement.");
            }
        }

    } catch (e: any) {
        log(`❌ Error during fetch: ${e.message}`);
    }
}

main();
