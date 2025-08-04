import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { LogOut, Plus, Users, MessageCircle } from 'lucide-react';
import RoomList from './RoomList';
import ChatRoom from './ChatRoom';
import CreateRoomDialog from './CreateRoomDialog';

const ChatInterface = ({ socket, user, onLogout }) => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Listen for room updates
    socket.on('rooms_updated', (updatedRooms) => {
      setRooms(updatedRooms);
    });

    socket.on('room_created', (roomData) => {
      // Automatically join the newly created room
      socket.emit('join_room', roomData.id);
    });

    socket.on('room_joined', (roomData) => {
      setCurrentRoom(roomData);
      console.log('Joined room with encryption:', !!roomData.publicKey);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      alert(error.message);
    });

    // Fetch initial rooms
    fetch('http://localhost:3001/api/rooms')
      .then(res => res.json())
      .then(data => setRooms(data))
      .catch(err => console.error('Failed to fetch rooms:', err));

    return () => {
      socket.off('rooms_updated');
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('error');
    };
  }, [socket]);

  const handleJoinRoom = (roomId) => {
    if (socket) {
      socket.emit('join_room', roomId);
    }
  };

  const handleCreateRoom = (roomName) => {
    if (socket) {
      socket.emit('create_room', { name: roomName });
      setShowCreateRoom(false);
    }
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto p-4">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Chat Rooms</CardTitle>
              </div>
              <Button
                size="sm"
                onClick={() => setShowCreateRoom(true)}
                className="shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <RoomList
              rooms={rooms}
              currentRoom={currentRoom}
              onJoinRoom={handleJoinRoom}
            />
          </CardContent>
        </Card>

        {/* User Info */}
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-12 h-12 rounded-full ring-2 ring-primary/20"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="w-full transition-all duration-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-3">
        {currentRoom ? (
          <ChatRoom
            socket={socket}
            room={currentRoom}
            user={user}
            onLeaveRoom={handleLeaveRoom}
          />
        ) : (
          <Card className="h-96 flex items-center justify-center shadow-lg">
            <CardContent className="text-center">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Welcome to Real-Time Chat!</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Select a chat room from the sidebar to start chatting, or create a new one to begin your conversation.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{rooms.reduce((total, room) => total + room.userCount, 0)} users online</span>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-medium">{rooms.length} active rooms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Room Dialog */}
      <CreateRoomDialog
        open={showCreateRoom}
        onOpenChange={setShowCreateRoom}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  );
};

export default ChatInterface;

