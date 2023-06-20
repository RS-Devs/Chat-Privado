import express from "express";
import { Server as SocketServer } from 'socket.io'
import http from 'http'

const app = express()
const server = http.createServer(app)
const io = new SocketServer(server)

let activeClients = 0;
let chatPassword = 'password123'; // Contraseña del chat

io.on('connection', socket => {
  activeClients++;
  console.log(`Cliente conectado. Total de clientes activos: ${activeClients}`);
  io.sockets.emit('activeClients', activeClients);

  socket.on('login', (password) => {
    if (password === chatPassword) {
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

server.listen(3000)
console.log('Server listening on port 3000', 3000)
