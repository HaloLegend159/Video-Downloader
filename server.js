const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'Media Downloader API is running!' });
});

app.post('/api/get-link', async (req, res) => {
  try {
    const { url, format } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    let command;
    if (format === 'audio') {
      command = `yt-dlp -f "bestaudio" --get-url "${url}"`;
    } else {
      command = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --get-url "${url}"`;
    }

    const { stdout } = await execPromise(command);
    const downloadUrl = stdout.trim().split('\n')[0];

    res.json({
      success: true,
      downloadUrl: downloadUrl
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get download link', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
