import { Heart, Zap, Sparkles, Eye, Hand } from 'lucide-react';
import { GestureState } from '../utils/gestureDetection';

export default function GesturePanel({ gesture }: { gesture: GestureState }) {
  const badges = [
    { key: 'fingerHeart', label: 'Finger Heart', icon: Heart },
    { key: 'clap', label: 'Clap', icon: Zap },
    { key: 'openPalm', label: 'Open Palm', icon: Hand },
    { key: 'fist', label: 'Fist', icon: Sparkles },
    { key: 'peace', label: 'Peace', icon: Eye },
  ];
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex gap-3 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
      {badges.map(({ key, label, icon: Icon }) => (
        <div key={key} className={`flex items-center gap-1.5 text-xs ${gesture[key as keyof GestureState] ? 'text-cyan' : 'text-white/30'}`}>
          <Icon size={14} />
          <span className="font-display font-bold tracking-wider">{label}</span>
          {gesture[key as keyof GestureState] && <span className="text-[8px] animate-pulse">●</span>}
        </div>
      ))}
    </div>
  );
}
