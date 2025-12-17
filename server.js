const express = require('express');
const cors = require('cors');
const https = require('https');

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

    // Use a free API service to get download links
    const apiUrl = `https://api.cobalt.tools/api/json`;
    
    const postData = JSON.stringify({
      url: url,
      vCodec: 'h264',
      vQuality: '720',
      aFormat: format === 'audio' ? 'mp3' : 'best',
      isAudioOnly: format === 'audio'
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const apiReq = https.request(apiUrl, options, (apiRes) => {
      let data = '';

      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      apiRes.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (result.status === 'redirect' || result.status === 'stream') {
            res.json({
              success: true,
              downloadUrl: result.url
            });
          } else {
            res.status(500).json({ 
              error: 'Could not get download link', 
              details: result.text || 'Unknown error' 
            });
          }
        } catch (e) {
          res.status(500).json({ error: 'Failed to parse response' });
        }
      });
    });

    apiReq.on('error', (error) => {
      res.status(500).json({ error: 'API request failed', details: error.message });
    });

    apiReq.write(postData);
    apiReq.end();

  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
