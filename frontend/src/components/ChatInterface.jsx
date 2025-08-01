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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Chat Rooms</CardTitle>
              <Button
                size="sm"
                onClick={() => setShowCreateRoom(true)}
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
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={user.photo}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="w-full"
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
          <Card className="h-96 flex items-center justify-center">
            <CardContent className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Welcome to Real-Time Chat Application!</h3>
              <p className="text-muted-foreground mb-4">
                Select a chat room from the sidebar to start chatting, or create a new one.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {rooms.reduce((total, room) => total + room.userCount, 0)} users online
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {rooms.length} active rooms
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

