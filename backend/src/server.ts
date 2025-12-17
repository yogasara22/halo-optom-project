import http from 'http';
import 'reflect-metadata';
import { AppDataSource } from './config/ormconfig';
import app from './app';
import { initSocket } from './sockets';

const server = http.createServer(app);

// Init socket.io
initSocket(server);

AppDataSource.initialize()
  .then(() => {
    server.listen(process.env.PORT || 4000, () => {
      console.log('Server listening on', process.env.PORT || 4000);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
