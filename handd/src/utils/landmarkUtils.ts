export interface Landmark2D {
  x: number;
  y: number;
  z?: number;
}

export interface HandData {
  landmarks: Landmark2D[];
  handedness: 'Left' | 'Right';
  centerX: number;
  centerY: number;
  velocity: number;
}

export function getFingerLandmarks(landmarks: Landmark2D[]) {
  return {
    wrist: landmarks[0],
    thumb: { tip: landmarks[4], joints: [landmarks[1], landmarks[2], landmarks[3], landmarks[4]] },
    index: { tip: landmarks[8], joints: [landmarks[5], landmarks[6], landmarks[7], landmarks[8]] },
    middle: { tip: landmarks[12], joints: [landmarks[9], landmarks[10], landmarks[11], landmarks[12]] },
    ring: { tip: landmarks[16], joints: [landmarks[13], landmarks[14], landmarks[15], landmarks[16]] },
    pinky: { tip: landmarks[20], joints: [landmarks[17], landmarks[18], landmarks[19], landmarks[20]] },
  };
}

export function distance(a: Landmark2D, b: Landmark2D) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function handVelocity(current: HandData, previous: HandData | null, dt: number) {
  if (!previous || dt <= 0) return 0;
  const dx = current.centerX - previous.centerX;
  const dy = current.centerY - previous.centerY;
  return Math.hypot(dx, dy) / dt * 60;
}
