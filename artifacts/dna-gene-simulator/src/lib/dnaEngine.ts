export const SVG_NS = 'http://www.w3.org/2000/svg';
export const TAU = Math.PI * 2;

export const PRESETS = [
  { hex: '#EC4899', label: 'Pink' },
  { hex: '#F97316', label: 'Orange' },
  { hex: '#EAB308', label: 'Yellow' },
  { hex: '#22C55E', label: 'Green' },
  { hex: '#3B82F6', label: 'Blue' },
  { hex: '#9333EA', label: 'Purple' },
];

export const DEFAULT_COLOR = PRESETS[0].hex;

// ── Multi-gene system ──────────────────────────────────────────────────────
export const GENE_DEFS = [
  { id: 0, fraction: 0.50, shortName: 'Colour',    name: 'Colour Gene',     trait: 'Flower Colour',     description: 'Controls which pigment molecules are produced in petal cells, determining petal colour.' },
  { id: 1, fraction: 0.25, shortName: 'Size',      name: 'Size Gene',       trait: 'Flower Size',       description: 'Regulates cell proliferation in petal tissue, influencing the overall diameter of the flower.' },
  { id: 2, fraction: 0.72, shortName: 'Shape',     name: 'Shape Gene',      trait: 'Petal Shape',       description: 'Governs the curvature and margin development of each petal during floral organ differentiation.' },
  { id: 3, fraction: 0.14, shortName: 'Intensity', name: 'Intensity Gene',  trait: 'Pigment Intensity', description: 'Controls the concentration of pigment deposited per cell, modulating colour depth from pale to saturated.' },
] as const;

export type GeneId = 0 | 1 | 2 | 3;

// Fixed display colours for each gene (gene 0 uses the user-picked geneColor instead)
export const GENE_COLORS = ['#EC4899', '#22C55E', '#F97316', '#3B82F6'] as const;

export const CONFIG = {
  layout: { masterUnitDivisor: 24 },
  helix: {
    samplesPerBp: 6, radiusUnits: 2.3, risePerBpUnits: 0.78,
    twistPerBp: TAU / 10.5,
    minorGrooveAngle: (135 * Math.PI) / 180,
    initialPhase: Math.PI / 6,
    backboneWidthUnits: 0.16, rungWidthUnits: 0.11,
    backboneBackOpacity: 0.32, backboneFrontOpacity: 0.95,
    rungOpacityRange: [0.30, 1.0], rungWidthRange: [0.75, 1.15],
    heightOverflow: 1.28
  },
  motion: {
    driftAmpXUnits: 0.40, driftAmpYUnits: 0.28, driftFreqScale: 1.0,
    bendAmpUnits: 0.58, bendWavelength1: 1.15, bendWavelength2: 2.6,
    bendSpeed1: 0.000075, bendSpeed2: 0.00010,
    breatheAmpFraction: 0.032, breatheFreqScale: 1.6,
    reducedMotionScale: 0.22
  },
  particles: {
    count: 42, minRadiusUnits: 0.035, maxRadiusUnits: 0.11,
    minOpacity: 0.10, maxOpacity: 0.38, driftAmpUnits: 0.55
  },
  gene: {
    lengthBp: 5, glowOpacity: 0.30,
    glowBlurUnits: 1.05, rungGlowBlurUnits: 0.16,
    padXUnits: 0.55, padYUnits: 0.38,
    labelFloatAmpUnits: 0.18, labelOffsetXUnits: 2.6
  },
  colors: {
    backbone: '#5FD8E8', particle: '#BFE3EE',
    bases: { A: '#4ADE80', T: '#FB7185', G: '#60A5FA', C: '#FBBF24' }
  }
};

export function smoothNoise(t: number, seed: number, freqScale = 1) {
  const a = seed * 12.9898, b = seed * 78.233;
  return (
    Math.sin(t * 0.00017 * freqScale + a) * 0.5 +
    Math.sin(t * 0.00043 * freqScale + b) * 0.3 +
    Math.sin(t * 0.00081 * freqScale + a * 0.63 + b * 0.37) * 0.2
  );
}

