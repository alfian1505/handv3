import { FlipHorizontal, Camera, Video, Square } from 'lucide-react';

interface Props {
  onFlip: () => void;
  onCapture: () => void;
  onRecord: () => void;
  onEffect: (e: string) => void;
  effectMode: string;
  recording: boolean;
  gestureEnabled: boolean;
  onToggleGesture: () => void;
}

const modes = ['GLITCH', 'LOVE', 'CYBER', 'NEON', 'RAINBOW', 'ENERGY'];

export default function ControlBar({ onFlip, onCapture, onRecord, onEffect, effectMode, recording, gestureEnabled, onToggleGesture }: Props) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col gap-3">
      <div className="flex gap-2 bg-black/40 backdrop-blur-xl rounded-full px-3 py-1.5 border border-white/10 shadow-2xl shadow-cyan/5">
        {modes.map((m) => (
          <button
            key={m}
            onClick={() => onEffect(m)}
            className={`text-[10px] font-display font-bold px-2.5 py-1 rounded-full transition-all duration-300 ${
              effectMode === m ? 'bg-cyan text-black shadow-[0_0_10px_#00f0ff]' : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="flex gap-2 items-center bg-black/40 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10 shadow-2xl shadow-cyan/5">
        <button onClick={onToggleGesture} className={`flex items-center gap-1.5 text-xs font-display ${gestureEnabled ? 'text-cyan' : 'text-white/30'}`}>
          <Square size={14} /> GESTURE
        </button>
        <div className="w-px h-3 bg-white/10" />
        <button onClick={onFlip} className="text-white/80 hover:text-cyan transition-colors text-xs flex items-center gap-1"><FlipHorizontal size={14} /> FLIP</button>
        <button onClick={onCapture} className="text-white/80 hover:text-cyan transition-colors text-xs flex items-center gap-1"><Camera size={14} /> CAP</button>
        <button onClick={onRecord} className={`text-xs flex items-center gap-1 ${recording ? 'text-red-400 animate-pulse' : 'text-white/80 hover:text-cyan'}`}><Video size={14} /> REC</button>
      </div>
    </div>
  );
}
