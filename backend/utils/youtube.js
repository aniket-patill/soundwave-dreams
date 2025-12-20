
import YTDlpWrap from 'yt-dlp-wrap';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Determine binary name based on platform
const binaryName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
const binaryPath = path.join(__dirname, '..', 'bin', binaryName);
const tempDir = path.join(__dirname, '..', 'temp');

// Ensure temp dir exists
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const ytDlpWrap = new YTDlpWrap.default(binaryPath);

export const downloadYoutubeAudio = async (url) => {
    // Output template
    const outputTemplate = path.join(tempDir, '%(id)s.%(ext)s');

    const args = [
        url,
        '-x',
        '--audio-format', 'mp3',
        '--ffmpeg-location', ffmpegPath,
        '--write-thumbnail',
        // Convert thumbnail to jpg to ensure consistency
        '--convert-thumbnails', 'jpg',
        '-o', outputTemplate,
        '--print-json',
        '--no-playlist'
    ];

    console.log('Running yt-dlp with args:', args);

    try {
        const stdout = await ytDlpWrap.execPromise(args);

        // Parse JSON from output
        const lines = stdout.trim().split('\n');
        // Find the line that looks like JSON
        const jsonLine = lines.find(line => {
            try {
                const j = JSON.parse(line);
                return j.id && j.title;
            } catch (e) {
                return false;
            }
        });

        if (!jsonLine) {
            throw new Error('Could not parse metadata from yt-dlp output');
        }

        const metadata = JSON.parse(jsonLine);
        const videoId = metadata.id;

        // Expected paths
        const audioPath = path.join(tempDir, `${videoId}.mp3`);
        // We forced jpg conversion for thumbnails
        const coverPath = path.join(tempDir, `${videoId}.jpg`);

        // Verify files exist
        if (!fs.existsSync(audioPath)) {
            // Fallback check? sometimes it might be different if conversion failed
            console.warn('Expected audio file not found:', audioPath);
        }

        return {
            title: metadata.title,
            artist: metadata.uploader,
            album: 'Single',
            audioPath: audioPath,
            coverPath: fs.existsSync(coverPath) ? coverPath : null,
            thumbnailUrl: metadata.thumbnail,
            duration: metadata.duration
        };

    } catch (error) {
        console.error('yt-dlp error full:', error);
        console.error('yt-dlp stdout:', error.stdout);
        console.error('yt-dlp stderr:', error.stderr);
        throw error;
    }
};