export function lerp(a: number, b: number, f: number) { return a + (b - a) * f; }
export function clamp01(x: number) { return x < 0 ? 0 : x > 1 ? 1 : x; }
export function hexToRgb(hex: string) {
  return { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) };
}
export function generateSequence(n: number) {
  const pairs = [['A', 'T'], ['T', 'A'], ['G', 'C'], ['C', 'G']];
  return Array.from({ length: n }, () => pairs[(Math.random() * 4) | 0]);
}

export class DNAHelix {
  root: SVGElement;
  reducedMotion: boolean;
  sequence: string[][];
  strand1Back: SVGPathElement;
  strand2Back: SVGPathElement;
  rungGroup: SVGGElement;
  strand1Front: SVGPathElement;
  strand2Front: SVGPathElement;
  
  masterUnit = 0;
  centerX = 0;
  centerY = 0;
  radius = 0;
  risePerBp = 0;
  backboneWidth = 0;
  rungWidthBase = 0;
  bpCount = 0;
  halfHeight = 0;
  samples: any[] = [];
  bpSamples: any[] = [];
  rungs: any[] = [];

  constructor(root: SVGElement, reducedMotion: boolean) {
    this.root = root;
    this.reducedMotion = reducedMotion;
    this.sequence = [];
    this.strand1Back = document.createElementNS(SVG_NS, 'path');
    this.strand2Back = document.createElementNS(SVG_NS, 'path');
    this.rungGroup = document.createElementNS(SVG_NS, 'g');
    this.strand1Front = document.createElementNS(SVG_NS, 'path');
    this.strand2Front = document.createElementNS(SVG_NS, 'path');
    
    [this.strand1Back, this.strand2Back].forEach(p => {
      p.setAttribute('fill', 'none'); p.setAttribute('stroke', CONFIG.colors.backbone);
      p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
      p.setAttribute('opacity', CONFIG.helix.backboneBackOpacity.toString());
    });
    
    [this.strand1Front, this.strand2Front].forEach(p => {
      p.setAttribute('fill', 'none'); p.setAttribute('stroke', CONFIG.colors.backbone);
      p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
      p.setAttribute('opacity', CONFIG.helix.backboneFrontOpacity.toString());
      p.setAttribute('filter', 'url(#glow)');
    });
    
    this.root.appendChild(this.strand1Back);
    this.root.appendChild(this.strand2Back);
    this.root.appendChild(this.rungGroup);
    this.root.appendChild(this.strand1Front);
    this.root.appendChild(this.strand2Front);
  }

  layout(w: number, h: number) {
    const H = CONFIG.helix;
    const mu = h / CONFIG.layout.masterUnitDivisor;
    this.masterUnit = mu; this.centerX = w / 2; this.centerY = h / 2;
    this.radius = mu * H.radiusUnits; this.risePerBp = mu * H.risePerBpUnits;
    this.backboneWidth = mu * H.backboneWidthUnits; this.rungWidthBase = mu * H.rungWidthUnits;
    const total = h * H.heightOverflow;
    this.bpCount = Math.max(8, Math.ceil(total / this.risePerBp));
    this.halfHeight = (this.bpCount * this.risePerBp) / 2;
    const needed = this.bpCount + 2;
    if (this.sequence.length < needed)
      this.sequence = this.sequence.concat(generateSequence(needed - this.sequence.length));
    
    [this.strand1Back, this.strand2Back, this.strand1Front, this.strand2Front]
      .forEach(p => p.setAttribute('stroke-width', this.backboneWidth.toFixed(2)));
    
    this._buildSamples();
    this._buildRungs();
  }

  _buildSamples() {
    const H = CONFIG.helix, n = this.bpCount * H.samplesPerBp + 1;
    this.samples = Array.from({ length: n }, (_, j) => {
      const bp = j / H.samplesPerBp;
      const a1 = H.initialPhase + bp * H.twistPerBp, a2 = a1 + H.minorGrooveAngle;
      return {
        yFraction: bp / this.bpCount, yBase: this.centerY - this.halfHeight + bp * this.risePerBp,
        cos1: Math.cos(a1), sin1: Math.sin(a1), cos2: Math.cos(a2), sin2: Math.sin(a2),
        isFront1: Math.sin(a1) >= 0, isFront2: Math.sin(a2) >= 0, isBp: j % H.samplesPerBp === 0
      };
    });
  }

