import { Heart } from 'lucide-react';
import { MouseEvent } from 'react';
import { Channel } from '../constants';

interface ChannelCardProps {
  channel: Channel;
  onClick: (channel: Channel) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: MouseEvent, channel: Channel) => void;
}

export default function ChannelCard({ channel, onClick, isFavorite, onToggleFavorite }: ChannelCardProps) {
  return (
    <div 
      onClick={() => onClick(channel)}
      className="group relative bg-slate-800/40 rounded-2xl overflow-hidden border border-white/5 hover:border-red-500/50 transition-all duration-300 cursor-pointer hover:-translate-y-1 shadow-xl"
    >
      <div className="aspect-[16/10] relative bg-slate-900 flex items-center justify-center p-8">
        <img
          src={channel.thumbnail}
          alt={channel.title}
          loading="lazy"
          className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute top-3 left-3 flex gap-2">
          {onToggleFavorite && (
            <button
              onClick={(e) => onToggleFavorite(e, channel)}
              className={`p-2 rounded-lg backdrop-blur-md border border-white/10 transition-all ${
                isFavorite 
                  ? 'bg-red-500 text-white border-red-400' 
                  : 'bg-black/40 text-slate-400 hover:text-white hover:bg-black/60'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {channel.isLive && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Ao Vivo</span>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-slate-800/80 backdrop-blur-sm border-t border-white/5">
        <h3 className="font-bold text-slate-100 truncate group-hover:text-red-400 transition-colors">
          {channel.title}
        </h3>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-emerald-500" />
          {channel.subtitle}
        </p>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
