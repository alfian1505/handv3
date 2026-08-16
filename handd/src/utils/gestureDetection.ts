import { HandData, distance, getFingerLandmarks } from './landmarkUtils';

export interface GestureState {
  fingerHeart: boolean;
  clap: boolean;
  openPalm: boolean;
  fist: boolean;
  peace: boolean;
  pointing: boolean;
  thumbsUp: boolean;
  clapCooldown: number;
  fingerHeartFrames: number;
}

export function detectGestures(
  hands: HandData[],
  dt: number = 16,
  state: GestureState
): GestureState {
  const next = { ...state };
  next.clapCooldown = Math.max(0, next.clapCooldown - dt);

  if (hands.length >= 2) {
    const h1 = hands[0].landmarks[0];
    const h2 = hands[1].landmarks[0];
    const d = distance(h1, h2);
    if (d < 0.15 && next.clapCooldown <= 0) {
      next.clap = true;
      next.clapCooldown = 500;
    } else {
      next.clap = false;
    }
  } else {
    next.clap = false;
  }

  for (const hand of hands) {
    const fingers = getFingerLandmarks(hand.landmarks);
    const thumbIndexDist = distance(fingers.thumb.tip, fingers.index.tip);
    const thumbIndexMidDist = distance(fingers.thumb.tip, fingers.index.joints[2]);
    if (thumbIndexDist < 0.08 && thumbIndexMidDist < 0.1) {
      next.fingerHeartFrames++;
      if (next.fingerHeartFrames > 5) next.fingerHeart = true;
    } else {
      next.fingerHeartFrames = Math.max(0, next.fingerHeartFrames - 3);
      if (next.fingerHeartFrames <= 0) next.fingerHeart = false;
    }
  }

  return next;
}