  _buildRungs() {
    this.rungGroup.textContent = '';
    const H = CONFIG.helix, [oMin, oMax] = H.rungOpacityRange, [wMin, wMax] = H.rungWidthRange;
    this.bpSamples = this.samples.filter(s => s.isBp);
    this.rungs = this.bpSamples.map((s, i) => {
      const [b1, b2] = this.sequence[i];
      const dA = clamp01((s.sin1 + 1) / 2), dB = clamp01((s.sin2 + 1) / 2);
      const lA = document.createElementNS(SVG_NS, 'line'), lB = document.createElementNS(SVG_NS, 'line');
      lA.setAttribute('stroke', (CONFIG.colors.bases as any)[b1]); lB.setAttribute('stroke', (CONFIG.colors.bases as any)[b2]);
      lA.setAttribute('stroke-linecap', 'round'); lB.setAttribute('stroke-linecap', 'round');
      lA.setAttribute('opacity', lerp(oMin, oMax, dA).toFixed(2)); lB.setAttribute('opacity', lerp(oMin, oMax, dB).toFixed(2));
      lA.setAttribute('stroke-width', (this.rungWidthBase * lerp(wMin, wMax, dA)).toFixed(2));
      lB.setAttribute('stroke-width', (this.rungWidthBase * lerp(wMin, wMax, dB)).toFixed(2));
      this.rungGroup.appendChild(lA); this.rungGroup.appendChild(lB);
      return { lineA: lA, lineB: lB, base1: b1, base2: b2 };
    });
  }

  update(t: number) {
    const M = CONFIG.motion, sc = this.reducedMotion ? M.reducedMotionScale : 1;
    const dX = this.masterUnit * M.driftAmpXUnits * sc * smoothNoise(t, 1.7, M.driftFreqScale);
    const dY = this.masterUnit * M.driftAmpYUnits * sc * smoothNoise(t, 5.3, M.driftFreqScale);
    const br = 1 + M.breatheAmpFraction * sc * smoothNoise(t, 9.1, M.breatheFreqScale);
    const r = this.radius * br, bA = this.masterUnit * M.bendAmpUnits * sc;
    let s1F = '', s1B = '', s2F = '', s2B = '', l1 = null, l2 = null;
    for (let j = 0; j < this.samples.length; j++) {
      const s = this.samples[j];
      const bend = bA * (Math.sin(s.yFraction * TAU * M.bendWavelength1 + t * M.bendSpeed1) * 0.7 +
        Math.sin(s.yFraction * TAU * M.bendWavelength2 - t * M.bendSpeed2 + 2.1) * 0.3);
      const ax = this.centerX + dX + bend, x1 = ax + r * s.cos1, x2 = ax + r * s.cos2, y = s.yBase + dY;
      const c1 = s.isFront1 === l1 ? 'L' : 'M', sg1 = c1 + x1.toFixed(1) + ',' + y.toFixed(1) + ' ';
      if (s.isFront1) s1F += sg1; else s1B += sg1; l1 = s.isFront1;
      const c2 = s.isFront2 === l2 ? 'L' : 'M', sg2 = c2 + x2.toFixed(1) + ',' + y.toFixed(1) + ' ';
      if (s.isFront2) s2F += sg2; else s2B += sg2; l2 = s.isFront2;
      if (s.isBp) { s.curX1 = x1; s.curX2 = x2; s.curY = y; }
    }
    this.strand1Front.setAttribute('d', s1F); this.strand1Back.setAttribute('d', s1B);
    this.strand2Front.setAttribute('d', s2F); this.strand2Back.setAttribute('d', s2B);
    for (let i = 0; i < this.rungs.length; i++) {
      const s = this.bpSamples[i], mid = (s.curX1 + s.curX2) / 2, rng = this.rungs[i];
      rng.lineA.setAttribute('x1', s.curX1.toFixed(1)); rng.lineA.setAttribute('y1', s.curY.toFixed(1));
      rng.lineA.setAttribute('x2', mid.toFixed(1)); rng.lineA.setAttribute('y2', s.curY.toFixed(1));
      rng.lineB.setAttribute('x1', mid.toFixed(1)); rng.lineB.setAttribute('y1', s.curY.toFixed(1));
      rng.lineB.setAttribute('x2', s.curX2.toFixed(1)); rng.lineB.setAttribute('y2', s.curY.toFixed(1));
    }
  }
}

