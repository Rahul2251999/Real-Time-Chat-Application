import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Users, MessageCircle } from 'lucide-react';

const RoomList = ({ rooms, currentRoom, onJoinRoom }) => {
  if (rooms.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No chat rooms available</p>
        <p className="text-xs">Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rooms.map((room) => (
        <div
          key={room.id}
          className={`p-3 rounded-lg border transition-colors ${
            currentRoom?.roomId === room.id
              ? 'bg-primary/10 border-primary'
              : 'bg-card hover:bg-accent'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium truncate flex-1">{room.name}</h4>
            <Badge variant="secondary" className="ml-2">
              <Users className="w-3 h-3 mr-1" />
              {room.userCount}
            </Badge>
          </div>
          
          {room.users.length > 0 && (
            <div className="flex items-center gap-1 mb-2 overflow-hidden">
              {room.users.slice(0, 3).map((user, index) => (
                <img
                  key={index}
                  src={user.photo}
                  alt={user.name}
                  className="w-5 h-5 rounded-full border"
                  title={user.name}
                />
              ))}
              {room.users.length > 3 && (
                <span className="text-xs text-muted-foreground ml-1">
                  +{room.users.length - 3}
                </span>
              )}
            </div>
          )}
          
          <Button
            size="sm"
            variant={currentRoom?.roomId === room.id ? "secondary" : "default"}
            onClick={() => onJoinRoom(room.id)}
            className="w-full"
            disabled={currentRoom?.roomId === room.id}
          >
            {currentRoom?.roomId === room.id ? 'Current Room' : 'Join Room'}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default RoomList;

