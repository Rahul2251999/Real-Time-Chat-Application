import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Users, MessageCircle, ShieldCheck, Hash, Activity } from 'lucide-react';

const RoomList = ({ rooms, currentRoom, onJoinRoom }) => {
  if (rooms.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 opacity-50" />
        </div>
        <h3 className="font-medium mb-2">No chat rooms available</h3>
        <p className="text-sm text-muted-foreground">Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rooms.map((room) => {
        const isCurrentRoom = currentRoom?.roomId === room.id;
        const isActive = room.userCount > 0;
        
        return (
          <Card
            key={room.id}
            className={`transition-all duration-200 hover:shadow-md ${
              isCurrentRoom
                ? 'ring-2 ring-primary/20 bg-primary/5 border-primary/30'
                : 'hover:border-primary/30'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full ${
                    isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                  }`} />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Hash className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <h4 className="font-semibold truncate text-sm">{room.name}</h4>
                                  {/* Temporarily hide encryption indicator */}
              {/* {room.encrypted && (
                <ShieldCheck className="w-3 h-3 text-green-600 flex-shrink-0" title="Encrypted Room" />
              )} */}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {room.userCount}
                  </Badge>
                  {isCurrentRoom && (
                    <Badge variant="default" className="text-xs">
                      <Activity className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
              </div>
              
              {room.users.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex -space-x-2">
                    {room.users.slice(0, 4).map((user, index) => (
                      <img
                        key={index}
                        src={user.photo}
                        alt={user.name}
                        className="w-6 h-6 rounded-full border-2 border-background ring-1 ring-muted"
                        title={user.name}
                      />
                    ))}
                  </div>
                  {room.users.length > 4 && (
                    <span className="text-xs text-muted-foreground font-medium">
                      +{room.users.length - 4} more
                    </span>
                  )}
                </div>
              )}
              
              <Button
                size="sm"
                variant={isCurrentRoom ? "secondary" : "default"}
                onClick={() => onJoinRoom(room.id)}
                className="w-full transition-all duration-200"
                disabled={isCurrentRoom}
              >
                {isCurrentRoom ? (
                  <>
                    <Activity className="w-3 h-3 mr-2" />
                    Current Room
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-3 h-3 mr-2" />
                    Join Room
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RoomList;