export class ParticleField {
  root: SVGElement;
  reducedMotion: boolean;
  particles: any[];
  masterUnit = 0;

  constructor(root: SVGElement, count: number, rm: boolean) {
    this.root = root; this.reducedMotion = rm;
    this.particles = Array.from({ length: count }, () => {
      const el = document.createElementNS(SVG_NS, 'circle');
      el.setAttribute('fill', CONFIG.colors.particle);
      root.appendChild(el);
      return {
        el, fx: Math.random(), fy: Math.random(), sizeSeed: Math.random(),
        seedX: Math.random() * 1000, seedY: Math.random() * 1000, freqScale: 0.5 + Math.random() * 1.6
      };
    });
  }

  layout(w: number, h: number, mu: number) {
    this.masterUnit = mu;
    const P = CONFIG.particles;
    this.particles.forEach(p => {
      p.baseCx = p.fx * w; p.baseCy = p.fy * h;
      p.r = lerp(P.minRadiusUnits, P.maxRadiusUnits, p.sizeSeed) * mu;
      p.el.setAttribute('r', p.r.toFixed(2));
      p.el.setAttribute('opacity', lerp(P.minOpacity, P.maxOpacity, p.sizeSeed).toFixed(2));
    });
  }

  update(t: number) {
    const sc = this.reducedMotion ? CONFIG.motion.reducedMotionScale : 1;
    const amp = CONFIG.particles.driftAmpUnits * this.masterUnit * sc;
    this.particles.forEach(p => {
      p.el.setAttribute('cx', (p.baseCx + smoothNoise(t, p.seedX, p.freqScale) * amp).toFixed(1));
      p.el.setAttribute('cy', (p.baseCy + smoothNoise(t, p.seedY, p.freqScale) * amp).toFixed(1));
    });
  }
}

export class GeneHighlight {
  helix: DNAHelix;
  reducedMotion: boolean;
  startIndex = 0;
  endIndex = 0;
  highlightedRungs: any[] = [];
  glowRect: SVGRectElement;
  connector: SVGPathElement;
  marker: SVGCircleElement;
  labelGroup: SVGGElement;
  labelChip: SVGRectElement;
  labelText: SVGTextElement;
  color = '';
  masterUnit = 0;
  restCenterX = 0;
  restCenterY = 0;
  labelRestX = 0;
  labelRestY = 0;

  constructor(helix: DNAHelix, initColor: string, rm: boolean) {
    this.helix = helix; this.reducedMotion = rm;
    const root = helix.root;

    this.glowRect = document.createElementNS(SVG_NS, 'rect');
    this.glowRect.setAttribute('filter', 'url(#gene-glow-filter)');
    this.glowRect.setAttribute('opacity', CONFIG.gene.glowOpacity.toString());
    this.glowRect.classList.add('transition-colors', 'duration-500', 'ease-in-out');
    root.insertBefore(this.glowRect, root.firstChild);

    this.connector = document.createElementNS(SVG_NS, 'path');
    this.connector.setAttribute('fill', 'none'); this.connector.setAttribute('opacity', '0.75');
    this.connector.classList.add('transition-colors', 'duration-500', 'ease-in-out');
    root.appendChild(this.connector);

    this.marker = document.createElementNS(SVG_NS, 'circle');
    this.marker.setAttribute('filter', 'url(#gene-rung-glow)');
    this.marker.classList.add('transition-colors', 'duration-500', 'ease-in-out');
    root.appendChild(this.marker);

    this.labelGroup = document.createElementNS(SVG_NS, 'g');
    this.labelChip = document.createElementNS(SVG_NS, 'rect');
    this.labelChip.setAttribute('fill', 'rgba(10,8,26,0.65)');
    this.labelChip.classList.add('transition-colors', 'duration-500', 'ease-in-out');
    
    this.labelText = document.createElementNS(SVG_NS, 'text');
    this.labelText.setAttribute('text-anchor', 'middle');
    this.labelText.setAttribute('dominant-baseline', 'central');
    this.labelText.setAttribute('font-family', "-apple-system,'Segoe UI',Roboto,sans-serif");
    this.labelText.setAttribute('font-weight', '600');
    this.labelText.setAttribute('letter-spacing', '0.02em');
    this.labelText.setAttribute('fill', '#F1EEFB');
    this.labelText.textContent = 'Gene';
    
    this.labelGroup.appendChild(this.labelChip);
    this.labelGroup.appendChild(this.labelText);
    root.appendChild(this.labelGroup);

    this.setColor(initColor);
  }

