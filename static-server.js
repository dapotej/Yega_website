const express = require('express');
const http = require('http');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.use('/api', (req, res) => {
  const proxy = http.request(
    { hostname: 'localhost', port: 8000, path: '/api' + req.path, method: req.method, headers: { ...req.headers, host: 'localhost' } },
    (proxyRes) => { res.writeHead(proxyRes.statusCode, proxyRes.headers); proxyRes.pipe(res); }
  );
  proxy.on('error', () => res.status(502).json({ error: 'Backend unavailable' }));
  req.pipe(proxy);
});

app.use(express.static('.', { etag: false, lastModified: false }));

app.listen(5000, '0.0.0.0', () => console.log('Static + proxy server on port 5000'));
