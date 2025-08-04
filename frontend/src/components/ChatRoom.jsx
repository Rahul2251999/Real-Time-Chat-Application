import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Send, Users, ArrowLeft, Shield, ShieldCheck, Hash, MessageCircle } from 'lucide-react';
import { encryptMessage, isEncryptionAvailable } from '../utils/encryption';

const ChatRoom = ({ socket, room, user, onLeaveRoom }) => {
  const [messages, setMessages] = useState(room.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(room.users || []);
  const [publicKey, setPublicKey] = useState(room.publicKey || null);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    // Set initial data
    setMessages(room.messages || []);
    setOnlineUsers(room.users || []);
    setPublicKey(room.publicKey || null);
    
    // Check if encryption is available
    if (room.publicKey) {
      const available = isEncryptionAvailable(room.publicKey);
      setEncryptionEnabled(available);
      if (available) {
        console.log('RSA encryption enabled for this room');
      }
    }

    // Listen for new messages
    socket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for user join/leave events
    socket.on('user_joined', (userData) => {
      setOnlineUsers(prev => [...prev, {
        id: userData.userId,
        name: userData.userName,
        photo: userData.userPhoto
      }]);
    });

    socket.on('user_left', (userData) => {
      setOnlineUsers(prev => prev.filter(u => u.id !== userData.userId));
    });

    return () => {
      socket.off('new_message');
      socket.off('user_joined');
      socket.off('user_left');
    };
  }, [socket, room]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      let messageToSend = newMessage.trim();
      let isEncrypted = false;
      
      // Temporarily disable encryption due to compatibility issues
      // TODO: Implement proper encryption with compatible libraries
      console.log('Encryption temporarily disabled, sending unencrypted message');
      isEncrypted = false;
      
      socket.emit('send_message', { 
        text: messageToSend,
        encrypted: isEncrypted
      });
      setNewMessage('');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="h-[600px] flex flex-col shadow-lg">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLeaveRoom}
              className="lg:hidden hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Hash className="w-5 h-5 text-primary" />
                {room.roomName}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {onlineUsers.length} online
                </Badge>
                {/* Temporarily hide encryption badge */}
                {/* {encryptionEnabled && (
                  <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Encrypted
                  </Badge>
                )} */}
              </div>
            </div>
          </div>
          
          {/* Online Users */}
          <div className="hidden sm:flex items-center gap-1">
            <div className="flex -space-x-2">
              {onlineUsers.slice(0, 5).map((onlineUser) => (
                <img
                  key={onlineUser.id}
                  src={onlineUser.photo}
                  alt={onlineUser.name}
                  className="w-8 h-8 rounded-full border-2 border-background ring-1 ring-muted"
                  title={onlineUser.name}
                />
              ))}
            </div>
            {onlineUsers.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                +{onlineUsers.length - 5}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="font-medium mb-2">No messages yet</h3>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.userId === user.id ? 'flex-row-reverse' : ''
                  }`}
                >
                  <img
                    src={message.userPhoto}
                    alt={message.userName}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div
                    className={`flex-1 max-w-xs lg:max-w-md ${
                      message.userId === user.id ? 'text-right' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.userName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        message.userId === user.id
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm whitespace-pre-wrap">
                          {message.text}
                        </p>
                        {/* Temporarily hide encryption icon */}
                        {/* {encryptionEnabled && (
                          <Shield className="w-3 h-3 text-green-500" />
                        )} */}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Message Input */}
        <div className="p-4 border-t bg-muted/30">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              maxLength={500}
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="transition-all duration-200 hover:scale-105"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatRoom;

