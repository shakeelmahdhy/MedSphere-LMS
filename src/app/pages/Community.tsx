import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Send, Search, Hash, Users, MessageSquare, Plus, ChevronDown,
  Smile, Paperclip, AtSign, Pin, Bell, BellOff, Settings,
  ArrowLeft, UserPlus, Crown, Shield, MoreHorizontal, X,
  ThumbsUp, Heart, Laugh, ImageIcon, Mic, Video, Phone,
  Circle, CheckCircle2, Globe, Lock, Bookmark, Reply, Trash2, Edit3, Loader2
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { communityAPI, authAPI, messagesAPI } from '../../lib/api';
import { UserAvatar } from '../components/UserAvatar';


export function Community() {
  const [activeSection, setActiveSection] = useState<'channels' | 'dms'>('channels');
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [allMessages, setAllMessages] = useState<Record<string, any[]>>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showAllChannels, setShowAllChannels] = useState(false);
  const [showMemberManager, setShowMemberManager] = useState(false);
  const [managerUserIds, setManagerUserIds] = useState<number[]>([]);


  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [user, channelList] = await Promise.all([
          authAPI.getCurrentUser(),
          communityAPI.getChannels()
        ]);
        setCurrentUser(user);
        setChannels(channelList);
        if (channelList.length > 0) {
          const firstId = channelList[0].id.toString();
          setSelectedId(firstId);
          fetchMessages(firstId);
        }
      } catch (error) {
        console.error('Community init error:', error);
        toast.error('Failed to initialize community');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchMessages = async (id: string) => {
    try {
      const messages = await communityAPI.getMessages(id);
      setAllMessages(prev => ({ ...prev, [id]: messages }));
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [allMessages, selectedId, scrollToBottom]);

  const selectConversation = (id: string) => {
    setSelectedId(id);
    setShowMobileChat(true);
    fetchMessages(id);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSendMessage = async () => {
    const text = messageInput.trim();
    if (!text || !selectedId) return;

    try {
      await communityAPI.sendMessage(selectedId, text);
      setMessageInput('');
      fetchMessages(selectedId);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-[10px] px-1.5 py-0"><Shield size={10} className="mr-0.5" />Admin</Badge>;
      case 'instructor': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-[10px] px-1.5 py-0"><Crown size={10} className="mr-0.5" />Instructor</Badge>;
      default: return null;
    }
  };

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [newChannelData, setNewChannelData] = useState({ name: '', description: '', type: 'public' });


  useEffect(() => {
    if (currentUser?.role === 'admin') {
      messagesAPI.getUsers().then(setAllUsers).catch(console.error);
    }
  }, [currentUser]);

  const handleCreateChannel = async () => {
    if (!newChannelData.name || !newChannelData.description) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await communityAPI.createChannel({
        ...newChannelData,
        user_ids: selectedUserIds
      });
      toast.success('Channel created');
      const channelList = await communityAPI.getChannels();
      setChannels(channelList);
      setShowCreateModal(false);
      setNewChannelData({ name: '', description: '', type: 'public' });

      setSelectedUserIds([]);
    } catch (error) {
      toast.error('Failed to create channel');
    }
  };

  const handleDeleteChannel = async (id: string) => {
    if (confirm('Are you sure you want to delete this channel?')) {
      try {
        await communityAPI.deleteChannel(id);
        toast.success('Channel deleted');
        const channelList = await communityAPI.getChannels();
        setChannels(channelList);
        if (selectedId === id) setSelectedId('');
      } catch (error) {
        toast.error('Failed to delete channel');
      }
    }
  };

  const selectedChannel = channels.find(c => c.id.toString() === selectedId);
  const handleUpdateMembers = async () => {
    if (!selectedChannel) return;
    try {
      await communityAPI.addMembers(selectedChannel.id.toString(), managerUserIds);
      toast.success('Members updated successfully');
      setShowMemberManager(false);
      fetchChannels(); // Refresh to get updated members
    } catch (error) {
      toast.error('Failed to update members');
    }
  };

  const currentMessages = allMessages[selectedId] || [];

  const filteredChannels = channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return (
    <div className="flex items-center justify-center h-[400px]">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );

  return (
    <div className="h-[calc(100vh-2rem)] animate-slide-in pb-4">
      <Card className="h-full flex overflow-hidden bg-white/80 backdrop-blur-xl border-gray-200/50 shadow-xl rounded-2xl">

        {/* Sidebar */}
        <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} w-full md:w-72 border-r border-gray-100 flex-col`}>
          <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white/50">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-gray-50/50 border-gray-100 rounded-xl text-xs"
              />
            </div>
            {currentUser?.role === 'admin' && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="ml-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                title="Create Channel"
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            <div className="p-2 space-y-1">

              {(showAllChannels ? filteredChannels : filteredChannels.slice(0, 2)).map(ch => (
                <div key={ch.id} className="group relative">
                  <button
                    onClick={() => selectConversation(ch.id.toString())}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${
                      selectedId === ch.id.toString() 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                      : 'text-gray-600 hover:bg-blue-50/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      selectedId === ch.id.toString() ? 'bg-white/20' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Hash size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold truncate ${selectedId === ch.id.toString() ? 'text-white' : 'text-gray-900'}`}>{ch.name}</p>
                      <p className={`text-[10px] uppercase tracking-tighter truncate ${selectedId === ch.id.toString() ? 'text-blue-100' : 'text-gray-400'}`}>
                        {ch.description || 'Public Channel'}
                      </p>
                    </div>
                    {currentUser?.role === 'admin' && (
                      <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        {ch.type === 'group' && selectedId === ch.id.toString() && (
                          <UserPlus 
                            size={14} 
                            className="text-blue-500 hover:text-blue-700 cursor-pointer"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setManagerUserIds(ch.members?.map((m: any) => m.id) || []);
                              setShowMemberManager(true); 
                            }}
                          />
                        )}
                        <Trash2 
                          size={14} 
                          className="text-red-400 hover:text-red-600 cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); handleDeleteChannel(ch.id.toString()); }}
                        />
                      </div>
                    )}

                  </button>
                </div>
              ))}
              
              {!showAllChannels && filteredChannels.length > 2 && (
                <button 
                  onClick={() => setShowAllChannels(true)}
                  className="w-full py-2 mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center gap-1 border border-dashed border-blue-200 rounded-xl hover:bg-blue-50"
                >
                  <ChevronDown size={14} />
                  View More ({filteredChannels.length - 2} more)
                </button>
              )}

              {showAllChannels && filteredChannels.length > 2 && (
                <button 
                  onClick={() => setShowAllChannels(false)}
                  className="w-full py-2 mt-2 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1"
                >
                  Show Less
                </button>
              )}

            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0 min-h-0 bg-white/40`}>
          {selectedChannel ? (
            <>
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">

                <div className="space-y-6">
                  {currentMessages.map((msg) => {
                    const isMe = msg.sender_id === currentUser?.id;
                    const sender = msg.sender || { name: 'User' };
                    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={msg.id} className={`flex items-start gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <UserAvatar user={sender} className="w-8 h-8" />
                        <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : ''}`}>

                          <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <span className="text-xs font-semibold text-gray-700">{isMe ? 'You' : sender.name}</span>
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
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={`Message #${selectedChannel.name}`}
                    className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
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
                <Hash size={40} className="text-gray-300" />
              </div>
              <p>Select a channel to start chatting</p>
            </div>
          )}
        </div>
      </Card>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create Channel</h2>

              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Channel Name</label>
                <Input 
                  placeholder="e.g. specialized-training" 
                  value={newChannelData.name}
                  onChange={(e) => setNewChannelData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <Input 
                  placeholder="What is this channel about?" 
                  value={newChannelData.description}
                  onChange={(e) => setNewChannelData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Channel Type</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    onClick={() => setNewChannelData({...newChannelData, type: 'public'})}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-sm transition-all ${
                      newChannelData.type === 'public' 
                      ? 'bg-blue-50 border-blue-200 text-blue-600 font-bold shadow-sm' 
                      : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <Globe size={16} />
                    Public
                  </button>
                  <button
                    onClick={() => setNewChannelData({...newChannelData, type: 'group'})}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-sm transition-all ${
                      newChannelData.type === 'group' 
                      ? 'bg-blue-50 border-blue-200 text-blue-600 font-bold shadow-sm' 
                      : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <Lock size={16} />
                    Private
                  </button>
                </div>
              </div>
              
              {newChannelData.type === 'group' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-semibold text-gray-700">Add Members</label>
                  <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl p-2 space-y-1 bg-gray-50/30">
                    {allUsers.map(user => (
                      <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white hover:shadow-sm rounded-lg cursor-pointer transition-all">
                        <input 
                          type="checkbox" 
                          checked={selectedUserIds.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUserIds(prev => [...prev, user.id]);
                            } else {
                              setSelectedUserIds(prev => prev.filter(id => id !== user.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <UserAvatar user={user} className="w-8 h-8" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{user.role}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

            </div>
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex gap-3">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleCreateChannel} className="flex-1 bg-blue-600 hover:bg-blue-700">Create Channel</Button>
            </div>
          </Card>
        </div>
      )}
      {/* Member Manager Modal */}
      {showMemberManager && selectedChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Manage Members: #{selectedChannel.name}</h2>
              <button onClick={() => setShowMemberManager(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Select Members</label>
                <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-xl p-2 space-y-1 bg-gray-50/30">
                  {allUsers.map(user => (
                    <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white hover:shadow-sm rounded-lg cursor-pointer transition-all">
                      <input 
                        type="checkbox" 
                        checked={managerUserIds.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setManagerUserIds(prev => [...prev, user.id]);
                          } else {
                            setManagerUserIds(prev => prev.filter(id => id !== user.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <UserAvatar user={user} className="w-8 h-8" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{user.role}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex gap-3">
              <Button variant="ghost" onClick={() => setShowMemberManager(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleUpdateMembers} className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold">Update Members</Button>
            </div>
          </Card>
        </div>
      )}
    </div>

  );
}
