
import { Innertube, UniversalCache } from "youtubei.js";
import fs from 'fs';
import path from 'path';

const VIDEO_ID = "jNQXAC9IVRw"; // Me at the zoo
const LOG_FILE = path.resolve(process.cwd(), 'android_cookie_log.txt');

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

async function main() {
    fs.writeFileSync(LOG_FILE, '');
    const envPath = path.resolve(process.cwd(), '.env');
    const envLocalPath = path.resolve(process.cwd(), '.env.local');
    const env = { ...parseEnvFile(envPath), ...parseEnvFile(envLocalPath) };
    const cookies = env.YOUTUBE_COOKIES;

    if (!cookies) {
        log("❌ No YOUTUBE_COOKIES found.");
        return;
    }

    log("Testing Innertube ANDROID client with cookies...");

    try {
        const yt = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true,
            client_type: "ANDROID" as any,
            cookie: cookies
        });

        const info = await yt.getInfo(VIDEO_ID);
        const transcriptData = await info.getTranscript();

        if (transcriptData && transcriptData.transcript) {
            const text = transcriptData.transcript.content?.body?.initial_segments
                .map((segment: any) => segment.snippet.text)
                .join(" ") ?? "";

            if (text.length > 50) {
                log("✅ ANDROID + Cookies Success!");
                log(`Preview: ${text.substring(0, 100)}...`);
            } else {
                log("❌ ANDROID + Cookies returned empty transcript.");
            }
        } else {
            log("❌ ANDROID + Cookies: No transcript found.");
        }

    } catch (e: any) {
        log(`❌ ANDROID + Cookies Error: ${e.message}`);
    }
}

main();
