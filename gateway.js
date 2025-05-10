const path = require('path');
const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const httpProxy = require('http-proxy');

const app = express();
const server = createServer(app);
const port = 3000;
// Main WebSocket server for the gateway
const wss = new WebSocketServer({ noServer: true });

// Handle direct WebSocket connections to the gateway
wss.on('connection', (ws, socket, req) => {
  console.log('New WebSocket connection to gateway');
  
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    ws.send(`Gateway received: ${message}`);
  });
});

// HTTP proxy for /api routes
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:3001',
  changeOrigin: true,
  ws: true
});

// Serve static HTML
app.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname, 'client.html'));
});

// Proxy WS upgrade for /api/ws
server.on('upgrade', (req, socket, head) => {
  // Handle WebSocket connections to the backend
  if (req.url.startsWith('/service/ws')) {
    console.log('Received connection request to /service/ws');
    proxy.ws(req, socket, head);
    return;
  }

  // handle all other upgrade requests
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

function startGateway() {
  server.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
  });
}

module.exports = { startGateway };