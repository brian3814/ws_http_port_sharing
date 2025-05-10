const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const server = createServer(app);
const port = 3001;

// WebSocket server for proxied connections
const wss = new WebSocketServer({ 
  server,
  path: '/service/ws'
});

wss.on('connection', (ws) => {
  console.log('New WebSocket connection to backend');
  
  ws.on('message', (message) => {
    console.log('Backend received:', message.toString());
    ws.send(`Backend received: ${message}`);
  });

  ws.emit('Hello from backend');
});

app.get('/api', (req, res) => {
  res.send({msg: 'Hello from backend'});
});

function startBackend() {
  server.listen(port, () => {
    console.log(`Backend service running on port ${port}`);
  });
}

module.exports = { startBackend };
