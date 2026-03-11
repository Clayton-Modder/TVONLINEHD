import { useState } from 'react';
import { X, Camera, FolderPlus, Trash2, Send, Loader2, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Folder } from '../types';
import { Channel } from '../constants';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate: (updatedUser: User) => void;
  onLogout: () => void;
  channels: Channel[];
}

export default function ProfileModal({ isOpen, onClose, user, onUpdate, onLogout, channels }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'folders' | 'report'>('profile');
  const [username, setUsername] = useState(user?.username || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [reportMessage, setReportMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  if (!user) return null;

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, profileImage }),
      });
      const updated = await response.json();
      onUpdate(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReport = async () => {
    if (!reportMessage.trim()) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: reportMessage }),
      });
      setReportMessage('');
      alert('Reporte enviado com sucesso!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const newFolder: Folder = {
      id: Math.random().toString(36).substr(2, 9),
      name: newFolderName,
      channelIds: []
    };
    const updatedFolders = [...user.folders, newFolder];
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ folders: updatedFolders }),
      });
      const updated = await response.json();
      onUpdate(updated);
      setNewFolderName('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const updatedFolders = user.folders.filter(f => f.id !== folderId);
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ folders: updatedFolders }),
      });
      const updated = await response.json();
      onUpdate(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer">
                  <img 
                    src={user.profileImage} 
                    alt={user.username}
                    className="w-12 h-12 rounded-full border-2 border-red-500/50 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">{user.username}</h2>
                  <p className="text-xs text-slate-400">Membro desde Março 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={onLogout}
                  className="p-2 hover:bg-red-500/10 rounded-full transition-colors text-red-500"
                  title="Sair da conta"
                >
                  <LogOut className="w-5 h-5" />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 bg-slate-800/30">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'profile' ? 'border-red-500 text-red-500 bg-red-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                Perfil
              </button>
              <button 
                onClick={() => setActiveTab('folders')}
                className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'folders' ? 'border-red-500 text-red-500 bg-red-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                Pastas
              </button>
              <button 
                onClick={() => setActiveTab('report')}
                className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'report' ? 'border-red-500 text-red-500 bg-red-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                Suporte
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome de exibição</label>
                    <input 
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">URL da Imagem de Perfil</label>
                    <input 
                      type="text"
                      value={profileImage}
                      onChange={(e) => setProfileImage(e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                      placeholder="https://..."
                    />
                  </div>
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Alterações'}
                  </button>
                </div>
              )}

              {activeTab === 'folders' && (
                <div className="space-y-6">
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Nova pasta..."
                      className="flex-1 bg-slate-800 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                    />
                    <button 
                      onClick={handleCreateFolder}
                      className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl transition-all"
                    >
                      <FolderPlus className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {user.folders.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <FolderPlus className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Você ainda não criou pastas.</p>
                      </div>
                    ) : (
                      user.folders.map(folder => (
                        <div key={folder.id} className="bg-slate-800/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                              <ChevronRight className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white">{folder.name}</h4>
                              <p className="text-xs text-slate-500">{folder.channelIds.length} canais salvos</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteFolder(folder.id)}
                            className="p-2 text-slate-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'report' && (
                <div className="space-y-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                    <p className="text-sm text-blue-400">
                      Encontrou algum canal fora do ar ou erro no site? Informe-nos abaixo para que possamos corrigir o mais rápido possível.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sua mensagem</label>
                    <textarea 
                      value={reportMessage}
                      onChange={(e) => setReportMessage(e.target.value)}
                      rows={5}
                      className="w-full bg-slate-800 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all resize-none"
                      placeholder="Descreva o problema..."
                    />
                  </div>
                  <button 
                    onClick={handleSendReport}
                    disabled={isLoading || !reportMessage.trim()}
                    className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar Reporte
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
