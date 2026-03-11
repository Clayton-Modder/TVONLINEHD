import { Search, User, Settings, Tv } from 'lucide-react';
import { useState } from 'react';
import SettingsModal from './SettingsModal';
import { User as UserType } from '../types';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user: UserType | null;
  onUserClick: () => void;
  onSettingsClick: () => void;
}

export default function Navbar({ searchQuery, onSearchChange, user, onUserClick, onSettingsClick }: NavbarProps) {
  return (
    <>
      <nav className="flex items-center justify-between px-6 py-4 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="bg-red-500 p-2 rounded-lg shadow-lg shadow-red-500/20">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            TV Online <span className="text-red-500">HD</span>
          </h1>
        </div>

        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar canais..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-slate-800 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onUserClick}
            className="flex items-center gap-2 p-1 pr-3 hover:bg-white/5 rounded-full transition-colors group"
          >
            {user ? (
              <>
                <img 
                  src={user.profileImage} 
                  alt={user.username} 
                  className="w-8 h-8 rounded-full border border-red-500/50 object-cover"
                />
                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors max-w-[100px] truncate">
                  {user.username}
                </span>
              </>
            ) : (
              <div className="p-2 bg-slate-800 rounded-full">
                <User className="w-5 h-5 text-slate-300" />
              </div>
            )}
          </button>
          <button 
            onClick={onSettingsClick}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </nav>
    </>
  );
}
