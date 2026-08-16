import { useState, useRef, useCallback } from 'react';
import { useCamera } from './hooks/useCamera';
import { useHandTracking } from './hooks/useHandTracking';
import { detectGestures } from './utils/gestureDetection';
import EffectCanvas from './components/EffectCanvas';
import GesturePanel from './components/GesturePanel';
import ControlBar from './components/ControlBar';

export default function App() {
  const { videoRef, error, flip } = useCamera();
  const { hands, ready: trackingReady } = useHandTracking(videoRef);
  const [gesture, setGesture] = useState({
    fingerHeart: false,
    clap: false,
    openPalm: false,
    fist: false,
    peace: false,
    pointing: false,
    thumbsUp: false,
    clapCooldown: 0,
    fingerHeartFrames: 0,
  });
  const [effectMode, setEffectMode] = useState('GLITCH');
  const [recording, setRecording] = useState(false);
  const [gestureEnabled, setGestureEnabled] = useState(true);
  const [captureUrl, setCaptureUrl] = useState<string | null>(null);


  const handleGesture = useCallback(() => {
    if (!gestureEnabled) return;
    setGesture((prev) => detectGestures(hands, 16, prev));
  }, [hands, gestureEnabled]);

  // Call detect regularly via rAF in App
  const rafRef = useRef(0);
  const tick = () => {
    handleGesture();
    rafRef.current = requestAnimationFrame(tick);
  };
  // Start once
  if (rafRef.current === 0) {
    rafRef.current = requestAnimationFrame(tick);
  }

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    if (video && canvas) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Overlay effects by re-rendering on a temp canvas isn't simple; use current visual
        const url = canvas.toDataURL('image/png');
        setCaptureUrl(url);
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-center px-6">
        <div>
          <h1 className="font-display text-4xl font-black text-white mb-2">HAND FX</h1>
          <p className="text-cyan text-lg mb-6">{error}</p>
          <button onClick={flip} className="bg-cyan text-black font-display font-bold px-6 py-2 rounded-full hover:brightness-110 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-void text-white">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1] z-0"
      />
      <EffectCanvas hands={hands} gesture={gesture} videoWidth={videoRef.current?.videoWidth || 1280} videoHeight={videoRef.current?.videoHeight || 720} effectMode={effectMode} />

      <div className="absolute top-6 left-6 z-30">
        <h1 className="font-display text-3xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_#00f0ff]">HAND <span className="text-cyan">FX</span></h1>
        <p className="text-sm text-white/40 font-body tracking-wide">Interactive Glitch Filter</p>
      </div>

      <GesturePanel gesture={gesture} />

      <div className="absolute top-6 right-6 z-30 flex flex-col gap-2 items-end">
        <div className="bg-black/40 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10 text-xs font-display text-cyan shadow-lg shadow-cyan/20">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${trackingReady ? 'bg-cyan animate-pulse' : 'bg-red-500'}`} />
            HAND TRACKING {trackingReady ? 'ACTIVE' : 'LOADING'}
          </div>
          <div className="text-white/60">{hands.length} HAND{hands.length !== 1 ? 'S' : ''} DETECTED</div>
          <div className="text-[10px] text-white/30">VEL: {Math.round(hands[0]?.velocity || 0)} px/s</div>
        </div>
      </div>

      <ControlBar
        onFlip={flip}
        onCapture={handleCapture}
        onRecord={() => setRecording((r) => !r)}
        onEffect={setEffectMode}
        effectMode={effectMode}
        recording={recording}
        gestureEnabled={gestureEnabled}
        onToggleGesture={() => setGestureEnabled((g) => !g)}
      />

      {captureUrl && (
        <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-6">
          <div className="relative max-w-md w-full">
            <img src={captureUrl} alt="Capture" className="w-full rounded-xl border border-white/10 shadow-2xl shadow-cyan/20" />
            <div className="absolute -top-8 left-0 text-xl font-display font-black text-cyan">CAPTURED</div>
            <button onClick={() => setCaptureUrl(null)} className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-white text-black font-display font-bold px-6 py-2 rounded-full hover:bg-cyan transition">CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
}
