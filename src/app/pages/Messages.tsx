import { useState, useEffect, useRef } from 'react';
import { Send, Search, Paperclip, MoreVertical, Star, Archive, Trash2, Phone, Video, Info, StarOff, Loader2, Plus, MessageSquare, ArrowLeft, Users, ChevronDown } from 'lucide-react';


import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from 'sonner';
import { messagesAPI, authAPI } from '../../lib/api';
import { UserAvatar } from '../components/UserAvatar';


export function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAllChats, setShowAllChats] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const init = async () => {
      try {
        const [user, convs, users] = await Promise.all([
          authAPI.getCurrentUser(),
          messagesAPI.getConversations(),
          messagesAPI.getUsers()
        ]);
        setCurrentUser(user);
        setConversations(convs);
        setAllUsers(users);
        if (convs.length > 0) {
          handleSelectConversation(convs[0]);
        }
      } catch (err) {
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSelectConversation = async (conv: any) => {
    setSelectedConversation(conv);
    setShowMobileChat(true);
    setShowUserSearch(false);
    try {
      const msgs = await messagesAPI.getMessagesWithUser(conv.id);
      setAllMessages(msgs);
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const startNewChat = (user: any) => {
    const existing = conversations.find(c => c.id === user.id);
    if (existing) {
      handleSelectConversation(existing);
    } else {
      setSelectedConversation(user);
      setAllMessages([]);
      setShowUserSearch(false);
      setShowMobileChat(true);
    }
  };

  const handleSendMessage = async () => {
    if (messageInput.trim() && selectedConversation) {
      try {
        await messagesAPI.sendMessage(selectedConversation.id, messageInput.trim());
        setMessageInput('');
        const msgs = await messagesAPI.getMessagesWithUser(selectedConversation.id);
        setAllMessages(msgs);
        
        // Refresh conversations to update last message
        const convs = await messagesAPI.getConversations();
        setConversations(convs);
      } catch (err) {
        toast.error('Failed to send message');
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (currentUser?.role === 'admin') return matchesSearch;
    return matchesSearch && u.role === 'admin';
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] animate-slide-in pb-4">
      <Card className="h-full flex overflow-hidden bg-white/80 backdrop-blur-xl border-gray-200/50 shadow-xl rounded-2xl">

        {/* Conversations List (Sidebar 1) */}
        <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} w-full md:w-72 border-r border-gray-100 flex-col bg-white/50`}>
          <div className="p-4 border-b border-gray-50 bg-white/30 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-gray-900">Messages</h3>
              <button 
                onClick={() => setShowUserSearch(!showUserSearch)}
                className={`p-1.5 rounded-lg transition-all ${showUserSearch ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'}`}
                title="New Message"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <Input
                type="text"
                placeholder={showUserSearch ? "Search users..." : "Search chats..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 bg-white/50 border-gray-100 rounded-xl text-xs"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            <div className="p-2 space-y-1">
              {showUserSearch ? (
                <>
                  {(showAllUsers ? filteredUsers : filteredUsers.slice(0, 2)).map((user) => (
                    <button
                      key={user.id}
                      onClick={() => startNewChat(user)}
                      className="w-full p-3 rounded-xl flex items-center gap-3 hover:bg-blue-50/50 text-gray-600 group"
                    >
                      <UserAvatar user={user} className="w-10 h-10 border-2 border-white/50" />
                      <div className="flex-1 text-left min-w-0">

                        <h4 className="font-bold text-sm text-gray-900 truncate group-hover:text-blue-600">{user.name}</h4>
                        <p className="text-[10px] uppercase tracking-wider font-medium text-gray-400">{user.role}</p>
                      </div>
                    </button>
                  ))}
                  {!showAllUsers && filteredUsers.length > 2 && (
                    <button 
                      onClick={() => setShowAllUsers(true)}
                      className="w-full py-2 mt-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center gap-1 border border-dashed border-blue-100 rounded-lg"
                    >
                      <ChevronDown size={12} />
                      View More Users ({filteredUsers.length - 2})
                    </button>
                  )}
                  {showAllUsers && filteredUsers.length > 2 && (
                    <button 
                      onClick={() => setShowAllUsers(false)}
                      className="w-full py-2 mt-1 text-[10px] font-bold text-gray-400 hover:text-gray-600 transition-colors text-center"
                    >
                      Show Less
                    </button>
                  )}
                </>
              ) : (
                <>
                  {(showAllChats ? filteredConversations : filteredConversations.slice(0, 2)).map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                        selectedConversation?.id === conv.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-[0.98]' 
                        : 'hover:bg-blue-50/50 text-gray-600'
                      }`}
                    >
                      <UserAvatar user={conv} className="w-10 h-10 border-2 border-white/50" />
                      <div className="flex-1 text-left min-w-0">

                        <h4 className={`font-bold text-sm truncate ${selectedConversation?.id === conv.id ? 'text-white' : 'text-gray-900'}`}>{conv.name}</h4>
                        <p className={`text-[10px] uppercase tracking-wider font-medium truncate ${selectedConversation?.id === conv.id ? 'text-blue-100' : 'text-gray-400'}`}>{conv.role}</p>
                      </div>
                    </button>
                  ))}
                  
                  {!showAllChats && filteredConversations.length > 2 && (
                    <button 
                      onClick={() => setShowAllChats(true)}
                      className="w-full py-2 mt-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center gap-1 border border-dashed border-blue-100 rounded-lg"
                    >
                      <ChevronDown size={12} />
                      View More Chats ({filteredConversations.length - 2})
                    </button>
                  )}
                  {showAllChats && filteredConversations.length > 2 && (
                    <button 
                      onClick={() => setShowAllChats(false)}
                      className="w-full py-2 mt-1 text-[10px] font-bold text-gray-400 hover:text-gray-600 transition-colors text-center"
                    >
                      Show Less
                    </button>
                  )}
                </>
              )}

              {filteredConversations.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-xs italic">No chats found</div>
              )}
            </div>
          </div>

        </div>


        {/* Chat Area */}
        <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0 min-h-0 bg-white/40`}>
          {selectedConversation ? (
            <>
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">

                <div className="space-y-6">
                  {allMessages.map((msg) => {
                    const isMe = msg.sender_id === currentUser?.id;
                    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={msg.id} className={`flex items-start gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <UserAvatar user={msg.sender} className="w-8 h-8 shadow-sm" />
                        <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : ''}`}>

                          <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <span className="text-xs font-semibold text-gray-700">{isMe ? 'You' : msg.sender?.name}</span>
                            <span className="text-[10px] text-gray-400 font-medium">{time}</span>
                          </div>
                          <div className={`p-4 rounded-2xl text-sm shadow-sm ${
                            isMe 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="p-6 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-transparent border-none outline-none focus-visible:ring-0 shadow-none"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!messageInput.trim()}
                    className="rounded-xl px-4 bg-blue-600 hover:bg-blue-700"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageSquare size={40} className="text-gray-300" />
              </div>
              <p className="font-medium">Select a conversation to start chatting</p>
            </div>
          )}
        </div>

      </Card>


    </div>
  );
}