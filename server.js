const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Temp folder for downloads
const downloadDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

// Preview: get video title only
app.get('/preview', (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send('URL is required');

    // Use yt-dlp to get metadata JSON
    const command = `yt-dlp -j ${url}`;

    exec(command, (err, stdout, stderr) => {
        if (err) return res.status(500).send('Error fetching video info');

        try {
            const info = JSON.parse(stdout);
            const title = info.title || 'Unknown Title';
            res.json({ title });
        } catch (e) {
            res.status(500).send('Error parsing video info');
        }
    });
});

// Download video to browser
app.get('/download', (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send('URL is required');

    const tempFile = path.join(downloadDir, `video_${Date.now()}.mp4`);
    const command = `yt-dlp -f best -o "${tempFile}" ${url}`;

    exec(command, (err, stdout, stderr) => {
        if (err) return res.status(500).send('Error downloading video');

        res.download(tempFile, 'instagram_video.mp4', () => {
            fs.unlink(tempFile, () => {});
        });
    });
});

app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
