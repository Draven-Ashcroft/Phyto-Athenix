/**
 * PollinationAnimation
 * Six-stage scientific pollination walkthrough:
 *  1 – Hibiscus flower
 *  2 – Zoom into anther (cross-section)
 *  3 – Pollen burst + Brownian particle field (Canvas2D, 60 fps)
 *  4 – Single grain zooms to 10× (semi-transparent cutaway begins)
 *  5 – Cutaway: cytoplasm, tube nucleus, generative cell
 *  6 – Gene locus highlighted on chromatin
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useCallback } from 'react';
import PollinationCanvas from './PollinationCanvas';
import FlowerCanvas from './FlowerCanvas';
import { GENE_COLORS, GENE_DEFS } from '@/lib/dnaEngine';
import type { FlowerSize, PetalShape, PigmentIntensity } from '../App';

interface Props {
  stage: number;
  geneColor: string;
  paused: boolean;
  selectedGeneId: number;
  onSelectGene: (id: number) => void;
  flowerSize: FlowerSize;
  petalShape: PetalShape;
  pigmentIntensity: PigmentIntensity;
}

// ─── colour helpers ─────────────────────────────────────────────────────────
function hexToRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

// ─── Realistic hibiscus flower ───────────────────────────────────────────────
function HibiscusFlower({ geneColor }: { geneColor: string }) {
  const { r, g, b } = hexToRgb(geneColor);
  const dark = `rgba(${Math.round(r * 0.38)},${Math.round(g * 0.38)},${Math.round(b * 0.38)},0.9)`;
  return (
    <svg viewBox="-62 -62 124 124" className="w-full h-full" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="hib-petal" cx="50%" cy="78%" r="68%">
          <stop offset="0%"   stopColor={dark} />
          <stop offset="100%" stopColor={geneColor} stopOpacity="0.88" />
        </radialGradient>
        <radialGradient id="hib-stamen" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#fffde0" />
          <stop offset="100%" stopColor="#d4920a" />
        </radialGradient>
      </defs>
      {[0, 72, 144, 216, 288].map(deg => (
        <g key={deg} transform={`rotate(${deg})`}>
          <path d="M0,0 C-19,-11 -23,-44 0,-57 C23,-44 19,-11 0,0"
            fill="url(#hib-petal)" opacity="0.87" />
          <path d="M0,-2 L0,-54" stroke={dark} strokeWidth="0.65" opacity="0.5" strokeLinecap="round"/>
          {[-10,-5,5,10].map((o,vi) => (
            <line key={vi}
              x1={o * 0.15 * (vi+1)} y1={-(14 + vi*7)}
              x2={o * 0.6}            y2={-(30 + vi*5)}
              stroke={dark} strokeWidth="0.3" opacity="0.32" />
          ))}
        </g>
      ))}
      {/* Androphore column */}
      <rect x="-3.5" y="-40" width="7" height="42" rx="3.5"
        fill="#fef9c3" stroke="#d4920a" strokeWidth="0.55"/>
      {/* Stamens */}
      {[-14,-7,0,7,14].map((xo,i) => {
        const yb = -40 - i * 2.4;
        return (
          <g key={i}>
            <line x1="0" y1={yb} x2={xo} y2={yb-8}
              stroke="#fde68a" strokeWidth="0.75" strokeLinecap="round"/>
            <ellipse cx={xo} cy={yb-9.5} rx="2" ry="3.2"
              fill="#d4920a" stroke="#92400e" strokeWidth="0.45"
              transform={`rotate(${xo*4} ${xo} ${yb-9.5})`}/>
          </g>
        );
      })}
      <circle cx="0" cy="-46" r="4.5" fill="#fef08a" stroke="#d4920a" strokeWidth="0.55"/>
      <circle cx="0" cy="-46" r="2.4" fill="#facc15"/>
    </svg>
  );
}

