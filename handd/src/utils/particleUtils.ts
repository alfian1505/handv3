export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  rotation: number;
  rotSpeed: number;
}

export function spawnParticles(
  x: number,
  y: number,
  count: number,
  color: string = '#00f0ff',
  speed: number = 2
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    particles.push({
      x, y,
      vx: Math.cos(angle) * (0.5 + Math.random()) * speed,
      vy: Math.sin(angle) * (0.5 + Math.random()) * speed - 1,
      life: 1,
      maxLife: 30 + Math.random() * 40,
      size: 3 + Math.random() * 8,
      color,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
    });
  }
  return particles;
}

export function updateParticles(particles: Particle[], dt: number = 16) {
  for (const p of particles) {
    p.x += p.vx * (dt / 16);
    p.y += p.vy * (dt / 16);
    p.vy += 0.05;
    p.life -= dt / 16;
    p.rotation += p.rotSpeed;
  }
  return particles.filter((p) => p.life > 0);
}
