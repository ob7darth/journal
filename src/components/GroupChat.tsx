import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Wifi, WifiOff } from 'lucide-react';
import { chatService, ChatMessage, ChatUser } from '../services/ChatService';

const GroupChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set up chat service callbacks
    chatService.onMessage((message) => {
      setMessages(prev => [...prev, message]);
    });

    chatService.onUsers((userList) => {
      setUsers(userList);
    });

    chatService.onConnection((connected) => {
      setIsConnected(connected);
      setIsConnecting(false);
    });

    // Try to connect to server (will fall back to demo mode if server unavailable)
    setIsConnecting(true);
    chatService.connectToServer().catch(() => {
      // Fallback to demo mode
      setIsConnected(true);
      setIsConnecting(false);
    });

    // Load initial data
    setMessages(chatService.getMessages());
    setUsers(chatService.getUsers());

    return () => {
      chatService.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinChat = async () => {
    if (userName.trim()) {
      try {
        await chatService.joinChat(userName.trim());
        setIsJoined(true);
      } catch (error) {
        console.error('Failed to join chat:', error);
        alert('Failed to join chat. Please try again.');
      }
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const messageType = newMessage.toLowerCase().includes('pray') ? 'prayer' : 
                           newMessage.toLowerCase().includes('encourage') || newMessage.toLowerCase().includes('bless') ? 'encouragement' : 
                           'message';
        
        await chatService.sendMessage(newMessage.trim(), messageType);
        setNewMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
        alert('Failed to send message. Please try again.');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isJoined) {
        handleSendMessage();
      } else {
        handleJoinChat();
      }
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'prayer':
        return '🙏';
      case 'encouragement':
        return '💪';
      default:
        return '💬';
    }
  };

  const getMessageBgColor = (type: string) => {
    switch (type) {
      case 'prayer':
        return 'bg-purple-50 border-purple-200';
      case 'encouragement':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const onlineUsers = users.filter(u => u.isOnline);

  if (!isJoined) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-primary-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Group Chat</h2>
          <p className="text-gray-600">Connect with others on the same Bible reading journey</p>
          
          {/* Connection Status */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">Connecting...</span>
              </>
            ) : isConnected ? (
              <>
                <Wifi className="text-green-600" size={16} />
                <span className="text-sm text-green-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="text-yellow-600" size={16} />
                <span className="text-sm text-yellow-600">Demo Mode</span>
              </>
            )}
          </div>
        </div>

        <div className="max-w-sm mx-auto">
          <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
          <button
            onClick={handleJoinChat}
            disabled={!userName.trim() || isConnecting}
            className="w-full mt-4 bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isConnecting ? 'Connecting...' : 'Join Chat'}
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Chat Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Share insights from your daily readings</li>
            <li>• Encourage and pray for one another</li>
            <li>• Keep discussions focused on faith and growth</li>
            <li>• Be respectful and kind to all members</li>
          </ul>
        </div>

        {!isConnected && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> Chat server unavailable. Messages will be stored locally for demonstration.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Users className="text-primary-600" size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Bible Study Group</h2>
              <p className="text-sm text-gray-500">{onlineUsers.length} members online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="text-green-500" size={16} />
                <span className="text-sm text-green-600">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="text-yellow-500" size={16} />
                <span className="text-sm text-yellow-600">Demo</span>
              </>
            )}
          </div>
        </div>

        {/* Online Users */}
        {onlineUsers.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {onlineUsers.slice(0, 5).map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {user.name}
              </div>
            ))}
            {onlineUsers.length > 5 && (
              <div className="text-xs text-gray-500 px-2 py-1">
                +{onlineUsers.length - 5} more
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg border ${getMessageBgColor(message.type)}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">{getMessageIcon(message.type)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{message.user}</span>
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-gray-700">{message.message}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share your thoughts, prayers, or encouragement..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
        
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setNewMessage(newMessage + '🙏 Praying for ')}
            className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
          >
            🙏 Prayer
          </button>
          <button
            onClick={() => setNewMessage(newMessage + '💪 You\'re doing great! ')}
            className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
          >
            💪 Encouragement
          </button>
          <button
            onClick={() => setNewMessage(newMessage + '❤️ ')}
            className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
          >
            ❤️ Love
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;