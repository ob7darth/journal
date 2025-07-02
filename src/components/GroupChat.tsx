import React, { useState, useEffect, useRef } from 'react';
import { Send, Users } from 'lucide-react';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'prayer' | 'encouragement';
}

const GroupChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample messages for demonstration
  useEffect(() => {
    const sampleMessages: ChatMessage[] = [
      {
        id: '1',
        user: 'Sarah M.',
        message: 'Good morning everyone! Just finished Day 3 - the Beatitudes really spoke to my heart today.',
        timestamp: new Date(Date.now() - 3600000),
        type: 'message'
      },
      {
        id: '2',
        user: 'Mike R.',
        message: 'Praying for everyone in our group today. May God\'s word transform our hearts! 🙏',
        timestamp: new Date(Date.now() - 1800000),
        type: 'prayer'
      },
      {
        id: '3',
        user: 'Jennifer L.',
        message: 'The verse about being "salt and light" in Matthew 5:13-16 is challenging me to live differently.',
        timestamp: new Date(Date.now() - 900000),
        type: 'message'
      },
      {
        id: '4',
        user: 'David K.',
        message: 'You\'re doing great, Jennifer! That\'s exactly what God wants - transformation through His word! 💪',
        timestamp: new Date(Date.now() - 300000),
        type: 'encouragement'
      }
    ];
    setMessages(sampleMessages);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinChat = () => {
    if (userName.trim()) {
      setIsJoined(true);
      const joinMessage: ChatMessage = {
        id: Date.now().toString(),
        user: 'System',
        message: `${userName} joined the group chat`,
        timestamp: new Date(),
        type: 'message'
      };
      setMessages(prev => [...prev, joinMessage]);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && userName) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        user: userName,
        message: newMessage.trim(),
        timestamp: new Date(),
        type: newMessage.toLowerCase().includes('pray') ? 'prayer' : 'message'
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
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

  if (!isJoined) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-primary-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Group Chat</h2>
          <p className="text-gray-600">Connect with others on the same Bible reading journey</p>
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
            disabled={!userName.trim()}
            className="w-full mt-4 bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Join Chat
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
              <p className="text-sm text-gray-500">4 members online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm text-gray-600">Online</span>
          </div>
        </div>
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
            onClick={() => setNewMessage(newMessage + '🙏 ')}
            className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
          >
            🙏 Prayer
          </button>
          <button
            onClick={() => setNewMessage(newMessage + '💪 ')}
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