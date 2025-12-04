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

    const yt = spawn('yt-dlp', ['-j', url]);

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

    yt.stderr.on('data', chunk => {
        console.error(chunk.toString());
    });
});

// ------------------ Download endpoint ------------------
// Streams video directly to the browser
app.get('/download', (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send('URL is required');

    // yt-dlp spawns a process that writes to stdout
    const yt = spawn('yt-dlp', ['-f', 'best', '-o', '-', url], { stdio: ['ignore', 'pipe', 'pipe'] });

    res.setHeader('Content-Disposition', 'attachment; filename=instagram_video.mp4');
    res.setHeader('Content-Type', 'video/mp4');

    yt.stdout.pipe(res);

    yt.stderr.on('data', chunk => {
        console.error(chunk.toString());
    });

    yt.on('close', code => {
        console.log('Download finished');
    });
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
