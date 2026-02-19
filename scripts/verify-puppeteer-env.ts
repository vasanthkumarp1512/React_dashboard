
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const VIDEO_ID = "jNQXAC9IVRw"; // Me at the zoo
const LOG_FILE = path.resolve(process.cwd(), 'puppeteer_log.txt');

function log(message) {
    console.log(message);
    fs.appendFileSync(LOG_FILE, message + '\n');
}

function parseEnvFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) return {};
        const content = fs.readFileSync(filePath, 'utf-8');
        const env = {};
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

async function fetchTranscript(videoId, cookiesStr) {
    log(`Fetching transcript for ${videoId} via Puppeteer...`);
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        // Set cookies
        if (cookiesStr) {
            log("Setting cookies...");
            const cookies = cookiesStr.split(';').map(c => {
                const parts = c.trim().split('=');
                if (parts.length >= 2) {
                    const name = parts[0].trim();
                    // Join the rest back in case value has =
                    const value = parts.slice(1).join('=').trim();
                    return {
                        name: name,
                        value: value,
                        url: 'https://www.youtube.com'
                    };
                }
                return null;
            }).filter(c => c !== null);

            await page.setCookie(...cookies);
            log(`Set ${cookies.length} cookies.`);
        }

        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

        await page.goto(`https://www.youtube.com/watch?v=${videoId}`, { waitUntil: 'networkidle2' });

        const content = await page.content();
        const title = await page.title();
        log(`Page Title: ${title}`);

        // Strategy: Scrape HTML for captionTracks
        const captionMatch = content.match(/"captionTracks":\s*(\[.*?\])/);
        if (captionMatch) {
            log("✅ Found captionTracks in HTML via Puppeteer.");
            const tracks = JSON.parse(captionMatch[1]);
            const track = tracks.find(t => t.languageCode === 'en' || t.languageCode.startsWith('en')) || tracks[0];

            if (track) {
                log(`Fetching transcript URL: ${track.baseUrl}`);
                // Use page.evaluate to fetch in context
                const xml = await page.evaluate(async (url) => {
                    const r = await fetch(url);
                    return await r.text();
                }, track.baseUrl);

                if (xml && xml.includes('<transcript>')) {
                    log("✅ Successfully fetched XML via Puppeteer page context!");
                    return xml;
                } else {
                    log("❌ Fetched XML in page context was invalid/empty.");
                }
            }
        } else {
            log("❌ No captionTracks found in Puppeteer HTML.");
            if (content.includes("verify your age")) log("Age verification detected.");
            if (content.includes("Sign in")) log("Sign in detected.");
        }

    } catch (e) {
        log(`Puppeteer error: ${e.message}`);
    } finally {
        await browser.close();
    }
    return null;
}

async function main() {
    fs.writeFileSync(LOG_FILE, '');
    const envPath = path.resolve(process.cwd(), '.env');
    const envLocalPath = path.resolve(process.cwd(), '.env.local');
    const env = { ...parseEnvFile(envPath), ...parseEnvFile(envLocalPath) };

    if (env.YOUTUBE_COOKIES) {
        const xml = await fetchTranscript(VIDEO_ID, env.YOUTUBE_COOKIES);
        if (xml) {
            log("SUCCESS!");
        } else {
            log("FAILED.");
        }
    } else {
        log("No cookies found.");
    }
}

main();
