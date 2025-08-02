import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import LoginForm from './components/LoginForm';
import ChatInterface from './components/ChatInterface';

const BACKEND_URL = 'http://10.0.0.229:3001';

function App() {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('Connecting to backend at:', BACKEND_URL);
    // Initialize socket connection
    const newSocket = io(BACKEND_URL);
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    newSocket.on('login_success', (userData) => {
      console.log('Login success:', userData);
      setUser(userData);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleLogin = (userData) => {
    console.log('Attempting login with:', userData);
    if (socket) {
      socket.emit('user_login', userData);
    } else {
      console.error('Socket not connected');
    }
  };

  const handleLogout = () => {
    setUser(null);
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Real-Time Chat Application
          </h1>
          <p className="text-muted-foreground">
            Real-time chat application
          </p>
          {isConnected ? (
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Connected
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Disconnected
            </div>
          )}
        </header>

        {!user ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <ChatInterface 
            socket={socket} 
            user={user} 
            onLogout={handleLogout}
          />
        )}
      </div>
    </div>
  );
}

export default App;

