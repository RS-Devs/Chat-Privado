import express from "express";
import { Server as SocketServer } from 'socket.io';
import http from 'http';
import cors from 'cors'; // Import the cors package

const app = express();
app.use(cors()); // Use the cors middleware

const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:5173", // Allow requests from this origin
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
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});
