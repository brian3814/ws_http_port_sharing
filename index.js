const { startGateway } = require('./gateway');
const { startBackend } = require('./backend');

startBackend();
startGateway();