// ─── Anther cross-section ────────────────────────────────────────────────────
function AntherSection({ opening }: { opening: boolean }) {
  return (
    <svg viewBox="0 0 100 128" className="w-[190px] h-[240px]">
      <defs>
        <radialGradient id="loc-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#fde68a" stopOpacity="0.72"/>
          <stop offset="100%" stopColor="#d4920a" stopOpacity="0.38"/>
        </radialGradient>
        <filter id="anth-shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="1" dy="1.5" stdDeviation="1.2" floodColor="rgba(0,0,0,0.4)"/>
        </filter>
      </defs>
      {/* Connective */}
      <rect x="46" y="10" width="8" height="96" rx="4" fill="#78350f" opacity="0.8" filter="url(#anth-shadow)"/>
      <line x1="50" y1="12" x2="50" y2="104" stroke="#3d1a00" strokeWidth="1.1"/>
      {/* Left theca — 2 locules */}
      {[0, 1].map(row => {
        const cy = 34 + row * 32;
        return (
          <g key={row}>
            <ellipse cx="31" cy={cy} rx="13" ry="14" fill="url(#loc-fill)" stroke="#92400e" strokeWidth="1.1"/>
            {Array.from({length:8},(_,j)=>{
              const a=(j/8)*Math.PI*2;
              return <circle key={j} cx={31+Math.cos(a)*8} cy={cy+Math.sin(a)*10} r="1.9" fill="#d4920a" opacity="0.7"/>;
            })}
            <circle cx="31" cy={cy} r="2.4" fill="#d4920a" opacity="0.7"/>
            {/* Endothecium lines */}
            {Array.from({length:6},(_,j)=>(
              <line key={j} x1={19+j*0.6} y1={cy-8+j*3} x2={18+j*0.4} y2={cy-4+j*3}
                stroke="#78350f" strokeWidth="0.45" opacity="0.4"/>
            ))}
          </g>
        );
      })}
      {/* Right theca */}
      {[0, 1].map(row => {
        const cy = 34 + row * 32;
        return (
          <g key={row}>
            <ellipse cx="69" cy={cy} rx="13" ry="14" fill="url(#loc-fill)" stroke="#92400e" strokeWidth="1.1"/>
            {Array.from({length:8},(_,j)=>{
              const a=(j/8)*Math.PI*2;
              return <circle key={j} cx={69+Math.cos(a)*8} cy={cy+Math.sin(a)*10} r="1.9" fill="#d4920a" opacity="0.7"/>;
            })}
            <circle cx="69" cy={cy} r="2.4" fill="#d4920a" opacity="0.7"/>
          </g>
        );
      })}
      {/* Stomium dehiscence cracks */}
      <motion.path d="M44,52 Q43,66 44,78" stroke="#1c0a00" strokeWidth="1.4" fill="none" strokeLinecap="round"
        animate={{ d: opening ? 'M39,49 Q35,66 39,81' : 'M44,52 Q43,66 44,78', strokeWidth: opening ? 2.8 : 1.4 }}
        transition={{ duration: 0.85 }}/>
      <motion.path d="M56,52 Q57,66 56,78" stroke="#1c0a00" strokeWidth="1.4" fill="none" strokeLinecap="round"
        animate={{ d: opening ? 'M61,49 Q65,66 61,81' : 'M56,52 Q57,66 56,78', strokeWidth: opening ? 2.8 : 1.4 }}
        transition={{ duration: 0.85 }}/>
      {/* Filament */}
      <rect x="46" y="106" width="8" height="18" rx="4" fill="#fef9c3" stroke="#d4920a" strokeWidth="0.65"/>
    </svg>
  );
}

// ─── 10× Cutaway pollen grain ────────────────────────────────────────────────
const POLLEN_GENE_LOCI = [
  { id: 0, x: 44.5, y: 47.5 },
  { id: 1, x: 56, y: 48 },
  { id: 2, x: 44, y: 57 },
  { id: 3, x: 56, y: 57 },
];