  setColor(hex: string) {
    this.color = hex;
    this.glowRect.style.fill = hex;
    this.connector.style.stroke = hex;
    this.marker.style.fill = hex;
    this.labelChip.style.stroke = hex;
    this.highlightedRungs.forEach(rng => {
      rng.lineA.style.stroke = hex;
      rng.lineB.style.stroke = hex;
    });
  }

  _highlight(rng: any) {
    rng.lineA.classList.add('transition-colors', 'duration-500', 'ease-in-out');
    rng.lineB.classList.add('transition-colors', 'duration-500', 'ease-in-out');
    rng.lineA.style.stroke = this.color; rng.lineB.style.stroke = this.color;
    rng.lineA.setAttribute('filter', 'url(#gene-rung-glow)');
    rng.lineB.setAttribute('filter', 'url(#gene-rung-glow)');
  }

  layout(w: number, h: number) {
    const helix = this.helix, G = CONFIG.gene, mu = helix.masterUnit;
    this.masterUnit = mu;
    const count = helix.bpSamples.length, len = Math.min(G.lengthBp, count), half = Math.floor(len / 2);
    this.startIndex = Math.max(0, Math.min(count - len, Math.floor(count / 2) - half));
    this.endIndex = this.startIndex + len - 1;
    
    // Clear old filters if we changed rungs (like on sequence regen)
    this.helix.rungs.forEach(rng => {
      rng.lineA.removeAttribute('filter');
      rng.lineB.removeAttribute('filter');
    });
    
    this.highlightedRungs = helix.rungs.slice(this.startIndex, this.endIndex + 1);
    this.highlightedRungs.forEach(rng => this._highlight(rng));

    const topY = helix.bpSamples[this.startIndex].yBase;
    const botY = helix.bpSamples[this.endIndex].yBase;
    this.restCenterX = helix.centerX;
    this.restCenterY = (topY + botY) / 2;
    const desired = helix.radius + mu * G.labelOffsetXUnits;
    const maxOff = Math.max(w * 0.90 - this.restCenterX, mu * 1.5);
    this.labelRestX = this.restCenterX + Math.min(desired, maxOff);
    this.labelRestY = Math.max(this.restCenterY - mu * 1.8, h * 0.09);

    this.labelText.setAttribute('font-size', (mu * 0.42).toFixed(1));
    const bb = this.labelText.getBBox();
    
    // Fallback if getBBox fails (e.g. not rendered yet or in tests)
    const bbWidth = bb.width || mu * 2.5;
    const bbHeight = bb.height || mu * 0.5;
    const bbX = bb.x || -bbWidth / 2;
    const bbY = bb.y || -bbHeight / 2;

    const px = mu * 0.36, py = mu * 0.22;
    this.labelChip.setAttribute('x', (bbX - px).toFixed(1));
    this.labelChip.setAttribute('y', (bbY - py).toFixed(1));
    this.labelChip.setAttribute('width', (bbWidth + 2 * px).toFixed(1));
    this.labelChip.setAttribute('height', (bbHeight + 2 * py).toFixed(1));
    this.labelChip.setAttribute('rx', (mu * 0.24).toFixed(1));
    this.labelChip.setAttribute('stroke-width', (mu * 0.045).toFixed(2));
    this.marker.setAttribute('r', (mu * 0.15).toFixed(2));
    this.connector.setAttribute('stroke-width', (mu * 0.05).toFixed(2));
    this.connector.setAttribute('stroke-dasharray', (mu * 0.12).toFixed(2) + ',' + (mu * 0.11).toFixed(2));
  }

