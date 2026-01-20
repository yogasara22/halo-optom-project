import http from 'http';
import 'reflect-metadata';
import { AppDataSource } from './config/ormconfig';
import app from './app';
import { initSocket } from './sockets';
import { setSocketIO } from './services/notification.service';

const server = http.createServer(app);

// Init socket.io
// Init socket.io
const io = initSocket(server);
setSocketIO(io);

AppDataSource.initialize()
  .then(() => {
    server.listen(process.env.PORT || 4000, () => {
      console.log('Server listening on', process.env.PORT || 4000);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
