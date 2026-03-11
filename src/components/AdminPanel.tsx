import { useState } from 'react';
import { X, Plus, Trash2, Edit2, Save, Tv, LayoutGrid, Type, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { Channel, SiteConfig } from '../constants';

interface AdminPanelProps {
  data: {
    siteConfig: SiteConfig;
    categories: string[];
    channels: Channel[];
  };
  onSave: (newData: any) => void;
  onClose: () => void;
}

export default function AdminPanel({ data, onSave, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'config' | 'categories' | 'channels'>('channels');
  const [localData, setLocalData] = useState(data);
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);

  const handleSave = () => {
    onSave(localData);
  };

  const updateSiteConfig = (key: keyof SiteConfig, value: string) => {
    setLocalData({
      ...localData,
      siteConfig: { ...localData.siteConfig, [key]: value }
    });
  };

  const addCategory = () => {
    const name = prompt("Nome da nova categoria:");
    if (name && !localData.categories.includes(name)) {
      setLocalData({
        ...localData,
        categories: [...localData.categories, name]
      });
    }
  };

  const removeCategory = (cat: string) => {
    if (confirm(`Excluir categoria "${cat}"?`)) {
      setLocalData({
        ...localData,
        categories: localData.categories.filter(c => c !== cat)
      });
    }
  };

  const addChannel = () => {
    const newChannel: Channel = {
      id: `channel-${Date.now()}`,
      title: "Novo Canal",
      subtitle: "Subtítulo",
      thumbnail: "https://picsum.photos/seed/tv/200/200",
      category: localData.categories[0] || "Todos",
      isLive: true,
      url: "",
      description: "",
      epg: []
    };
    setLocalData({
      ...localData,
      channels: [newChannel, ...localData.channels]
    });
    setEditingChannelId(newChannel.id);
  };

  const updateChannel = (id: string, updates: Partial<Channel>) => {
    setLocalData({
      ...localData,
      channels: localData.channels.map(c => c.id === id ? { ...c, ...updates } : c)
    });
  };

  const removeChannel = (id: string) => {
    if (confirm("Excluir este canal?")) {
      setLocalData({
        ...localData,
        channels: localData.channels.filter(c => c.id !== id)
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[300] bg-slate-950/95 backdrop-blur-xl flex flex-col"
    >
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Painel de Administração</h2>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Gerencie seu conteúdo</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </button>
          <button 
            onClick={onClose}
            className="p-2.5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 border-r border-white/5 p-6 space-y-2">
          <button 
            onClick={() => setActiveTab('channels')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'channels' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Tv className="w-5 h-5" />
            Canais
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'categories' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutGrid className="w-5 h-5" />
            Categorias
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'config' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Type className="w-5 h-5" />
            Configurações
          </button>
        </nav>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'config' && (
            <div className="max-w-2xl space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Textos do Site</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Título do Site</label>
                    <input 
                      type="text" 
                      value={localData.siteConfig.title}
                      onChange={(e) => updateSiteConfig('title', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Subtítulo / Descrição</label>
                    <input 
                      type="text" 
                      value={localData.siteConfig.subtitle}
                      onChange={(e) => updateSiteConfig('subtitle', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="max-w-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Gerenciar Categorias</h3>
                <button 
                  onClick={addCategory}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all border border-white/5"
                >
                  <Plus className="w-4 h-4" />
                  Nova Categoria
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {localData.categories.map((cat) => (
                  <div key={cat} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group">
                    <span className="font-bold text-slate-200">{cat}</span>
                    <button 
                      onClick={() => removeCategory(cat)}
                      className="p-2 text-slate-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Lista de Canais</h3>
                <button 
                  onClick={addChannel}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all shadow-lg shadow-red-500/20"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Canal
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {localData.channels.map((channel) => (
                  <div key={channel.id} className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden">
                    <div className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-2xl p-2 flex items-center justify-center">
                          <img src={channel.thumbnail} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{channel.title}</h4>
                          <p className="text-xs text-slate-400">{channel.category} • {channel.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setEditingChannelId(editingChannelId === channel.id ? null : channel.id)}
                          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 transition-all"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => removeChannel(channel.id)}
                          className="p-3 bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-500 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {editingChannelId === channel.id && (
                      <div className="p-8 border-t border-white/5 bg-black/20 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Título</label>
                            <input 
                              type="text" 
                              value={channel.title}
                              onChange={(e) => updateChannel(channel.id, { title: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Subtítulo</label>
                            <input 
                              type="text" 
                              value={channel.subtitle}
                              onChange={(e) => updateChannel(channel.id, { subtitle: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">URL do Stream (Embed)</label>
                            <input 
                              type="text" 
                              value={channel.url}
                              onChange={(e) => updateChannel(channel.id, { url: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Thumbnail URL</label>
                            <input 
                              type="text" 
                              value={channel.thumbnail}
                              onChange={(e) => updateChannel(channel.id, { thumbnail: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Categoria</label>
                            <select 
                              value={channel.category}
                              onChange={(e) => updateChannel(channel.id, { category: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                            >
                              {localData.categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Descrição</label>
                            <textarea 
                              value={channel.description}
                              onChange={(e) => updateChannel(channel.id, { description: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 h-20 resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </motion.div>
  );
}
