import http from 'http';
import Hapi from 'hapi';

// Compatibility patch for Node 18+: prevent premature stream close from aborting Hapi request lifecycle
const origOn = http.IncomingMessage.prototype.on;
http.IncomingMessage.prototype.on = function (event, listener) {
  if (event === 'close') {
    const wrapped = function (...args) {
      if (this.complete && !this.aborted) {
        return;
      }
      return listener.apply(this, args);
    };
    return origOn.call(this, event, wrapped);
  }
  return origOn.call(this, event, listener);
};

const server = new Hapi.Server({
  host: '127.0.0.1',
  port: '8080',
  routes: {
    cors: {
      origin: ['*'], // Explicitly allow all origins (bypasses browser blocks)
      headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match'], 
      additionalHeaders: ['cache-control', 'x-requested-with']
    }
  }
});

async function main() {
  await server.register([{
    plugin: require('./shifts-mock-api'),
    routes: { prefix: '/shifts' },
  }]);

  await server.start();
  console.info(`✅  API server is listening at ${server.info.uri.toLowerCase()}`);
}

main();