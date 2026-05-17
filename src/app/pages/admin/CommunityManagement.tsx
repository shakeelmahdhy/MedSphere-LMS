import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MessageSquare, Plus, Trash2, Hash, Globe, Lock, Shield, Settings, Users, X } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { adminAPI, communityAPI } from '../../../lib/api';

export function CommunityManagement() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: '',
    description: '',
    type: 'public'

  });

  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const data = await communityAPI.getChannels();
      setChannels(data);
    } catch (error) {
      toast.error('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (channelId: number) => {
    try {
      const data = await communityAPI.getChannelMessages(channelId.toString());
      setMessages(data);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleOpenChannel = (ch: any) => {
    setSelectedChannel(ch);
    fetchMessages(ch.id);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChannel) return;
    setSending(true);
    try {
      await communityAPI.sendChannelMessage(selectedChannel.id.toString(), messageInput);
      setMessageInput('');
      fetchMessages(selectedChannel.id);
      toast.success('Message sent to #' + selectedChannel.name);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await communityAPI.deleteMessage(messageId.toString());
      fetchMessages(selectedChannel.id);
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannel.name) {
      toast.error('Channel name is required');
      return;
    }

    try {
      await communityAPI.createChannel(newChannel);
      toast.success(`Channel #${newChannel.name} created!`);
      setShowAddModal(false);
      setNewChannel({ name: '', description: '', type: 'group' });
      fetchChannels();
    } catch (error) {
      toast.error('Failed to create channel');
    }
  };

  const handleDeleteChannel = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete #${name}? All messages will be permanently lost.`)) return;
    
    try {
      await communityAPI.deleteChannel(id.toString());
      toast.success(`Channel #${name} deleted`);
      fetchChannels();
    } catch (error) {
      toast.error('Failed to delete channel');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Management</h1>
          <p className="text-gray-600">Manage discussion channels and community activity</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={20} className="mr-2" />
          Create Channel
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((ch) => (
          <Card key={ch.id} className="p-6 hover:shadow-lg transition-all border-gray-200/50 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Hash className="text-blue-600" size={24} />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleOpenChannel(ch)}
                  className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-400"
                  title="View Messages"
                >
                  <MessageSquare size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteChannel(ch.id, ch.name)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-400"
                  title="Delete Channel"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-1">#{ch.name}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{ch.description}</p>
            
            <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Users size={14} />
                <span>Active Channel</span>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase">{ch.type}</Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* View Messages Modal */}
      {selectedChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl p-6 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <Hash className="text-blue-600" size={20} />
                <h3 className="text-xl font-bold">#{selectedChannel.name} Messages</h3>
              </div>
              <button onClick={() => setSelectedChannel(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 p-2 min-h-[300px]">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                  <MessageSquare size={48} />
                  <p>No messages in this channel yet</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="flex gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                      {msg.sender?.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{msg.sender?.name || 'User'}</span>
                        <span className="text-[10px] text-gray-400">{new Date(msg.timestamp).toLocaleString()}</span>
                        <button 
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-50 rounded transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg mt-1">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t space-y-3">
              <div className="flex gap-2">
                <Input 
                  placeholder="Type a message as Admin..." 
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  disabled={sending || !messageInput.trim()} 
                  onClick={handleSendMessage}
                  className="bg-blue-600"
                >
                  Send
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 space-y-4 animate-slide-in">
            <h3 className="text-xl font-bold">Create New Channel</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Channel Name</label>
                <Input 
                  placeholder="e.g. general-discussion" 
                  value={newChannel.name}
                  onChange={e => setNewChannel({...newChannel, name: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="What is this channel for?"
                  value={newChannel.description}
                  onChange={e => setNewChannel({...newChannel, description: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Channel Type</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    onClick={() => setNewChannel({...newChannel, type: 'public'})}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-sm transition-all ${
                      newChannel.type === 'public' 
                      ? 'bg-blue-50 border-blue-200 text-blue-600 font-bold' 
                      : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <Globe size={16} />
                    Public
                  </button>
                  <button
                    onClick={() => setNewChannel({...newChannel, type: 'group'})}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-sm transition-all ${
                      newChannel.type === 'group' 
                      ? 'bg-blue-50 border-blue-200 text-blue-600 font-bold' 
                      : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <Lock size={16} />
                    Private
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 px-1">
                  {newChannel.type === 'public' 
                    ? 'Anyone in the community can see and join this channel.' 
                    : 'Only invited members will be able to see this channel.'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleCreateChannel}>Create Channel</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