function CutawayPollen({
  stage,
  geneColor,
  selectedGeneId,
  onSelectGene,
}: {
  stage: number;
  geneColor: string;
  selectedGeneId: number;
  onSelectGene: (id: number) => void;
}) {
  const { r: gr, g: gg, b: gb } = hexToRgb(geneColor);
  const locusColor = selectedGeneId === 0 ? geneColor : GENE_COLORS[selectedGeneId];
  const selectedLocus = POLLEN_GENE_LOCI[selectedGeneId];
  const showInterior  = stage >= 5;
  const showGene      = stage >= 6;

  // Fibonacci spine positions for large grain
  const spines = useMemo(() => {
    const goldenA = Math.PI * (3 - Math.sqrt(5));
    const pts: {bx:number;by:number;tx:number;ty:number;alpha:number;lw:number}[] = [];
    const N = 60;
    for (let i = 0; i < N; i++) {
      const y3d = 1 - (i / (N-1)) * 2;
      const rxy  = Math.sqrt(Math.max(0, 1-y3d*y3d));
      const phi  = goldenA * i;
      const x3d  = Math.cos(phi) * rxy;
      const z3d  = Math.sin(phi) * rxy;
      if (z3d < -0.15) continue;
      const R = 44;
      const cx = 50, cy = 50;
      const bx = cx + x3d * R;
      const by = cy - y3d * R;
      const len = 5 + 2.5 * ((i*7)%5)/5;
      pts.push({
        bx, by,
        tx: bx + x3d * len,
        ty: by - y3d * len,
        alpha: 0.45 + z3d * 0.38,
        lw: Math.max(0.5, 0.65 * (0.5 + z3d * 0.5)),
      });
    }
    return pts;
  }, []);

  const cytoplasmSpecks = useMemo(() => (
    Array.from({ length: 82 }, (_, i) => {
      const a = i * 2.399963;
      const radius = 4 + ((i * 17) % 37);
      const x = 50 + Math.cos(a) * radius;
      const y = 50 + Math.sin(a) * radius * 0.92;
      return {
        x,
        y,
        r: 0.28 + ((i * 11) % 8) * 0.12,
        opacity: 0.16 + ((i * 7) % 7) * 0.045,
        fill: i % 5 === 0 ? '#f6c453' : i % 3 === 0 ? '#b87925' : '#8e581d',
      };
    })
  ), []);

  const chromatinThreads = useMemo(() => (
    Array.from({ length: 34 }, (_, i) => {
      const a = i * 2.17;
      const r = 2.2 + ((i * 13) % 70) / 10;
      const x = 50 + Math.cos(a) * r;
      const y = 52 + Math.sin(a) * r * 0.78;
      const bend = 2 + (i % 4) * 0.8;
      return {
        d: `M${x.toFixed(1)},${y.toFixed(1)} C${(x + Math.cos(a + 1.2) * bend).toFixed(1)},${(y + Math.sin(a + 1.2) * bend).toFixed(1)} ${(x + Math.cos(a - .7) * bend * 2.8).toFixed(1)},${(y + Math.sin(a - .7) * bend * 2.8).toFixed(1)} ${(x + Math.cos(a) * bend * 4).toFixed(1)},${(y + Math.sin(a) * bend * 4).toFixed(1)}`,
        stroke: i % 4 === 0 ? '#f06cae' : i % 3 === 0 ? '#68d5e8' : '#a88aff',
        opacity: 0.27 + (i % 5) * 0.07,
        width: 0.28 + (i % 3) * 0.16,
      };
    })
  ), []);

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ overflow: 'visible' }}>
      <defs>
        {/* Outer wall — semi-transparent when showing interior */}
        <radialGradient id="cut-body" cx="34%" cy="32%" r="70%">
          <stop offset="0%"   stopColor="#fff176"/>
          <stop offset="50%"  stopColor="#e8a020"/>
          <stop offset="82%"  stopColor="#a05010"/>
          <stop offset="100%" stopColor="#3d1800"/>
        </radialGradient>
        <radialGradient id="cut-spec" cx="33%" cy="30%" r="42%">
          <stop offset="0%"   stopColor="rgba(255,255,210,0.48)"/>
          <stop offset="100%" stopColor="rgba(255,255,210,0)"/>
        </radialGradient>
        <radialGradient id="cut-limb" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(0,0,0,0)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.42)"/>
        </radialGradient>
        {/* Cytoplasm */}
        <radialGradient id="cyto" cx="45%" cy="42%" r="55%">
          <stop offset="0%"   stopColor="rgba(55,38,18,0.98)"/>
          <stop offset="100%" stopColor="rgba(28,16,6,0.98)"/>
        </radialGradient>
        {/* Tube nucleus */}
        <radialGradient id="tube-nuc" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(65,38,110,0.96)"/>
          <stop offset="100%" stopColor="rgba(28,14,58,0.96)"/>
        </radialGradient>
        {/* Generative cell */}
        <radialGradient id="gen-cell" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(48,26,80,0.98)"/>
          <stop offset="100%" stopColor="rgba(20,10,42,0.98)"/>
        </radialGradient>
        <filter id="nuc-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="gene-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.8" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="drop-shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.65)"/>
        </filter>
        <clipPath id="grain-clip">
          <circle cx="50" cy="50" r="44"/>
        </clipPath>
        <clipPath id="nucleus-inner-clip">
          <ellipse cx="50" cy="52" rx="13.25" ry="10.85"/>
        </clipPath>
      </defs>

      {/* ── Outer wall (semi-transparent when interior is shown) ── */}
      <motion.g animate={{ opacity: showInterior ? 0.48 : 1 }} transition={{ duration: 1.2 }}>
        <circle cx="50" cy="50" r="44" fill="url(#cut-body)" filter="url(#drop-shadow)"/>
        {/* Colpi */}
        {[0,120,240].map(d=>(
          <g key={d} transform={`rotate(${d} 50 50)`}>
            <ellipse cx="50" cy="8.5"  rx="5.2" ry="10.5" fill="rgba(38,13,0,0.58)"/>
            <ellipse cx="50" cy="8.5"  rx="3.1" ry="7.2"  fill="rgba(175,95,0,0.26)"/>
          </g>
        ))}
        {/* Echinate spines */}
        {spines.map((s,i)=>(
          <line key={i} x1={s.bx} y1={s.by} x2={s.tx} y2={s.ty}
            stroke={`rgba(75,28,0,${s.alpha.toFixed(2)})`}
            strokeWidth={s.lw} strokeLinecap="round"/>
        ))}
        <circle cx="50" cy="50" r="44" fill="url(#cut-spec)"/>
        <circle cx="50" cy="50" r="44" fill="url(#cut-limb)"/>
      </motion.g>

      {/* ── Interior — only visible when semi-transparent ── */}
      <motion.g
        initial={{ opacity: 0 }} animate={{ opacity: showInterior ? 1 : 0 }}
        transition={{ duration: 1.3, delay: 0.2 }}
        clipPath="url(#grain-clip)"
      >
        {/* Cytoplasm fill */}
        <circle cx="50" cy="50" r="43.5" fill="url(#cyto)"/>

        {/* Intine — thin inner wall layer */}
        <circle cx="50" cy="50" r="43.5" fill="none"
          stroke="rgba(200,160,80,0.30)" strokeWidth="1.6"/>

        {/* Organelles — ER fragments, small vesicles */}
        {[
          [28,38,12,4.5,  'rgba(70,48,22,0.7)'],
          [62,32,10,4,    'rgba(65,44,20,0.65)'],
          [35,62,11,4.2,  'rgba(68,46,20,0.68)'],
          [66,60,9, 3.8,  'rgba(72,50,24,0.60)'],
          [50,38,8, 3,    'rgba(62,42,18,0.55)'],
          [38,50,7, 3.2,  'rgba(66,46,22,0.58)'],
        ].map(([x,y,rx,ry,fill],i)=>(
          <ellipse key={i} cx={x as number} cy={y as number}
            rx={rx as number} ry={ry as number} fill={fill as string}/>
        ))}
        {/* Dense cytoplasmic granules — irregularly distributed, not decorative dots */}
        {cytoplasmSpecks.map((speck, i) => (
          <circle
            key={`speck-${i}`}
            cx={speck.x}
            cy={speck.y}
            r={speck.r}
            fill={speck.fill}
            opacity={speck.opacity}
          />
        ))}
        {/* Lipid bodies — tiny bright droplets */}
        {[
          [24,55,2.4],[58,42,2.1],[44,28,2.6],[72,48,2.0],
          [30,48,1.8],[56,68,1.9],[38,70,2.2],[68,32,1.8],
        ].map(([x,y,r],i)=>(
          <circle key={i} cx={x} cy={y} r={r}
            fill="rgba(240,210,100,0.50)"/>
        ))}
        {/* Starch grains */}
        {[[42,60,3.2],[60,55,2.8],[34,40,2.5]].map(([x,y,r],i)=>(
          <circle key={i} cx={x} cy={y} r={r} fill="rgba(200,185,140,0.42)"/>
        ))}

        {/* ── Tube cell nucleus (large, interphase, open chromatin) ── */}
        <motion.g filter="url(#nuc-glow)"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.0, delay: 0.4 }}
          style={{ transformOrigin: '50px 52px' } as React.CSSProperties}
        >
          {/* Outer nuclear envelope */}
          <ellipse cx="50" cy="52" rx="15.5" ry="13"
            fill="url(#tube-nuc)"
            stroke="rgba(170,130,255,0.55)" strokeWidth="1.3"/>
          {/* Inner membrane */}
          <ellipse cx="50" cy="52" rx="13.8" ry="11.4"
            fill="none" stroke="rgba(150,110,230,0.28)" strokeWidth="0.6"/>
          {/* Nuclear pore complexes (10) */}
          {Array.from({length:10},(_,i)=>{
            const a=(i/10)*Math.PI*2;
            const px=50+Math.cos(a)*15.0, py=52+Math.sin(a)*12.5;
            return (
              <g key={i} transform={`translate(${px},${py}) rotate(${a*180/Math.PI})`}>
                <rect x="-1.4" y="-0.9" width="2.8" height="1.8" rx="0.5"
                  fill="rgba(190,160,255,0.52)"/>
              </g>
            );
          })}
          <g clipPath="url(#nucleus-inner-clip)">
          {/* Heterochromatin patches */}
          {[20,95,185,270].map((a,i)=>{
            const rad=a*Math.PI/180;
            return <ellipse key={i}
              cx={50+Math.cos(rad)*9.5} cy={52+Math.sin(rad)*7.8}
              rx="4" ry="2.8"
              transform={`rotate(${a+25} ${50+Math.cos(rad)*9.5} ${52+Math.sin(rad)*7.8})`}
              fill="rgba(95,65,175,0.48)"/>;
          })}
          {/* Euchromatin loops */}
          {[
            'M44,49 C42,45 46,43 50,46 C54,49 52,53 48,54 C44,55 43,51 44,49',
            'M54,47 C57,44 61,47 60,52 C59,57 54,57 51,54 C48,51 51,50 54,47',
            'M44,56 C41,59 43,63 47,62 C51,61 52,57 49,54 C46,51 44,53 44,56',
            'M55,55 C58,58 57,62 53,62 C49,62 48,57 51,55 C54,53 55,55 55,55',
          ].map((d,i)=>(
            <path key={i} d={d} fill="rgba(140,100,220,0.32)"
              stroke="rgba(165,130,255,0.28)" strokeWidth="0.4"/>
          ))}
          {/* Fine chromatin threads with uneven density and mixed euchromatin tones */}
          {chromatinThreads.map((thread, i) => (
            <path
              key={`thread-${i}`}
              d={thread.d}
              fill="none"
              stroke={thread.stroke}
              strokeWidth={thread.width}
              strokeLinecap="round"
              opacity={thread.opacity}
            />
          ))}
          {/* Chromatin fiber tracings */}
          {[
            { d:'M46,50 Q44,46 48,44 Q52,42 53,46 Q54,50 50,52 Q46,54 46,50', c:'rgba(165,135,255,0.52)' },
            { d:'M36,54 Q34,50 38,48 Q42,46 43,50 Q44,54 40,56 Q36,58 36,54', c:'rgba(145,115,225,0.46)' },
            { d:'M58,47 Q61,51 59,55 Q57,59 53,57 Q49,55 51,51 Q53,47 58,47', c:'rgba(160,130,245,0.46)' },
          ].map((it,i)=>(
            <path key={i} d={it.d} fill="none"
              stroke={it.c} strokeWidth="1.1" strokeLinecap="round"/>
          ))}
          {/* Nucleolus */}
          <ellipse cx="48" cy="51" rx="4.8" ry="4"
            fill="rgba(50,22,100,0.80)" stroke="rgba(170,140,255,0.38)" strokeWidth="0.65"/>
          <ellipse cx="47" cy="50.5" rx="2.6" ry="2.2" fill="rgba(80,48,148,0.65)"/>
          <ellipse cx="49.5" cy="52" rx="1.6" ry="1.4" fill="rgba(62,36,120,0.60)"/>

          {/* Four clickable gene loci inside the pollen chromosome material */}
          {showInterior && POLLEN_GENE_LOCI.map(locus => {
            const color = locus.id === 0 ? geneColor : GENE_COLORS[locus.id];
            const isSelected = selectedGeneId === locus.id;
            return (
              <g
                key={locus.id}
                role="button"
                tabIndex={0}
                aria-label={`Select ${GENE_DEFS[locus.id].name} in pollen`}
                onClick={() => onSelectGene(locus.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectGene(locus.id);
                  }
                }}
                className="pollen-gene-locus"
                style={{ cursor: 'pointer' }}
              >
                <circle cx={locus.x} cy={locus.y} r="4.5" fill="transparent" />
                <circle
                  cx={locus.x}
                  cy={locus.y}
                  r={isSelected ? 2.3 : 1.8}
                  fill={color}
                  opacity={isSelected ? 0.82 : 0.66}
                  stroke={color}
                  strokeWidth={isSelected ? 0.65 : 0.5}
                />
                {isSelected && (
                  <motion.circle
                    cx={locus.x}
                    cy={locus.y}
                    r="3.8"
                    fill="none"
                    stroke={color}
                    strokeWidth="0.55"
                    animate={{ opacity: [0.34, 0.12, 0.34], r: [3.5, 4.6, 3.5] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </g>
            );
          })}
          </g>
        </motion.g>

        {/* ── Generative cell (spindle-shaped, smaller, denser chromatin) ── */}
        <motion.g
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.8 }}
        >
          <ellipse cx="50" cy="33" rx="7.5" ry="5.2"
            transform="rotate(-18 50 33)"
            fill="url(#gen-cell)"
            stroke="rgba(200,160,255,0.45)" strokeWidth="0.9"/>
          {/* Condensed chromatin — generative cell about to divide */}
          {[[-3,-1],[1,1],[-1,2],[3,-2],[0,-1]].map(([dx,dy],i)=>(
            <ellipse key={i}
              cx={50+dx} cy={33+dy} rx={1.2+0.3*(i%3)} ry={0.8}
              transform={`rotate(${-18+i*22} ${50+dx} ${33+dy})`}
              fill="rgba(185,150,255,0.62)"/>
          ))}
        </motion.g>

        {/* ── Gene locus highlight (stage 6) ── */}
        {showGene && selectedLocus && (
          <motion.g
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.9 }}
            opacity=".58"
          >
            {/* One shared selection state: this softly maps the selected locus to the chromatin reference. */}
            <path
              d={`M${selectedLocus.x},${selectedLocus.y} Q49,51 53,45`}
              stroke={locusColor}
              strokeWidth="0.45"
              strokeLinecap="round"
              strokeDasharray="1.2 1.8"
              fill="none"
              opacity=".55"
            />
            <path d="M53,45 Q55,49 52,51"
              stroke={locusColor} strokeWidth="2.4" strokeLinecap="round" fill="none"
              filter="url(#gene-glow)"
              className="transition-colors duration-500"/>
            <motion.path d="M53,45 Q55,49 52,51"
              stroke={locusColor} strokeWidth="4.2" strokeLinecap="round" fill="none"
              opacity=".42"
              filter="url(#gene-glow)"
              className="transition-colors duration-500"
              animate={{ opacity:[0.12,0.32,0.12] }}
              transition={{ duration:2.8, repeat:Infinity, ease:'easeInOut' }}/>
          </motion.g>
        )}
      </motion.g>

      {/* Thin exine rim stays visible always for context */}
      <circle cx="50" cy="50" r="44" fill="none"
        stroke="rgba(200,140,30,0.22)" strokeWidth="0.8"/>
    </svg>
  );
}