  update(t: number) {
    const helix = this.helix, G = CONFIG.gene, sc = this.reducedMotion ? CONFIG.motion.reducedMotionScale : 1;
    let minX = Infinity, maxX = -Infinity;
    for (let i = this.startIndex; i <= this.endIndex; i++) {
      const s = helix.bpSamples[i];
      if (s.curX1 < minX) minX = s.curX1; if (s.curX1 > maxX) maxX = s.curX1;
      if (s.curX2 < minX) minX = s.curX2; if (s.curX2 > maxX) maxX = s.curX2;
    }
    const topY = helix.bpSamples[this.startIndex].curY, botY = helix.bpSamples[this.endIndex].curY;
    const gX = (minX + maxX) / 2, gY = (topY + botY) / 2;
    const pX = this.masterUnit * G.padXUnits, pY = this.masterUnit * G.padYUnits;
    const rPill = Math.min((maxX - minX) + 2 * pX, (botY - topY) + 2 * pY) / 2;
    this.glowRect.setAttribute('x', (minX - pX).toFixed(1)); this.glowRect.setAttribute('y', (topY - pY).toFixed(1));
    this.glowRect.setAttribute('width', ((maxX - minX) + 2 * pX).toFixed(1));
    this.glowRect.setAttribute('height', ((botY - topY) + 2 * pY).toFixed(1));
    this.glowRect.setAttribute('rx', rPill.toFixed(1)); this.glowRect.setAttribute('ry', rPill.toFixed(1));

    const fAmp = this.masterUnit * G.labelFloatAmpUnits * sc;
    const lX = this.labelRestX + smoothNoise(t, 33.3, 0.8) * fAmp;
    const lY = this.labelRestY + smoothNoise(t, 47.7, 0.9) * fAmp * 0.7;
    this.labelGroup.setAttribute('transform', 'translate(' + lX.toFixed(1) + ',' + lY.toFixed(1) + ')');

    const dx = lX - gX, dy = lY - gY, dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const mX = (lX + gX) / 2, mY = (lY + gY) / 2, ca = this.masterUnit * 0.7;
    const cX = mX + (-dy / dist) * ca, cY = mY + (dx / dist) * ca;
    this.connector.setAttribute('d', 'M' + gX.toFixed(1) + ',' + gY.toFixed(1) + ' Q' + cX.toFixed(1) + ',' + cY.toFixed(1) + ' ' + lX.toFixed(1) + ',' + lY.toFixed(1));
    this.marker.setAttribute('cx', gX.toFixed(1)); this.marker.setAttribute('cy', gY.toFixed(1));
  }
}

// ── GeneRegion — additional gene markers for genes 1-3 ───────────────────────
// Mirrors GeneHighlight pattern but uses a parameterised fraction and fixed color.
// Gene 0 is still handled by GeneHighlight; this class manages genes 1-3.
export class GeneRegion {
  id: number;
  fraction: number;
  shortName: string;
  color: string;
  helix: DNAHelix;
  reducedMotion: boolean;

  startIndex = 0;
  endIndex = 0;
  highlightedRungs: any[] = [];
  glowRect: SVGRectElement;
  connector: SVGPathElement;
  marker: SVGCircleElement;
  labelGroup: SVGGElement;
  labelChip: SVGRectElement;
  labelText: SVGTextElement;

  masterUnit = 0;
  labelRestX = 0;
  labelRestY = 0;
  /** Current screen-space centre — read by DnaPanel for click detection */
  curCenterX = 0;
  curCenterY = 0;

  _selected = false;
  _labelSeed: number; // unique noise seed per region

