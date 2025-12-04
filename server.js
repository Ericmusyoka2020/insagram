const express = require('express');
const cors = require('cors');
const ytdlp = require('yt-dlp-exec'); // <--- use this instead of spawn

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ------------------ Preview endpoint ------------------
app.get('/preview', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send('URL is required');

    try {
        const info = await ytdlp(url, {
            dumpSingleJson: true,
            quiet: true,
        });
        res.json({ title: info.title || 'Unknown Title' });
    } catch (err) {
        console.error("yt-dlp preview error:", err);
        res.status(500).send('Error fetching video info');
    }
});

// ------------------ Download endpoint ------------------
app.get('/download', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send('URL is required');

    try {
        const video = await ytdlp(url, {
            format: 'b',
            quiet: true,
            output: '-',
        });

        res.setHeader('Content-Disposition', 'attachment; filename=instagram_video.mp4');
        res.setHeader('Content-Type', 'video/mp4');
        res.send(video);

    } catch (err) {
        console.error("yt-dlp download error:", err);
        res.status(500).send('Error downloading video');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend running on port ${PORT}`);
});