function PollenGeneLegend({
  geneColor,
  selectedGeneId,
  onSelectGene,
}: {
  geneColor: string;
  selectedGeneId: number;
  onSelectGene: (id: number) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute left-3 top-3 z-10 w-[min(170px,38%)] rounded-xl border border-purple-400/20 bg-[#100b2ccc] p-2 backdrop-blur-md"
    >
      <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#a99bdd]">
        Pollen gene loci
      </p>
      <div className="grid grid-cols-2 gap-1">
        {GENE_DEFS.map(def => {
          const color = def.id === 0 ? geneColor : GENE_COLORS[def.id];
          const active = selectedGeneId === def.id;
          return (
            <button
              key={def.id}
              type="button"
              onClick={() => onSelectGene(def.id)}
              className={`flex min-w-0 items-center gap-1 rounded-md border px-1.5 py-1 text-left text-[9px] transition-all ${active ? 'text-[#eeeaff]' : 'border-white/[0.08] text-[#9488bd] hover:bg-white/[0.06]'}`}
              style={active ? {
                backgroundColor: `${color}0d`,
                borderColor: `${color}aa`,
                boxShadow: `0 0 0 1px ${color}1c, 0 0 12px ${color}24`,
              } : undefined}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <span className="truncate">{def.shortName}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

function TraitLinkBadge({
  selectedGeneId,
  geneColor,
}: {
  selectedGeneId: number;
  geneColor: string;
}) {
  const selectedGene = GENE_DEFS[selectedGeneId];
  const color = selectedGeneId === 0 ? geneColor : GENE_COLORS[selectedGeneId];
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute right-3 top-3 z-10 rounded-xl border px-2.5 py-2 backdrop-blur-md"
      style={{
        borderColor: `${color}55`,
        backgroundColor: `${color}14`,
      }}
    >
      <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[#a99bdd]">Gene → expression → trait</p>
      <p className="mt-0.5 text-[10px] font-semibold" style={{ color }}>
        {selectedGene.shortName} → {selectedGene.trait}
      </p>
    </motion.div>
  );
}

function StigmaTransferScene({
  stage,
  geneColor,
}: {
  stage: number;
  geneColor: string;
}) {
  const tubeStage = stage >= 7;
  const complete = stage >= 8;

  return (
    <motion.svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: stage >= 3 ? 1 : 0 }}
      transition={{ duration: 0.7 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="transfer-path" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fbbf24" stopOpacity="0" />
          <stop offset=".45" stopColor="#fbbf24" stopOpacity=".65" />
          <stop offset="1" stopColor={geneColor} stopOpacity=".9" />
        </linearGradient>
        <filter id="transfer-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Understandable anther → stigma trajectory */}
      {!tubeStage && (
        <>
          <path
            d="M17 52 C34 38, 49 64, 66 48 S76 43, 81 42"
            fill="none"
            stroke="url(#transfer-path)"
            strokeWidth=".55"
            strokeDasharray="1.6 2.2"
            opacity=".72"
          />
          <path
            d="M17 52 C34 38, 49 64, 66 48 S76 43, 81 42"
            fill="none"
            stroke="#fbbf24"
            strokeWidth=".18"
            strokeDasharray=".7 2.8"
            opacity=".65"
          />
        </>
      )}

      {/* Stigma lobes and style */}
      <g filter="url(#transfer-glow)" opacity={tubeStage ? .28 : 1}>
        <path d="M79 45 C76 39 77 35 81 34 C85 35 84 40 81 45" fill="#e879a9" fillOpacity=".72" stroke="#f5a3c2" strokeWidth=".45" />
        <path d="M81 45 C85 39 88 40 89 43 C89 46 85 48 81 47" fill="#d85f9a" fillOpacity=".72" stroke="#f5a3c2" strokeWidth=".45" />
        <path d="M81 45 C78 49 78 54 80 59 C82 66 82 74 79 88" fill="none" stroke="#f2a7c5" strokeWidth="1.5" strokeLinecap="round" opacity=".7" />
        <path d="M82 45 C80 53 84 61 81 72 C80 78 80 83 79 88" fill="none" stroke="#8e4b89" strokeWidth=".9" strokeLinecap="round" />
        <circle cx="81" cy="44" r="3.5" fill="none" stroke="#f7c1d8" strokeWidth=".35" strokeDasharray=".8 1.2" />
      </g>

      {/* Several deposited grains remain on the stigma surface */}
      {stage >= 4 && [0, 1, 2, 3, 4].map((i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, scale: .35 }}
          animate={{ opacity: i === 0 || complete ? 1 : .62, scale: 1 }}
          transition={{ duration: .55, delay: i * .12 }}
          style={{ transformOrigin: `${77 + (i % 3) * 2}px ${40 + Math.floor(i / 3) * 4}px` }}
        >
          <circle cx={77 + (i % 3) * 2} cy={40 + Math.floor(i / 3) * 4} r={i === 0 ? 1.8 : 1.15} fill={i === 0 ? geneColor : "#d4920a"} opacity=".92" />
          <circle cx={76.5 + (i % 3) * 2} cy={39.5 + Math.floor(i / 3) * 4} r=".35" fill="#fff7c2" opacity=".75" />
        </motion.g>
      ))}

      {/* Germinating pollen tube and two male gametes */}
      {tubeStage && (
        <>
          <motion.path
            d="M79 44 C76 51 82 58 79 66 C76 73 80 80 79 89"
            fill="none"
            stroke={geneColor}
            strokeWidth="1.6"
            strokeLinecap="round"
            filter="url(#transfer-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: complete ? 1 : .92, opacity: 1 }}
            transition={{ duration: 3.2, ease: "easeInOut" }}
          />
          <motion.path
            d="M79 44 C76 51 82 58 79 66 C76 73 80 80 79 89"
            fill="none"
            stroke="#f8c7dc"
            strokeWidth=".34"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: complete ? 1 : .92 }}
            transition={{ duration: 3.2, ease: "easeInOut" }}
          />
          {[0, 1].map(i => (
            <motion.circle
              key={i}
              r="1.15"
              fill={i === 0 ? geneColor : "#fbbf24"}
              stroke="#fff2c2"
              strokeWidth=".25"
              animate={{
                cx: complete ? [79, 78, 80, 79] : [79, 77, 82, 79],
                cy: complete ? [45, 65, 82, 89] : [45, 57, 72, 86],
                opacity: [0, 1, 1, 1],
              }}
              transition={{ duration: 3.6, delay: i * .32, ease: "easeInOut" }}
            />
          ))}
          <text x="84" y="64" fill="#d8f8ff" fontSize="2.5" fontWeight="600">pollen tube</text>
          <text x="84" y="68" fill="#c4b5fd" fontSize="2.2">male gametes</text>
        </>
      )}

      {complete && (
        <motion.g
          initial={{ opacity: 0, scale: .5 }}
          animate={{ opacity: [0, 1, .6, 1], scale: 1 }}
          transition={{ duration: 1.2, repeat: 1 }}
          style={{ transformOrigin: "79px 89px" }}
        >
          <circle cx="79" cy="89" r="4" fill="none" stroke="#fbbf24" strokeWidth=".55" opacity=".75" />
          <circle cx="79" cy="89" r="1.8" fill="#fff4a8" />
          <text x="83.5" y="90" fill="#fde68a" fontSize="2.5" fontWeight="600">fertilization</text>
        </motion.g>
      )}
    </motion.svg>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function PollinationAnimation({
  stage,
  geneColor,
  paused,
  selectedGeneId,
  onSelectGene,
  flowerSize,
  petalShape,
  pigmentIntensity,
}: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const handleGrainsReady = useCallback((idx: number) => {
    setSelectedIdx(idx);
  }, []);

  const activeGeneColor = selectedGeneId === 0 ? geneColor : GENE_COLORS[selectedGeneId];
  const { r: gr, g: gg, b: gb } = hexToRgb(activeGeneColor);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">

      {/* ─── Stage 1: Flower ─────────────────────────────────────── */}
      <motion.div
        className="absolute flex items-center justify-center"
        style={{ width: 260, height: 260 }}
        animate={{
          scale:   stage === 1 ? 1 : stage === 2 ? 2.8 : stage === 3 ? 0.6 : 0,
          opacity: stage <= 3 ? 1 : 0,
          x:       stage === 3 ? -120 : 0,
          y:       stage === 3 ? -60  : 0,
        }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ opacity: stage === 1 ? 1 : stage === 2 ? 0.14 : 0 }}
          transition={{ duration: 0.8 }}
        >
            <FlowerCanvas
              geneColor={geneColor}
              flowerSize={flowerSize}
              petalShape={petalShape}
              pigmentIntensity={pigmentIntensity}
            />
        </motion.div>

        {/* Stage 2 — anther */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ opacity: stage >= 2 && stage < 4 ? 1 : 0 }}
          transition={{ duration: 0.9, delay: stage === 2 ? 0.25 : 0 }}
        >
          <AntherSection opening={stage >= 3} />
        </motion.div>
      </motion.div>

      {/* ─── Stage 3: Canvas pollen field ───────────────────────── */}
      <PollinationCanvas
        active={stage >= 3 && stage < 5}
        stage={stage}
        paused={paused}
        selectedIndex={selectedIdx}
        onGrainsReady={handleGrainsReady}
        geneColor={geneColor}
      />

      <StigmaTransferScene stage={stage} geneColor={geneColor} />

      {/* ─── Stages 4-6: 10× cutaway pollen ─────────────────────── */}
      <motion.div
        className="absolute flex items-center justify-center"
        style={{ width: 260, height: 260 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={stage >= 4 && stage < 7 ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <CutawayPollen
          stage={stage}
          geneColor={geneColor}
          selectedGeneId={selectedGeneId}
          onSelectGene={onSelectGene}
        />

        {/* Annotation labels */}
        <AnimatePresence>
          {stage >= 5 && (
            <motion.div key="tube-lbl"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.55, delay: 0.6 }}
              className="absolute" style={{ right: -152, top: '52%' }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-10 h-px bg-purple-400/40"/>
                <div className="bg-[rgba(35,18,70,0.78)] border border-purple-500/30 rounded px-2 py-1 text-[10.5px] text-[#d4c7f5] whitespace-nowrap">
                  Tube cell nucleus
                </div>
              </div>
            </motion.div>
          )}
          {stage >= 5 && (
            <motion.div key="gen-lbl"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.55, delay: 0.9 }}
              className="absolute" style={{ right: -148, top: '25%' }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-10 h-px bg-indigo-400/35"/>
                <div className="bg-[rgba(20,12,46,0.78)] border border-indigo-500/28 rounded px-2 py-1 text-[10.5px] text-[#c4b5fd] whitespace-nowrap">
                  Generative cell
                </div>
              </div>
            </motion.div>
          )}
          {stage >= 5 && (
            <motion.div key="exine-lbl"
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.55, delay: 1.1 }}
              className="absolute" style={{ left: -152, top: '22%' }}
            >
              <div className="flex items-center gap-1.5 flex-row-reverse">
                <div className="w-10 h-px bg-amber-500/35"/>
                <div className="bg-[rgba(38,20,6,0.78)] border border-amber-500/28 rounded px-2 py-1 text-[10.5px] text-[#fde68a] whitespace-nowrap">
                  Echinate exine
                </div>
              </div>
            </motion.div>
          )}
          {stage >= 6 && (
            <motion.div key="gene-lbl"
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.65, delay: 0.3 }}
              className="absolute" style={{ left: -162, top: '44%' }}
            >
              <div className="flex items-center gap-1.5 flex-row-reverse">
                <div className="w-10 h-px" style={{ background:`${geneColor}55`}}/>
                <div className="rounded px-2 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors duration-500"
                  style={{
                    background:`rgba(${gr},${gg},${gb},0.13)`,
                    border:`1px solid rgba(${gr},${gg},${gb},0.38)`,
                    color: geneColor,
                  }}>
                  Gene locus
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {stage >= 5 && stage < 7 && (
        <PollenGeneLegend
          geneColor={geneColor}
          selectedGeneId={selectedGeneId}
          onSelectGene={onSelectGene}
        />
      )}

      {stage >= 7 && (
        <TraitLinkBadge selectedGeneId={selectedGeneId} geneColor={geneColor} />
      )}

      {/* ─── Stage caption bar ───────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {[
          null, // stage 0 unused
          { title:'Hibiscus flower',       body:'Each petal colour is encoded by a gene on a chromosome inside the pollen.' },
          { title:'Anther cross-section',  body:'Two theca, each with two locules, lined by tapetum that nurtures pollen development.' },
          { title:'Pollen transfer',      body:'The anther releases echinate pollen; each grain follows a directed trajectory toward the stigma.' },
          { title:'Compatible pollen lands', body:'Several grains contact the stigma surface; the highlighted grain is selected for germination.' },
          { title:'Pollen grain interior', body:'The cutaway reveals the tube cell nucleus, generative cell, and four clickable gene loci carried by the grain.' },
          { title:'Gene locus',            body:'Select Colour, Size, Shape, or Intensity to inspect the matching DNA region inside the pollen chromosome.' },
          { title:'Pollen tube growth',   body:'The selected grain germinates and extends a pollen tube through the stigma and style.' },
          { title:'Male gametes → fertilization', body:'Two male gametes travel through the pollen tube; the accelerated simulation now makes fertilization available.' },
        ].map((item, i) => item && stage === i && (
          <motion.div key={i}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.45 }}
            className="absolute bottom-4 left-4 right-4 bg-black/45 backdrop-blur-sm border border-white/[0.09] rounded-xl px-4 py-3"
          >
            <p className="text-[12px] font-semibold text-white mb-0.5">{item.title}</p>
            <p className="text-[11px] text-[#b8aee8] leading-relaxed">{item.body}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
