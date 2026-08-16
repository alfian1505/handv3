import { useRef, useEffect, useCallback } from 'react';
import { HandData } from '../utils/landmarkUtils';
import { spawnParticles, updateParticles, Particle } from '../utils/particleUtils';
import { GestureState } from '../utils/gestureDetection';

export default function EffectCanvas({
  hands,
  gesture,
  videoWidth,
  videoHeight,
  effectMode,
}: {
  hands: HandData[];
  gesture: GestureState;
  videoWidth: number;
  videoHeight: number;
  effectMode: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const trailsRef = useRef<Record<string, { x: number; y: number; alpha: number }[]>>({});
  const frameRef = useRef(0);

  const drawFingerTrail = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    fingerId: string,
    color: string,
  ) => {
    const key = `trail-${fingerId}`;
    if (!trailsRef.current[key]) trailsRef.current[key] = [];
    const trail = trailsRef.current[key];
    trail.push({ x, y, alpha: 1 });
    if (trail.length > 20) trail.shift();
    for (let i = 0; i < trail.length; i++) {
      const t = trail[i];
      const a = (t.alpha * i) / trail.length;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 4 - (i / trail.length) * 3, 0, Math.PI * 2);
      ctx.fillStyle = color.replace(')', `, ${a})`).replace('rgb', 'rgba');
      ctx.fill();
    }
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width || videoWidth || 640;
    const H = canvas.height || videoHeight || 480;

    ctx.save();
    ctx.clearRect(0, 0, W, H);

    // Glitch / RGB split effect
    if (effectMode === 'GLITCH' || effectMode === 'CYBER') {
      for (const hand of hands) {
        for (const lm of hand.landmarks) {
          const cx = lm.x * W;
          const cy = lm.y * H;
          ctx.fillStyle = 'rgba(255,0,170,0.15)';
          ctx.fillRect(cx - 4, cy - 4, 8, 8);
        }
      }
    }

    // Draw hand outlines
    for (const hand of hands) {
      ctx.beginPath();
      for (const lm of hand.landmarks) {
        const cx = lm.x * W;
        const cy = lm.y * H;
        if (lm === hand.landmarks[0]) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      // Connect fingers
      const fingers = [
        [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]
      ];
      for (const seq of fingers) {
        ctx.moveTo(hand.landmarks[seq[0]].x * W, hand.landmarks[seq[0]].y * H);
        for (let i = 1; i < seq.length; i++) {
          ctx.lineTo(hand.landmarks[seq[i]].x * W, hand.landmarks[seq[i]].y * H);
        }
      }
      ctx.strokeStyle = gesture.fingerHeart ? '#ff00aa' : '#00f0ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = gesture.fingerHeart ? '#ff00aa' : '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Square effect around hand center
    for (const hand of hands) {
      const cx = hand.centerX * W;
      const cy = hand.centerY * H;
      const size = 80 + Math.abs(Math.sin(frameRef.current * 0.1)) * 60;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(frameRef.current * 0.02);
      ctx.strokeStyle = gesture.fingerHeart ? 'rgba(255,0,170,0.6)' : 'rgba(0,240,255,0.5)';
      ctx.lineWidth = 2;
      ctx.shadowColor = gesture.fingerHeart ? '#ff00aa' : '#00f0ff';
      ctx.shadowBlur = 15;
      ctx.strokeRect(-size / 2, -size / 2, size, size);
      ctx.restore();

      // Particles at finger tips
      const tips = [4, 8, 12, 16, 20];
      for (const tip of tips) {
        const tx = hand.landmarks[tip].x * W;
        const ty = hand.landmarks[tip].y * H;
        drawFingerTrail(ctx, tx, ty, `tip-${tip}-${hands.indexOf(hand)}`, '#00f0ff');
        if (Math.random() > 0.7) {
          particlesRef.current.push(...spawnParticles(tx, ty, 1, '#00f0ff', 1));
        }
        if (gesture.fingerHeart && (tip === 4 || tip === 8)) {
          particlesRef.current.push(...spawnParticles(tx, ty, 2, '#ff00aa', 1.5));
        }
        if (gesture.clap) {
          particlesRef.current.push(...spawnParticles(tx, ty, 3, '#ccff00', 2));
        }
      }
    }

    // Finger heart hearts
    if (gesture.fingerHeart) {
      for (const hand of hands) {
        const thumbTip = hand.landmarks[4];
        const indexTip = hand.landmarks[8];
        const mx = ((thumbTip.x + indexTip.x) / 2) * W;
        const my = ((thumbTip.y + indexTip.y) / 2) * H;
        for (let i = 0; i < 3; i++) {
          const angle = frameRef.current * 0.05 + i;
          const r = 20 + Math.sin(angle) * 10;
          const hx = mx + Math.cos(angle * 2) * r;
          const hy = my + Math.sin(angle) * r - 20;
          drawHeart(ctx, hx, hy, 12 + Math.sin(angle) * 4, '#ff66b3');
        }
      }
    }

    particlesRef.current = updateParticles(particlesRef.current);
    for (const p of particlesRef.current) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color.replace(')', `, ${p.life / p.maxLife})`).replace('rgb', 'rgba');
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }

    ctx.restore();
    frameRef.current++;
  }, [hands, gesture, videoWidth, videoHeight, effectMode, drawFingerTrail]);

  useEffect(() => {
    const loop = () => {
      render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      width={videoWidth || 1280}
      height={videoHeight || 720}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 20, size / 20);
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.bezierCurveTo(6, -12, 12, -6, 0, 6);
  ctx.bezierCurveTo(-12, -6, -6, -12, 0, -6);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}
