import { LayoutGrid, Trophy, Radio, Heart, Clock, Flame, Tv, Dumbbell, Film } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  "Todos": LayoutGrid,
  "Futebol Ao vivo": Trophy,
  "Rádios Online": Radio,
  "Favoritos": Heart,
  "Recentes": Clock,
  "BBB 2026": Flame,
  "TV Aberta": Tv,
  "Esportes": Dumbbell,
  "Filmes e Séries": Film
};

interface CategoryBarProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryBar({ categories, activeCategory, onCategoryChange }: CategoryBarProps) {
  return (
    <div className="
      md:relative md:flex md:items-center md:gap-3 md:px-6 md:py-6 md:bg-transparent md:border-none md:shadow-none
      fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/5 z-50 px-4 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth
    ">
      {categories.map((category) => {
        const Icon = ICON_MAP[category] || LayoutGrid;
        const isActive = activeCategory === category;
        
        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`
              flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 min-w-[70px] md:min-w-0
              ${isActive 
                ? 'text-red-500 md:bg-red-500 md:text-white md:shadow-lg md:shadow-red-500/30 md:scale-105' 
                : 'text-slate-500 md:bg-slate-800/50 md:text-slate-400 md:hover:bg-slate-700/50 md:hover:text-white md:border md:border-white/5'}
            `}
          >
            <Icon className={`w-5 h-5 md:w-4 md:h-4 ${isActive && !window.matchMedia('(min-width: 768px)').matches ? 'fill-current' : ''}`} />
            <span className="text-[10px] md:text-sm font-bold md:font-medium uppercase md:capitalize">{category}</span>
          </button>
        );
      })}
    </div>
  );
}
