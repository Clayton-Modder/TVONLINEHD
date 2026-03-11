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
    <div className="flex items-center gap-3 px-6 py-6 overflow-x-auto no-scrollbar scroll-smooth">
      {categories.map((category) => {
        const Icon = ICON_MAP[category] || LayoutGrid;
        const isActive = activeCategory === category;
        
        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200
              ${isActive 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105' 
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-white/5'}
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{category}</span>
          </button>
        );
      })}
    </div>
  );
}
