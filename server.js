const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());

app.get("/download", (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: "No URL provided" });

    const tmpFile = path.join(__dirname, `${uuidv4()}.mp4`);
    const command = `yt-dlp -f best -o "${tmpFile}" "${videoUrl}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error("yt-dlp error:", stderr || error.message);
            return res.status(500).json({ error: "Failed to download video" });
        }

        // Stream the downloaded file
        res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
        res.setHeader('Content-Type', 'video/mp4');

        const readStream = fs.createReadStream(tmpFile);
        readStream.pipe(res);

        readStream.on('close', () => {
            fs.unlink(tmpFile, () => {}); // Delete temp file after streaming
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
