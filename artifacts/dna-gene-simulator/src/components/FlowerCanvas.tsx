import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import hibiscusUrl from '@assets/extracted/hibiscus.png';
import type { FlowerSize, PetalShape, PigmentIntensity } from '../App';

interface FlowerCanvasProps {
  geneColor: string;
  flowerSize?: FlowerSize;
  petalShape?: PetalShape;
  pigmentIntensity?: PigmentIntensity;
}

interface ShapeParams {
  width: number;
  length: number;
  wave: number;
}

const SHAPE_PARAMS: Record<PetalShape, ShapeParams> = {
  rounded: { width: 1, length: 1, wave: 0.006 },
  narrow: { width: 0.72, length: 1.12, wave: 0.012 },
  wavy: { width: 0.96, length: 1.01, wave: 0.055 },
};

const PETAL_AXES = [-2.55, -1.58, -0.55, 0.55, 2.35];
const MORPH_DURATION = 1350;
const CANVAS_SIZE = 500;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function shortestAngle(a: number, b: number) {
  let delta = a - b;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

function mixShape(a: ShapeParams, b: ShapeParams, t: number): ShapeParams {
  return {
    width: a.width + (b.width - a.width) * t,
    length: a.length + (b.length - a.length) * t,
    wave: a.wave + (b.wave - a.wave) * t,
  };
}

export default function FlowerCanvas({
  geneColor,
  flowerSize = 'large',
  petalShape = 'rounded',
  pigmentIntensity = 'deep',
}: FlowerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tintedDataRef = useRef<Uint8ClampedArray | null>(null);
  const sourceBoundaryRef = useRef<Float32Array | null>(null);
  const imgLoadedRef = useRef(false);
  const shapeRef = useRef<ShapeParams>(SHAPE_PARAMS.rounded);
  const morphFrameRef = useRef<number | null>(null);

  const colorizeFlower = (hex: string, intensity: PigmentIntensity) => {
    if (!imgLoadedRef.current || !scratchCanvasRef.current) return;

    const scratch = scratchCanvasRef.current;
    const sourceCtx = scratch.getContext('2d', { willReadFrequently: true });
    if (!sourceCtx) return;

    const source = sourceCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;
    const tinted = new Uint8ClampedArray(source.length);
    const tr = parseInt(hex.slice(1, 3), 16);
    const tg = parseInt(hex.slice(3, 5), 16);
    const tb = parseInt(hex.slice(5, 7), 16);
    const sat = intensity === 'pale' ? 0.30 : intensity === 'medium' ? 0.65 : 1.0;
    const gray = 0.299 * tr + 0.587 * tg + 0.114 * tb;

    for (let i = 0; i < source.length; i += 4) {
      const lum = (source[i] * 0.299 + source[i + 1] * 0.587 + source[i + 2] * 0.114) / 255;
      tinted[i] = Math.round((tr * sat + gray * (1 - sat)) * lum);
      tinted[i + 1] = Math.round((tg * sat + gray * (1 - sat)) * lum);
      tinted[i + 2] = Math.round((tb * sat + gray * (1 - sat)) * lum);
      tinted[i + 3] = lum > 0.91 ? 0 : source[i + 3];
    }

    tintedDataRef.current = tinted;
    renderMorphedFlower(shapeRef.current);
  };

  const renderMorphedFlower = (shape: ShapeParams) => {
    const canvas = canvasRef.current;
    const tinted = tintedDataRef.current;
    if (!canvas || !tinted) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const output = ctx.createImageData(CANVAS_SIZE, CANVAS_SIZE);
    const pixels = output.data;
    const boundary = sourceBoundaryRef.current;
    const cx = CANVAS_SIZE * 0.485;
    const cy = CANVAS_SIZE * 0.635;
    const coreRadius = CANVAS_SIZE * 0.115;
    const stemAngle = -0.98;
    const lobeWidth = Math.PI / 5.1;

    for (let y = 0; y < CANVAS_SIZE; y += 1) {
      for (let x = 0; x < CANVAS_SIZE; x += 1) {
        const dx = x - cx;
        const dy = y - cy;
        const radius = Math.hypot(dx, dy);
        if (radius < 0.5) continue;
        const angle = Math.atan2(dy, dx);
        const pixel = (y * CANVAS_SIZE + x) * 4;
        const keepOriginal = radius < coreRadius || Math.abs(shortestAngle(angle, stemAngle)) < 0.12;

        let sourceX = x;
        let sourceY = y;
        if (!keepOriginal && boundary) {
          let nearestAxis = PETAL_AXES[0];
          let nearestDelta = Math.abs(shortestAngle(angle, nearestAxis));
          for (const axis of PETAL_AXES.slice(1)) {
            const delta = Math.abs(shortestAngle(angle, axis));
            if (delta < nearestDelta) {
              nearestAxis = axis;
              nearestDelta = delta;
            }
          }

          if (nearestDelta > lobeWidth) continue;
          const sourceAngle = nearestAxis + shortestAngle(angle, nearestAxis) / Math.max(shape.width, 0.55);
          const sourceIndex = ((Math.round(((sourceAngle + Math.PI) / (Math.PI * 2)) * boundary.length) % boundary.length) + boundary.length) % boundary.length;
          const sourceRadius = boundary[sourceIndex];
          const wave = shape.wave * Math.sin(sourceAngle * 7 + nearestAxis * 1.7) * Math.sin(Math.min(1, radius / 120) * Math.PI / 2);
          const targetRadius = sourceRadius * shape.length * (1 + wave);
          if (radius > targetRadius) continue;

          const normalizedRadius = radius / Math.max(targetRadius, 1);
          const mappedRadius = normalizedRadius * sourceRadius;
          sourceX = Math.round(cx + Math.cos(sourceAngle) * mappedRadius);
          sourceY = Math.round(cy + Math.sin(sourceAngle) * mappedRadius);
        }

        if (sourceX < 0 || sourceX >= CANVAS_SIZE || sourceY < 0 || sourceY >= CANVAS_SIZE) continue;
        const sourcePixel = (sourceY * CANVAS_SIZE + sourceX) * 4;
        pixels[pixel] = tinted[sourcePixel];
        pixels[pixel + 1] = tinted[sourcePixel + 1];
        pixels[pixel + 2] = tinted[sourcePixel + 2];
        pixels[pixel + 3] = tinted[sourcePixel + 3];
      }
    }
    ctx.putImageData(output, 0, 0);
  };

  useEffect(() => {
    const img = new Image();
    img.src = hibiscusUrl;
    img.onload = () => {
      const scratch = document.createElement('canvas');
      scratch.width = CANVAS_SIZE;
      scratch.height = CANVAS_SIZE;
      const ctx = scratch.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      scratchCanvasRef.current = scratch;

      const source = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;
      const cx = CANVAS_SIZE * 0.485;
      const cy = CANVAS_SIZE * 0.635;
      const bins = 360;
      const boundary = new Float32Array(bins);
      boundary.fill(8);
      for (let y = 0; y < CANVAS_SIZE; y += 1) {
        for (let x = 0; x < CANVAS_SIZE; x += 1) {
          const pixel = (y * CANVAS_SIZE + x) * 4;
          if (source[pixel + 3] < 18) continue;
          const dx = x - cx;
          const dy = y - cy;
          const radius = Math.hypot(dx, dy);
          const bin = Math.floor(((Math.atan2(dy, dx) + Math.PI) / (Math.PI * 2)) * bins) % bins;
          boundary[bin] = Math.max(boundary[bin], radius);
        }
      }
      for (let i = 0; i < bins; i += 1) {
        const previous = boundary[(i + bins - 1) % bins];
        const next = boundary[(i + 1) % bins];
        if (boundary[i] < 20) boundary[i] = (previous + next) / 2;
      }
      sourceBoundaryRef.current = boundary;
      imgLoadedRef.current = true;
      colorizeFlower(geneColor, pigmentIntensity);
    };
  }, []);

  useEffect(() => {
    colorizeFlower(geneColor, pigmentIntensity);
  }, [geneColor, pigmentIntensity]);

  useEffect(() => {
    const from = shapeRef.current;
    const to = SHAPE_PARAMS[petalShape];
    if (!imgLoadedRef.current) {
      shapeRef.current = to;
      return;
    }

    if (morphFrameRef.current !== null) cancelAnimationFrame(morphFrameRef.current);
    const started = performance.now();
    const animate = (now: number) => {
      const progress = Math.min(1, (now - started) / MORPH_DURATION);
      const eased = easeInOutCubic(progress);
      shapeRef.current = mixShape(from, to, eased);
      renderMorphedFlower(shapeRef.current);
      if (progress < 1) morphFrameRef.current = requestAnimationFrame(animate);
      else morphFrameRef.current = null;
    };
    morphFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (morphFrameRef.current !== null) cancelAnimationFrame(morphFrameRef.current);
    };
  }, [petalShape]);

  useEffect(() => () => {
    if (morphFrameRef.current !== null) cancelAnimationFrame(morphFrameRef.current);
  }, []);

  const r = parseInt(geneColor.slice(1, 3), 16);
  const g = parseInt(geneColor.slice(3, 5), 16);
  const b = parseInt(geneColor.slice(5, 7), 16);
  const sizeScale = flowerSize === 'small' ? 0.60 : flowerSize === 'medium' ? 0.80 : 1.0;

  return (
    <div className="flex justify-center bg-white/5 rounded-2xl border border-[#bfe3ee14] p-[clamp(10px,1.8vh,16px)]">
      <motion.div
        animate={{ scale: sizeScale }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: 'flex', transformOrigin: 'center center' }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="w-[clamp(120px,20vw,210px)] h-[clamp(120px,20vw,210px)] rounded-lg block transition-[filter] duration-500"
          style={{ filter: `drop-shadow(0 0 22px rgba(${r},${g},${b},0.5))` }}
          aria-label="Hibiscus flower showing current gene traits"
        />
      </motion.div>
    </div>
  );
}
