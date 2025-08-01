import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import LoginForm from './components/LoginForm';
import ChatInterface from './components/ChatInterface';
import authService from './services/authService';

const BACKEND_URL = 'http://localhost:3001';

function App() {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const isAuthenticated = await authService.verifyToken();
        if (isAuthenticated) {
          const userData = authService.getUser();
          setUser(userData);
          initializeSocket(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const initializeSocket = (userData) => {
    const token = authService.getToken();
    const newSocket = io(BACKEND_URL, {
      auth: {
        token: token
      }
    });
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('login_success', (userData) => {
      setUser(userData);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      if (error.message === 'Authentication token required' || 
          error.message === 'Invalid or expired token') {
        authService.logout();
        setUser(null);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  };

  const handleLogin = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authService.login(userData);
      setUser(response.user);
      initializeSocket(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    if (socket) {
      socket.disconnect();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Real-Time Chat Application
          </h1>
          <p className="text-muted-foreground">
            Real-time chat application with secure authentication
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
          <LoginForm onLogin={handleLogin} isLoading={isLoading} />
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

