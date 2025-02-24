import express from "express";
import { Server as SocketServer } from 'socket.io';
import http from 'http';
import cors from 'cors';

const app = express();
app.use(cors());

// Serve static files with correct MIME type
app.use(express.static('frontend/dist', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "https://chat-privado.onrender.com",
    methods: ["GET", "POST"]
  }
});

let activeClients = 0;
let chatPassword = 'password123'; // Contraseña del chat

io.on('connection', socket => {
  activeClients++;
  console.log(`Cliente conectado. Total de clientes activos: ${activeClients}`);
  io.sockets.emit('activeClients', activeClients);

  socket.on('login', (password) => {
    if (password === chatPassword) {
      socket.authenticated = true; // Marcar el socket como autenticado
      socket.emit('loginSuccess');
    }
  });

  socket.on('message', (body) => {
    if (socket.authenticated) {
      console.log(body);
      // Almacenar el mensaje en la base de datos

      // Enviar el mensaje a todos los clientes
      socket.broadcast.emit('message', {
        body,
        from: socket.id.slice(6)
      });
    }
  });

  socket.on('disconnect', () => {
    activeClients--;
    console.log(`Cliente desconectado. Total de clientes activos: ${activeClients}`);
    io.sockets.emit('activeClients', activeClients);
  });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));

