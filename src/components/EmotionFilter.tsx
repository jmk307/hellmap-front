
import { Button } from './ui/button';

interface EmotionFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function EmotionFilter({ activeFilter, onFilterChange }: EmotionFilterProps) {
  const filters = [
    { id: 'all', label: '전체', emoji: '🔥', color: 'black' },
    { id: 'fear', label: '공포', emoji: '😱', color: 'var(--hellmap-hot-pink)' },
    { id: 'anger', label: '진상', emoji: '😡', color: 'var(--hellmap-neon-yellow)' },
    { id: 'laugh', label: '웃김', emoji: '🤣', color: 'var(--hellmap-light-pink)' }
  ];

  return (
    <div className="flex justify-center gap-4 py-8 bg-gray-100">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-6 py-3 rounded-full border-2 transition-all duration-300 ${
            activeFilter === filter.id 
              ? 'scale-110 hellmap-neon-glow text-white' 
              : 'bg-white text-black border-gray-300 hover:scale-105'
          }`}
          style={{
            backgroundColor: activeFilter === filter.id ? filter.color : undefined,
            borderColor: filter.color
          }}
        >
          <span className="text-2xl mr-2">{filter.emoji}</span>
          <span>{filter.label}</span>
        </Button>
      ))}
    </div>
  );
}