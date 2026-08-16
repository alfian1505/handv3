import { useEffect, useRef, useState } from 'react';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facing, setFacing] = useState<'user' | 'environment'>('user');

  const start = async () => {
    try {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
    } catch (e) {
      setError('Camera permission is required to use Hand FX.');
    }
  };

  const flip = () => {
    setFacing((f) => (f === 'user' ? 'environment' : 'user'));
  };

  useEffect(() => {
    start();
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [facing]);

  return { videoRef, ready, error, flip, facing };
}