  constructor(helix: DNAHelix, id: number, fraction: number, shortName: string, color: string, rm: boolean) {
    this.helix = helix; this.id = id; this.fraction = fraction;
    this.shortName = shortName; this.color = color; this.reducedMotion = rm;
    this._labelSeed = 60 + id * 18;
    const root = helix.root;

    this.glowRect = document.createElementNS(SVG_NS, 'rect');
    this.glowRect.setAttribute('filter', 'url(#gene-glow-filter)');
    this.glowRect.setAttribute('opacity', '0.12');
    this.glowRect.style.fill = color;
    root.insertBefore(this.glowRect, root.firstChild);

    this.connector = document.createElementNS(SVG_NS, 'path');
    this.connector.setAttribute('fill', 'none');
    this.connector.setAttribute('opacity', '0.55');
    this.connector.style.stroke = color;
    root.appendChild(this.connector);

    this.marker = document.createElementNS(SVG_NS, 'circle');
    this.marker.setAttribute('filter', 'url(#gene-rung-glow)');
    this.marker.style.fill = color;
    root.appendChild(this.marker);

    this.labelGroup = document.createElementNS(SVG_NS, 'g');
    this.labelChip = document.createElementNS(SVG_NS, 'rect');
    this.labelChip.setAttribute('fill', 'rgba(10,8,26,0.65)');
    this.labelChip.style.stroke = color;

    this.labelText = document.createElementNS(SVG_NS, 'text');
    this.labelText.setAttribute('text-anchor', 'middle');
    this.labelText.setAttribute('dominant-baseline', 'central');
    this.labelText.setAttribute('font-family', "-apple-system,'Segoe UI',Roboto,sans-serif");
    this.labelText.setAttribute('font-weight', '600');
    this.labelText.setAttribute('letter-spacing', '0.02em');
    this.labelText.style.fill = color;
    this.labelText.textContent = shortName;

    this.labelGroup.appendChild(this.labelChip);
    this.labelGroup.appendChild(this.labelText);
    root.appendChild(this.labelGroup);

    this.setSelected(false);
  }

  setSelected(sel: boolean) {
    this._selected = sel;
    const glow = sel ? CONFIG.gene.glowOpacity : 0.10;
    this.glowRect.setAttribute('opacity', glow.toFixed(2));
    this.labelGroup.setAttribute('opacity', sel ? '1' : '0.55');
    this.connector.setAttribute('opacity', sel ? '0.75' : '0.35');
    this.marker.setAttribute('opacity', sel ? '1' : '0.55');
    this.highlightedRungs.forEach(rng => {
      const alpha = sel ? '1' : '0.22';
      rng.lineA.setAttribute('opacity', alpha);
      rng.lineB.setAttribute('opacity', alpha);
    });
  }

  _highlightRung(rng: any) {
    rng.lineA.classList.add('transition-colors', 'duration-500', 'ease-in-out');
    rng.lineB.classList.add('transition-colors', 'duration-500', 'ease-in-out');
    rng.lineA.style.stroke = this.color; rng.lineB.style.stroke = this.color;
    rng.lineA.setAttribute('filter', 'url(#gene-rung-glow)');
    rng.lineB.setAttribute('filter', 'url(#gene-rung-glow)');
  }

