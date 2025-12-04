const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ------------------ Preview endpoint ------------------
// Returns the video title only
app.get('/preview', (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send('URL is required');

    // yt-dlp in quiet mode, JSON output
    const yt = spawn('yt-dlp', ['--quiet', '-j', url]);

    let data = '';
    yt.stdout.on('data', chunk => data += chunk);

    yt.on('close', code => {
        try {
            const info = JSON.parse(data);
            const title = info.title || 'Unknown Title';
            res.json({ title });
        } catch (err) {
            res.status(500).send('Error parsing video info');
        }
    });

    // Only log real errors
    yt.stderr.on('data', chunk => {
        console.error("yt-dlp preview error:", chunk.toString());
    });
});

// ------------------ Download endpoint ------------------
// Streams video directly to the browser without showing progress logs
app.get('/download', (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send('URL is required');

    // yt-dlp quiet mode, output to stdout
    const yt = spawn('yt-dlp', ['--quiet', '-f', 'b', '-o', '-', url], { stdio: ['ignore', 'pipe', 'pipe'] });

    res.setHeader('Content-Disposition', 'attachment; filename=instagram_video.mp4');
    res.setHeader('Content-Type', 'video/mp4');

    yt.stdout.pipe(res);

    // Only log actual errors
    yt.stderr.on('data', chunk => {
        console.error("yt-dlp download error:", chunk.toString());
    });

    yt.on('close', code => {
        console.log('Download finished');
    });
});

// ------------------ Start server ------------------
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend running on port ${PORT}`);
});
