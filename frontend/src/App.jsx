import io from 'socket.io-client';
import { useState, useEffect } from 'react';

const socket = io('https://backend-vmt5.onrender.com'); // Ensure the correct server URL and port

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [activeClients, setActiveClients] = useState(0);
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!loggedIn) {
      socket.emit('login', password);
      setPassword('');
    } else {
      const newMessage = {
        body: message,
        from: 'Yo',
      };

      setMessages([...messages, newMessage]);
      socket.emit('message', message);
      setMessage('');
    }
  };

  const receiveMessage = (message) => {
    setMessages((state) => [...state, message]);
  };

  useEffect(() => {
    socket.on('message', receiveMessage);

    socket.on('activeClients', (count) => {
      setActiveClients(count);
    });

    socket.on('loginSuccess', () => {
      setLoggedIn(true);
    });

    return () => {
      socket.off('message', receiveMessage);
      socket.off('activeClients');
      socket.off('loginSuccess');
    };
  }, []);

  return (
    <div className='h-screen bg-zinc-800 text-white flex items-center justify-center'>
      <form onSubmit={handleSubmit} className="bg-zinc-900 p-10">
        <div className="flex items-center justify-center ">
          <img src="./public/logo.png" alt="Logo" className="w-20 h-20 mr-2" />
        </div>

        <h1 className='text-2xl font-bold my-2'>Private Chat by RS-DEVS</h1>

        {!loggedIn && (
          <input
            type="password"
            value={password}
            className="border-5 border-white p-2 w-full text-black"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa la contraseña"
          />
        )}

        {loggedIn && (
          <div className="flex">
            <input
              type="text"
              value={message}
              className="border-5 border-white p-2 w-full text-black"
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje"
            />
            <button type="submit" className="ml-2">Enviar</button>
          </div>
        )}

        <ul>
          {messages.map((message, i) => (
            <li
              key={i}
              className={`my-2 p-2 table rounded-md ${message.from === 'Yo' ? 'bg-black ml-auto' : 'bg-gray-500'
                }`}
            >
              <span className='text-xs text-slate-300 block'>{message.from}</span>
              <span className='text-md'>{message.body}</span>
            </li>
          ))}
        </ul>

        <div className="text-xs mt-2 text-white">
  Cantidad de clientes activos: {activeClients}
  {activeClients > 0 && (
    <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-1"></span>
  )}
</div>

      </form>
    </div>
  );
}

export default App;