  layout(w: number, h: number) {
    const helix = this.helix, G = CONFIG.gene, mu = helix.masterUnit;
    this.masterUnit = mu;
    const count = helix.bpSamples.length, len = Math.min(G.lengthBp, count), half = Math.floor(len / 2);
    const centre = Math.floor(this.fraction * count);
    this.startIndex = Math.max(0, Math.min(count - len, centre - half));
    this.endIndex = this.startIndex + len - 1;

    // Restore any previously highlighted rungs to default colour before reassigning
    this.highlightedRungs.forEach(rng => {
      rng.lineA.removeAttribute('filter'); rng.lineB.removeAttribute('filter');
      rng.lineA.style.stroke = ''; rng.lineB.style.stroke = '';
    });

    this.highlightedRungs = helix.rungs.slice(this.startIndex, this.endIndex + 1);
    this.highlightedRungs.forEach(rng => this._highlightRung(rng));

    const topY = helix.bpSamples[this.startIndex].yBase;
    const botY = helix.bpSamples[this.endIndex].yBase;
    const restCX = helix.centerX;
    const restCY = (topY + botY) / 2;
    // Mirror label to the LEFT side of the helix (genes 1-3 go left; gene 0 goes right)
    const desired = -(helix.radius + mu * G.labelOffsetXUnits);
    // Keep left-side gene labels inside the SVG on narrow tablet panels.
    // The previous min() selected the farther-left offset, allowing the chip
    // to cross the panel edge when the simulation column became narrow.
    const maxOff = -(w * 0.02 + mu * 1.5);
    this.labelRestX = restCX + Math.max(desired, maxOff);
    this.labelRestY = Math.max(restCY - mu * 1.8, h * 0.06);

    this.labelText.setAttribute('font-size', (mu * 0.38).toFixed(1));
    const bb = this.labelText.getBBox();
    const bbW = bb.width || mu * 2.2, bbH = bb.height || mu * 0.5;
    const bbX = bb.x || -bbW / 2, bbY = bb.y || -bbH / 2;
    const px = mu * 0.32, py = mu * 0.20;
    this.labelChip.setAttribute('x', (bbX - px).toFixed(1));
    this.labelChip.setAttribute('y', (bbY - py).toFixed(1));
    this.labelChip.setAttribute('width', (bbW + 2 * px).toFixed(1));
    this.labelChip.setAttribute('height', (bbH + 2 * py).toFixed(1));
    this.labelChip.setAttribute('rx', (mu * 0.22).toFixed(1));
    this.labelChip.setAttribute('stroke-width', (mu * 0.04).toFixed(2));
    this.marker.setAttribute('r', (mu * 0.13).toFixed(2));
    this.connector.setAttribute('stroke-width', (mu * 0.045).toFixed(2));
    this.connector.setAttribute('stroke-dasharray', (mu * 0.11).toFixed(2) + ',' + (mu * 0.10).toFixed(2));

    this.setSelected(this._selected);
  }

  update(t: number) {
    const helix = this.helix, G = CONFIG.gene, sc = this.reducedMotion ? CONFIG.motion.reducedMotionScale : 1;
    let minX = Infinity, maxX = -Infinity;
    for (let i = this.startIndex; i <= this.endIndex; i++) {
      const s = helix.bpSamples[i];
      if (s.curX1 < minX) minX = s.curX1; if (s.curX1 > maxX) maxX = s.curX1;
      if (s.curX2 < minX) minX = s.curX2; if (s.curX2 > maxX) maxX = s.curX2;
    }
    const topY = helix.bpSamples[this.startIndex].curY, botY = helix.bpSamples[this.endIndex].curY;
    const gX = (minX + maxX) / 2, gY = (topY + botY) / 2;
    this.curCenterX = gX; this.curCenterY = gY;

    const pX = this.masterUnit * G.padXUnits, pY = this.masterUnit * G.padYUnits;
    const rPill = Math.min((maxX - minX) + 2 * pX, (botY - topY) + 2 * pY) / 2;
    this.glowRect.setAttribute('x', (minX - pX).toFixed(1)); this.glowRect.setAttribute('y', (topY - pY).toFixed(1));
    this.glowRect.setAttribute('width', ((maxX - minX) + 2 * pX).toFixed(1));
    this.glowRect.setAttribute('height', ((botY - topY) + 2 * pY).toFixed(1));
    this.glowRect.setAttribute('rx', rPill.toFixed(1)); this.glowRect.setAttribute('ry', rPill.toFixed(1));

    const fAmp = this.masterUnit * G.labelFloatAmpUnits * sc;
    const seed = this._labelSeed;
    const lX = this.labelRestX + smoothNoise(t, seed, 0.75) * fAmp;
    const lY = this.labelRestY + smoothNoise(t, seed + 14.4, 0.85) * fAmp * 0.7;
    this.labelGroup.setAttribute('transform', 'translate(' + lX.toFixed(1) + ',' + lY.toFixed(1) + ')');

    const dx = lX - gX, dy = lY - gY, dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const mX = (lX + gX) / 2, mY = (lY + gY) / 2, ca = this.masterUnit * 0.7;
    const cX = mX + (-dy / dist) * ca, cY = mY + (dx / dist) * ca;
    this.connector.setAttribute('d', 'M' + gX.toFixed(1) + ',' + gY.toFixed(1) + ' Q' + cX.toFixed(1) + ',' + cY.toFixed(1) + ' ' + lX.toFixed(1) + ',' + lY.toFixed(1));
    this.marker.setAttribute('cx', gX.toFixed(1)); this.marker.setAttribute('cy', gY.toFixed(1));
  }
}
