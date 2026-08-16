import { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { HandData, Landmark2D } from '../utils/landmarkUtils';
import { handVelocity } from '../utils/landmarkUtils';

export function useHandTracking(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [hands, setHands] = useState<HandData[]>([]);
  const [ready, setReady] = useState(false);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const prevHandsRef = useRef<HandData[] | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    async function initLandmarker() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        });
        landmarkerRef.current = landmarker;
        setReady(true);
      } catch (e) {
        console.error('MediaPipe init failed', e);
      }
    }
    initLandmarker();
    return () => {};
  }, []);

  const processFrame = useCallback(() => {
    const landmarker = landmarkerRef.current;
    const video = videoRef.current;
    if (!landmarker || !video || video.readyState < 2 || !ready) return;
    const now = Date.now();
    const result = landmarker.detectForVideo(video, now);
    const newHands: HandData[] = [];
    if (result.landmarks && result.landmarks.length > 0) {
      for (let i = 0; i < result.landmarks.length; i++) {
        const lm = result.landmarks[i];
        const handednessRaw = result.handedness?.[i]?.[0]?.displayName || 'Right';
        const handedness = handednessRaw === 'Left' ? 'Left' : 'Right';
        const landmarks: Landmark2D[] = lm.map((l) => ({ x: l.x, y: l.y, z: l.z }));
        const cx = landmarks.reduce((s, l) => s + l.x, 0) / landmarks.length;
        const cy = landmarks.reduce((s, l) => s + l.y, 0) / landmarks.length;
        const prev = prevHandsRef.current?.[i] || null;
        newHands.push({
          landmarks,
          handedness: handedness === 'Left' ? 'Left' : 'Right',
          centerX: cx,
          centerY: cy,
          velocity: handVelocity({ landmarks, handedness, centerX: cx, centerY: cy, velocity: 0 }, prev, 16),
        });
      }
    }
    prevHandsRef.current = newHands;
    setHands(newHands);
  }, [ready, videoRef]);

  useEffect(() => {
    if (!ready) return;
    const tick = () => {
      processFrame();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready, processFrame]);

  return { hands, ready, loading: !ready };
}
