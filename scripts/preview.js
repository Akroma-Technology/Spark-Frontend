// Local preview server — mirrors Cloudflare Pages routing for the single PT-BR bundle
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const base = path.join(__dirname, '..', 'dist', 'akroma-spark', 'browser');

if (!fs.existsSync(path.join(base, 'index.html'))) {
  console.error('ERROR: build output not found at', base);
  console.error('Run `npm run build` first (or use `npm run preview` to build + serve).');
  process.exit(1);
}

app.use(express.static(base));
app.get('*', (_req, res) => res.sendFile(path.join(base, 'index.html')));

const PORT = 4201;
const HOST = '127.0.0.1';
app.listen(PORT, HOST, () => console.log(`Spark preview on http://localhost:${PORT}`));
