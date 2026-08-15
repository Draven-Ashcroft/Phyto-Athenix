/**
 * PollinationCanvas — Canvas2D particle field of ~140 SEM-style hibiscus
 * pollen grains with directed transfer followed by Brownian motion.
 * Pre-renders sprite sheets for 60 fps.
 */
import { useEffect, useRef, useCallback } from 'react';

interface Props {
  active: boolean;
  stage: number;          // 3 = burst in, 4 = one grain selected/zooming
  paused: boolean;
  selectedIndex: number;  // which grain to spotlight when stage >= 4
  onGrainsReady: (idx: number) => void; // fires once with selected grain index
  geneColor: string;
}

// ─── Offscreen sprite factory ──────────────────────────────────────────────
function buildSprite(radius: number, seed: number): HTMLCanvasElement {
  const pad = Math.ceil(radius * 0.45);
  const sz  = radius * 2 + pad * 2;
  const c   = document.createElement('canvas');
  c.width   = sz;
  c.height  = sz;
  const ctx = c.getContext('2d')!;
  const cx  = sz / 2, cy = sz / 2;

  // ── Drop shadow ──
  ctx.shadowColor   = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur    = radius * 0.7;
  ctx.shadowOffsetX = radius * 0.12;
  ctx.shadowOffsetY = radius * 0.18;

  // ── Sphere body ──
  const body = ctx.createRadialGradient(
    cx - radius * 0.32, cy - radius * 0.32, radius * 0.05,
    cx, cy, radius,
  );
  body.addColorStop(0,    '#fff176');
  body.addColorStop(0.30, '#f5b520');
  body.addColorStop(0.65, '#b86010');
  body.addColorStop(0.90, '#7a3500');
  body.addColorStop(1,    '#2d1000');
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // ── 3 colporate apertures (tricolporate — Malvaceae-accurate) ──
  const colpiRot = (seed % 12) * 30 * (Math.PI / 180);
  for (let i = 0; i < 3; i++) {
    const a = colpiRot + (i / 3) * Math.PI * 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(a);
    // outer groove
    ctx.beginPath();
    ctx.ellipse(0, -radius * 0.70, radius * 0.20, radius * 0.44, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(35,12,0,0.58)';
    ctx.fill();
    // inner membrane shimmer
    ctx.beginPath();
    ctx.ellipse(0, -radius * 0.70, radius * 0.11, radius * 0.30, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(180,95,15,0.28)';
    ctx.fill();
    ctx.restore();
  }

  // ── Echinate spines (Fibonacci-distributed, orthographic projection) ──
  const spineN  = 16 + (seed % 8);
  const goldenA = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < spineN; i++) {
    const y3d  = 1 - (i / (spineN - 1)) * 2;
    const rxy  = Math.sqrt(Math.max(0, 1 - y3d * y3d));
    const phi  = goldenA * i + (seed % 7) * 0.9;
    const x3d  = Math.cos(phi) * rxy;
    // z = sin(phi)*rxy — depth; skip back-facing (z < -0.25)
    const z3d  = Math.sin(phi) * rxy;
    if (z3d < -0.20) continue;

    const bx = cx + x3d * radius;
    const by = cy - y3d * radius; // -y so "up" is top
    const len = radius * (0.20 + 0.10 * ((seed * 3 + i * 7) % 6) / 6);
    const nx  = x3d, ny = -y3d; // surface normal direction
    const tx  = bx + nx * len;
    const ty  = by + ny * len;

    const alpha = 0.45 + z3d * 0.38;
    const lw    = Math.max(0.4, radius * 0.075 * (0.45 + z3d * 0.55));
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = `rgba(75,28,0,${alpha.toFixed(2)})`;
    ctx.lineWidth   = lw;
    ctx.lineCap     = 'round';
    ctx.stroke();
  }

  // ── Specular highlight ──
  const spec = ctx.createRadialGradient(
    cx - radius * 0.38, cy - radius * 0.38, 0,
    cx - radius * 0.22, cy - radius * 0.22, radius * 0.58,
  );
  spec.addColorStop(0, 'rgba(255,255,220,0.46)');
  spec.addColorStop(1, 'rgba(255,255,220,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = spec;
  ctx.fill();

  // ── Limb darkening ──
  const limb = ctx.createRadialGradient(cx, cy, radius * 0.48, cx, cy, radius);
  limb.addColorStop(0, 'rgba(0,0,0,0)');
  limb.addColorStop(1, 'rgba(0,0,0,0.40)');
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = limb;
  ctx.fill();

  return c;
}

// ─── Grain data ───────────────────────────────────────────────────────────
interface Grain {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  sprite: HTMLCanvasElement;
  pad: number;
  rotation: number;
  rotSpeed: number;
  opacity: number;
  seed: number;
}

const GRAIN_COUNT = 140;

export default function PollinationCanvas({
  active, stage, paused, selectedIndex, onGrainsReady, geneColor,
}: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const grains     = useRef<Grain[]>([]);
  const rafRef     = useRef<number>(0);
  const readyFired = useRef(false);
  const frameCount = useRef(0);

  // ── Initialise grain field ──────────────────────────────────────────────
  const init = useCallback((w: number, h: number) => {
    readyFired.current = false;
    frameCount.current = 0;
    const cx = w / 2, cy = h / 2;
    const list: Grain[] = [];

    for (let i = 0; i < GRAIN_COUNT; i++) {
      const seed  = i * 37 + 11;
      const r     = 4 + (seed % 9) * 0.55;         // radii 4–9 px
      const pad   = Math.ceil(r * 0.45);
      // Release from anther on the left and travel toward the stigma on the right.
      const originX = w * 0.22;
      const originY = h * 0.52;
      const targetX = w * 0.78;
      const targetY = h * 0.47;
      const angle = Math.atan2(targetY - originY, targetX - originX) + ((seed % 20) - 10) * 0.035;
      const burst = 1.8 + (seed % 12) * 0.12;
      list.push({
        x: originX + (Math.random() - 0.5) * 14,
        y: originY + ((i % 17) - 8) * 3.2,
        vx: Math.cos(angle) * burst,
        vy: Math.sin(angle) * burst,
        r, pad,
        sprite: buildSprite(r, seed),
        rotation:  (seed % 360) * (Math.PI / 180),
        rotSpeed: ((seed % 7) - 3) * 0.004,
        opacity: 0,
        seed,
      });
    }
    grains.current = list;
  }, []);

  // ── Animation loop ─────────────────────────────────────────────────────
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { width: W, height: H } = canvas;

    if (!paused) frameCount.current++;
    const frame = frameCount.current;
    const gs = grains.current;

    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < gs.length; i++) {
      const g = gs[i];

      // ── Fade in first 60 frames ──
      if (g.opacity < 1) g.opacity = Math.min(1, g.opacity + 0.025);

      if (!paused) {
        // ── Physics: directed transfer, then gentle Brownian motion ──
        const decay = 0.97;
        g.vx *= decay;
        g.vy *= decay;
        if (stage === 3) {
          const targetX = W * 0.78;
          const targetY = H * (0.47 + Math.sin(g.seed * 0.11) * 0.04);
          const dx = targetX - g.x;
          const dy = targetY - g.y;
          const distance = Math.max(1, Math.hypot(dx, dy));
          const steering = distance > 18 ? 0.11 : 0.035;
          g.vx += (dx / distance) * steering;
          g.vy += (dy / distance) * steering;
        }
        // Brownian kick
        g.vx += (Math.random() - 0.5) * (stage === 3 ? 0.07 : 0.18);
        g.vy += (Math.random() - 0.5) * (stage === 3 ? 0.07 : 0.18);
        // Gentle gravity / buoyancy oscillation
        g.vy += Math.sin(frame * 0.018 + g.seed) * 0.04;
        // Clamp speed
        const spd = Math.sqrt(g.vx * g.vx + g.vy * g.vy);
        if (spd > 2.5) { g.vx *= 2.5 / spd; g.vy *= 2.5 / spd; }

        g.x += g.vx;
        g.y += g.vy;

        // ── Soft boundary bounce ──
        const margin = g.r + g.pad + 4;
        if (g.x < margin)       { g.x = margin;       g.vx = Math.abs(g.vx) * 0.6; }
        if (g.x > W - margin)   { g.x = W - margin;   g.vx = -Math.abs(g.vx) * 0.6; }
        if (g.y < margin)       { g.y = margin;        g.vy = Math.abs(g.vy) * 0.6; }
        if (g.y > H - margin)   { g.y = H - margin;    g.vy = -Math.abs(g.vy) * 0.6; }

        g.rotation += g.rotSpeed;
      }

      // ── Draw ──
      const isSelected = (i === selectedIndex && stage >= 4);
      const sz         = g.r * 2 + g.pad * 2;

      // Skip selected grain once stage ≥ 4 (it's rendered via SVG zoom)
      if (isSelected) continue;

      ctx.save();
      ctx.globalAlpha = g.opacity * (stage >= 4 && i !== selectedIndex ? 0.6 : 1.0);
      ctx.translate(g.x, g.y);
      ctx.rotate(g.rotation);
      ctx.drawImage(g.sprite, -sz / 2, -sz / 2, sz, sz);
      ctx.restore();

      // ── Stage ≥ 4: spotlight halo around selected grain ──
      if (stage >= 4 && i === selectedIndex) {
        // draw a shrinking halo where it was (before it's gone)
      }
    }

    // ── Spotlight ring on selected grain (stages 3+: while still in field) ──
    if (stage === 3 && frame > 80 && !readyFired.current) {
      // Pick a grain that has reached the stigma-facing side of the field.
      const cx = W * 0.78, cy = H * 0.47;
      let best = 0, bestDist = Infinity;
      gs.forEach((g, i) => {
        const d = Math.hypot(g.x - cx, g.y - cy);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      readyFired.current = true;
      onGrainsReady(best);
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [stage, paused, selectedIndex, onGrainsReady]);

  // ── Lifecycle ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const obs = new ResizeObserver(() => {
      canvas.width  = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      init(canvas.width, canvas.height);
    });
    obs.observe(canvas);
    canvas.width  = canvas.clientWidth || 400;
    canvas.height = canvas.clientHeight || 300;
    init(canvas.width, canvas.height);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      obs.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, init]);

  // restart loop when animate dep changes (stage / selectedIndex)
  useEffect(() => {
    if (!active) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: active ? 'block' : 'none' }}
    />
  );
}
