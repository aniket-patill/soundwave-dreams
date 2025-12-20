
import YTDlpWrap from 'yt-dlp-wrap';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine binary name based on platform
const binaryName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
const binaryPath = path.join(__dirname, '..', 'bin', binaryName);
const binDir = path.join(__dirname, '..', 'bin');

if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir);
}

async function install() {
    try {
        console.log('Checking for yt-dlp binary at:', binaryPath);
        if (!fs.existsSync(binaryPath)) {
            console.log('Downloading yt-dlp binary...');
            await YTDlpWrap.downloadFromGithub(binaryPath);

            // On Linux/Mac, ensure it's executable
            if (process.platform !== 'win32') {
                fs.chmodSync(binaryPath, '755');
            }
            console.log('Downloaded successfully.');
        } else {
            console.log('Binary exists.');
        }
    } catch (err) {
        console.error('Error downloading:', err);
    }
}

install();
