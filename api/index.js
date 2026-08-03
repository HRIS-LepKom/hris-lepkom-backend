import app from '../src/app.js';
import http from 'http';
import { initSocket } from '../src/config/socket.js';

const server = http.createServer(app);

// Inisialisasi Socket.IO
initSocket(server);

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`[DEV] Server berjalan di http://localhost:${PORT}`);
  });
}

export default server;
