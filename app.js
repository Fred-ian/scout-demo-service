const express = require('express');
const cluster = require('cluster');
const os = require('os');

const port = 3000;

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  console.log(`Master ${process.pid} is running`);
  console.log(`Forking for ${numCPUs} CPUs...`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    // Optional: Restart worker
    // cluster.fork();
  });
} else {
  const app = express();

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  const server = app.listen(port, () => {
    console.log(`Worker ${process.pid} started and listening on port ${port}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}
