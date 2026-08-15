import { PRESETS, GENE_DEFS, GENE_COLORS } from '@/lib/dnaEngine';
import FlowerCanvas from './FlowerCanvas';
import { RefreshCw, Shuffle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { FlowerSize, PetalShape, PigmentIntensity } from '../App';

interface GeneViewProps {
  geneColor: string;
  onChangeColor: (hex: string) => void;
  onRandom: () => void;
  onReset: () => void;
  onSimulate: () => void;
  // multi-gene props (new)
  selectedGeneId: number;
  onSelectGene: (id: number) => void;
  flowerSize: FlowerSize;
  onSizeChange: (s: FlowerSize) => void;
  petalShape: PetalShape;
  onShapeChange: (s: PetalShape) => void;
  pigmentIntensity: PigmentIntensity;
  onIntensityChange: (s: PigmentIntensity) => void;
}

// ─── current trait value label per gene ──────────────────────────────────────
function currentTraitValue(
  id: number, geneColor: string,
  flowerSize: FlowerSize, petalShape: PetalShape, pigmentIntensity: PigmentIntensity,
) {
  if (id === 0) return geneColor.toUpperCase();
  if (id === 1) return flowerSize.charAt(0).toUpperCase() + flowerSize.slice(1) + ' Flower';
  if (id === 2) return petalShape.charAt(0).toUpperCase() + petalShape.slice(1) + ' Petals';
  return pigmentIntensity.charAt(0).toUpperCase() + pigmentIntensity.slice(1) + ' Pigment';
}

// ─── Educational info tooltip ─────────────────────────────────────────────────
const EDU_ITEMS = [
  { label: 'DNA', text: 'Contains the complete genetic instructions of the plant, encoded as sequences of base pairs.' },
  { label: 'Gene', text: 'A small section of DNA that controls a specific inherited characteristic of the organism.' },
  { label: 'Trait', text: 'The visible characteristic produced by gene expression — what you can observe in the organism.' },
];

function EduButton() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-[11px] text-[#7c6ba8] hover:text-[#a78bfa] transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
        title="Educational notes"
      >
        <Info className="w-3.5 h-3.5" />
        Learn
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-8 z-50 w-64 bg-[#120e2a]/95 backdrop-blur-md border border-[#bfe3ee18] rounded-xl shadow-2xl p-3 flex flex-col gap-2.5"
          >
            {EDU_ITEMS.map(item => (
              <div key={item.label}>
                <p className="text-[11px] font-semibold text-[#c4b5fd] mb-0.5">{item.label}</p>
                <p className="text-[10.5px] text-[#9b8fcf] leading-[1.5]">{item.text}</p>
              </div>
            ))}
            <button
              onClick={() => setOpen(false)}
              className="self-end text-[10px] text-[#7c6ba8] hover:text-[#a78bfa] mt-1"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Trait option pill button ─────────────────────────────────────────────────
function TraitPill({
  label, active, color, onClick,
}: { label: string; active: boolean; color: string; onClick: () => void }) {
  const r = parseInt(color.slice(1,3),16), g = parseInt(color.slice(3,5),16), b = parseInt(color.slice(5,7),16);
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 py-2 px-1 rounded-xl text-[clamp(10px,1.2vw,12.5px)] font-semibold tracking-[0.01em]
        border transition-all duration-250 hover:scale-[1.03] active:scale-[0.98]
        ${active ? 'text-white' : 'text-[#9b8fcf] bg-white/[0.04] border-white/[0.09] hover:bg-white/[0.07]'}
      `}
      style={active ? {
        backgroundColor: `rgba(${r},${g},${b},0.22)`,
        borderColor: `rgba(${r},${g},${b},0.55)`,
        boxShadow: `0 0 12px rgba(${r},${g},${b},0.28)`,
      } : {}}
    >
      {label}
    </button>
  );
}

// ─── Subtle gene-expression pathway ───────────────────────────────────────────
function ExpressionFlow({
  geneId,
  activeColor,
  trait,
}: {
  geneId: number;
  activeColor: string;
  trait: string;
}) {
  const steps = geneId === 0
    ? [
        ['Gene', 'DNA'],
        ['mRNA', 'transcription'],
        ['Pigment', 'translation'],
        ['Colour', trait],
      ]
    : geneId === 1
      ? [
          ['Gene', 'DNA'],
          ['mRNA', 'transcription'],
          ['Growth', 'cell division'],
          ['Size', trait],
        ]
      : geneId === 2
        ? [
            ['Gene', 'DNA'],
            ['mRNA', 'transcription'],
            ['Morphogen', 'patterning'],
            ['Shape', trait],
          ]
        : [
            ['Gene', 'DNA'],
            ['mRNA', 'transcription'],
            ['Enzyme', 'pigment synthesis'],
            ['Intensity', trait],
          ];

  const cr = parseInt(activeColor.slice(1, 3), 16);
  const cg = parseInt(activeColor.slice(3, 5), 16);
  const cb = parseInt(activeColor.slice(5, 7), 16);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -3 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      className="overflow-hidden rounded-xl border border-white/[0.08] bg-black/[0.12] px-3 py-2.5"
      aria-label={`Biological pathway from gene to ${trait}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#8d80bd]">
          Gene expression pathway
        </span>
        <span className="text-[9px] text-[#62578e]">signal → trait</span>
      </div>

      <div className="relative mt-2.5">
        <div className="absolute left-[12.5%] right-[12.5%] top-[12px] h-px bg-white/[0.1]" />
        <motion.div
          className="absolute left-[12.5%] top-[11px] h-[3px] w-[75%] origin-left rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${activeColor}, transparent)` }}
          animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 0.8, 0.55, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 0.7, ease: 'easeInOut' }}
        />
        <div className="relative grid grid-cols-4 gap-1">
          {steps.map(([label, sub], index) => (
            <div key={`${label}-${index}`} className="flex min-w-0 flex-col items-center gap-1 text-center">
              <motion.div
                className="h-2.5 w-2.5 rounded-full border"
                style={{
                  backgroundColor: index === 0 || index === 3 ? `rgba(${cr},${cg},${cb},0.72)` : 'rgba(167,139,250,0.34)',
                  borderColor: index === 0 || index === 3 ? `rgba(${cr},${cg},${cb},0.85)` : 'rgba(167,139,250,0.48)',
                }}
                animate={{
                  boxShadow: index === 3
                    ? [`0 0 0 rgba(${cr},${cg},${cb},0)`, `0 0 12px rgba(${cr},${cg},${cb},0.55)`, `0 0 0 rgba(${cr},${cg},${cb},0)`]
                    : '0 0 0 rgba(167,139,250,0)',
                }}
                transition={index === 3
                  ? { duration: 2.8, repeat: Infinity, repeatDelay: 0.7, ease: 'easeInOut' }
                  : { duration: 0.2 }}
              />
              <span className="max-w-full truncate text-[9px] font-semibold text-[#c8bdf0]">{label}</span>
              <span className="max-w-full truncate text-[8px] text-[#71669e]">{sub}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GeneView({
  geneColor, onChangeColor, onRandom, onReset, onSimulate,
  selectedGeneId, onSelectGene,
  flowerSize, onSizeChange,
  petalShape, onShapeChange,
  pigmentIntensity, onIntensityChange,
}: GeneViewProps) {
  const r = parseInt(geneColor.slice(1, 3), 16);
  const g = parseInt(geneColor.slice(3, 5), 16);
  const b = parseInt(geneColor.slice(5, 7), 16);

  const def = GENE_DEFS[selectedGeneId];
  const activeColor = selectedGeneId === 0 ? geneColor : GENE_COLORS[selectedGeneId];
  const ar = parseInt(activeColor.slice(1,3),16);
  const ag = parseInt(activeColor.slice(3,5),16);
  const ab = parseInt(activeColor.slice(5,7),16);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="phyto-gene-view flex flex-col gap-[clamp(12px,2vh,20px)] h-full"
    >

      {/* ── Gene selector row ──────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[clamp(12px,1.4vw,14.5px)] font-semibold text-[#ede9fe] tracking-[0.01em]">
            Select Gene
          </h2>
          <EduButton />
        </div>

        <div className="phyto-gene-selector grid grid-cols-4 gap-1.5">
          {GENE_DEFS.map(gd => {
            const col = gd.id === 0 ? geneColor : GENE_COLORS[gd.id];
            const cr = parseInt(col.slice(1,3),16), cg = parseInt(col.slice(3,5),16), cb = parseInt(col.slice(5,7),16);
            const isActive = selectedGeneId === gd.id;
            return (
              <button
                key={gd.id}
                onClick={() => onSelectGene(gd.id)}
                className={`
                  rounded-xl py-2 px-1.5 text-center transition-all duration-250
                  text-[clamp(9px,1.05vw,11px)] font-semibold leading-tight
                  border hover:scale-[1.04] active:scale-[0.97]
                  ${isActive ? 'text-white' : 'text-[#9b8fcf] bg-white/[0.04] border-white/[0.09] hover:bg-white/[0.07]'}
                `}
                style={isActive ? {
                  backgroundColor: `rgba(${cr},${cg},${cb},0.2)`,
                  borderColor: `rgba(${cr},${cg},${cb},0.52)`,
                  boxShadow: `0 0 14px rgba(${cr},${cg},${cb},0.3)`,
                } : {}}
              >
                <span className="block text-[13px] mb-0.5"
                  style={{ color: isActive ? col : '#6b5fa0' }}>●</span>
                {gd.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Gene info card ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedGeneId}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.28 }}
          className="rounded-xl border p-3.5 flex flex-col gap-1.5"
          style={{
            background: `rgba(${ar},${ag},${ab},0.07)`,
            borderColor: `rgba(${ar},${ag},${ab},0.28)`,
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[clamp(12px,1.4vw,14px)] font-bold leading-snug"
                style={{ color: activeColor }}>
                {def.name}
              </p>
              <p className="text-[10.5px] text-[#7c6ba8] mt-0.5">Controls: <span className="text-[#b8aee8]">{def.trait}</span></p>
            </div>
            <div className="shrink-0 rounded-lg px-2 py-1 text-center border"
              style={{
                background: `rgba(${ar},${ag},${ab},0.14)`,
                borderColor: `rgba(${ar},${ag},${ab},0.35)`,
              }}>
              <p className="text-[9px] text-[#8b7fc0] leading-none mb-0.5">Expression</p>
              <p className="text-[11px] font-semibold whitespace-nowrap transition-colors duration-300"
                style={{ color: activeColor }}>
                {currentTraitValue(selectedGeneId, geneColor, flowerSize, petalShape, pigmentIntensity)}
              </p>
            </div>
          </div>
          <p className="text-[10.5px] text-[#9b8fcf] leading-[1.5] mt-0.5">{def.description}</p>
        </motion.div>
      </AnimatePresence>

      {/* ── Per-gene controls ──────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* Gene 0 — Colour (existing UI, unchanged) */}
        {selectedGeneId === 0 && (
          <motion.div key="ctrl-0"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-2.5"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-2 flex-wrap">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.hex}
                    title={preset.label}
                    onClick={() => onChangeColor(preset.hex)}
                    className={`
                      w-[clamp(32px,4.2vw,44px)] h-[clamp(32px,4.2vw,44px)]
                      rounded-full shrink-0 border-[3px] transition-all duration-200 hover:scale-110
                      ${geneColor.toUpperCase() === preset.hex.toUpperCase() ? 'border-white shadow-[0_0_0_3px_rgba(255,255,255,0.22)]' : 'border-transparent'}
                    `}
                    style={{ backgroundColor: preset.hex }}
                    aria-label={`Select ${preset.label} colour`}
                  />
                ))}
              </div>
              <div
                className="w-[clamp(32px,4.2vw,44px)] h-[clamp(32px,4.2vw,44px)] rounded-full border-2 border-dashed border-[#c8beff6b] bg-[#7864c829] cursor-pointer flex items-center justify-center text-[19px] text-[#c8beffA6] transition-colors duration-200 hover:border-[#c8beffE6] hover:bg-[#7864c84D] relative overflow-hidden shrink-0"
                title="Custom colour"
              >
                +
                <input
                  type="color"
                  value={geneColor}
                  onChange={(e) => onChangeColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  aria-label="Custom gene colour"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#7c6ba8]">Hex code:</span>
              <span
                className="font-mono text-[clamp(11px,1.3vw,13.5px)] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md tracking-[0.06em] transition-colors duration-300 select-all"
                style={{ color: geneColor }}
              >
                {geneColor.toUpperCase()}
              </span>
            </div>
            <div className="bg-white/5 border border-[#bfe3ee1c] rounded-xl px-3.5 py-2.5 text-[clamp(10.5px,1.2vw,12.5px)] leading-[1.55] text-[#b8aee8]">
              The highlighted part of DNA is a <span className="font-bold transition-colors duration-300" style={{ color: geneColor }}>GENE</span>.
              Changing the gene can change the trait.
            </div>
          </motion.div>
        )}

        {/* Gene 1 — Size */}
        {selectedGeneId === 1 && (
          <motion.div key="ctrl-1"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-2.5"
          >
            <p className="text-[11px] text-[#7c6ba8]">Select flower size allele:</p>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as FlowerSize[]).map(s => (
                <TraitPill key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} active={flowerSize === s}
                  color={GENE_COLORS[1]} onClick={() => onSizeChange(s)} />
              ))}
            </div>
            <div className="bg-white/5 border border-[#bfe3ee1c] rounded-xl px-3.5 py-2.5 text-[clamp(10.5px,1.2vw,12.5px)] leading-[1.55] text-[#b8aee8]">
              <span className="font-bold" style={{ color: GENE_COLORS[1] }}>Size Gene</span> regulates how
              large the flower grows — controlled by cell proliferation rate in petal tissue.
            </div>
          </motion.div>
        )}

        {/* Gene 2 — Petal Shape */}
        {selectedGeneId === 2 && (
          <motion.div key="ctrl-2"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-2.5"
          >
            <p className="text-[11px] text-[#7c6ba8]">Select petal shape allele:</p>
            <div className="flex gap-2">
              {(['rounded', 'narrow', 'wavy'] as PetalShape[]).map(s => (
                <TraitPill key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} active={petalShape === s}
                  color={GENE_COLORS[2]} onClick={() => onShapeChange(s)} />
              ))}
            </div>
            <div className="bg-white/5 border border-[#bfe3ee1c] rounded-xl px-3.5 py-2.5 text-[clamp(10.5px,1.2vw,12.5px)] leading-[1.55] text-[#b8aee8]">
              <span className="font-bold" style={{ color: GENE_COLORS[2] }}>Shape Gene</span> governs petal
              margin development — from broad rounded lobes to narrow elongated or undulating forms.
            </div>
          </motion.div>
        )}

        {/* Gene 3 — Pigment Intensity */}
        {selectedGeneId === 3 && (
          <motion.div key="ctrl-3"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-2.5"
          >
            <p className="text-[11px] text-[#7c6ba8]">Select pigment intensity allele:</p>
            <div className="flex gap-2">
              {(['pale', 'medium', 'deep'] as PigmentIntensity[]).map(s => (
                <TraitPill key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} active={pigmentIntensity === s}
                  color={GENE_COLORS[3]} onClick={() => onIntensityChange(s)} />
              ))}
            </div>
            <div className="bg-white/5 border border-[#bfe3ee1c] rounded-xl px-3.5 py-2.5 text-[clamp(10.5px,1.2vw,12.5px)] leading-[1.55] text-[#b8aee8]">
              <span className="font-bold" style={{ color: GENE_COLORS[3] }}>Intensity Gene</span> controls
              pigment concentration per cell — from washed-out pale to deep saturated colour.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Resulting Trait ────────────────────────────────────── */}
      <div className="phyto-trait-section flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-[23px] h-[23px] shrink-0 rounded-full bg-[#8b5cf638] border border-[#8b5cf68c] flex items-center justify-center text-[11.5px] font-bold text-[#c4b5fd]">
            2
          </div>
          <h2 className="text-[clamp(13px,1.6vw,16px)] font-semibold text-[#ede9fe] tracking-[0.01em]">
            Resulting Trait
          </h2>
        </div>

        <ExpressionFlow
          key={selectedGeneId}
          geneId={selectedGeneId}
          activeColor={activeColor}
          trait={def.trait}
        />

        <FlowerCanvas
          geneColor={geneColor}
          flowerSize={flowerSize}
          petalShape={petalShape}
          pigmentIntensity={pigmentIntensity}
        />

        <p className="text-center text-[clamp(12px,1.4vw,14.5px)] font-semibold text-[#e2d9f3]">
          Hibiscus Flower
          <span className="block text-[clamp(10px,1.1vw,11.5px)] font-normal mt-0.5">
            {[
              <span key="c" className="transition-colors duration-300" style={{ color: geneColor }}>
                {geneColor.toUpperCase()}
              </span>,
              <span key="sep1" className="text-[#4a3e6a]"> · </span>,
              <span key="s" style={{ color: GENE_COLORS[1] }}>
                {flowerSize.charAt(0).toUpperCase() + flowerSize.slice(1)}
              </span>,
              <span key="sep2" className="text-[#4a3e6a]"> · </span>,
              <span key="sh" style={{ color: GENE_COLORS[2] }}>
                {petalShape.charAt(0).toUpperCase() + petalShape.slice(1)}
              </span>,
              <span key="sep3" className="text-[#4a3e6a]"> · </span>,
              <span key="i" style={{ color: GENE_COLORS[3] }}>
                {pigmentIntensity.charAt(0).toUpperCase() + pigmentIntensity.slice(1)}
              </span>,
            ]}
          </span>
        </p>
      </div>

      {/* ── How it works ───────────────────────────────────────── */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-[23px] h-[23px] shrink-0 rounded-full bg-[#8b5cf638] border border-[#8b5cf68c] flex items-center justify-center text-[11.5px] font-bold text-[#c4b5fd]">
            3
          </div>
          <h2 className="text-[clamp(13px,1.6vw,16px)] font-semibold text-[#ede9fe] tracking-[0.01em]">
            How it works
          </h2>
        </div>

        <div className="flex items-center justify-between gap-[3px] bg-white/[0.04] rounded-xl border border-[#bfe3ee14] px-2 py-3">
          <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <div className="w-[clamp(26px,3.6vw,36px)] h-[clamp(26px,3.6vw,36px)] flex items-center justify-center">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M13 4 Q8 14 13 20 Q18 26 13 32" stroke="#5FD8E8" strokeWidth="1.7" strokeLinecap="round"/>
                <path d="M23 4 Q28 14 23 20 Q18 26 23 32" stroke="#5FD8E8" strokeWidth="1.7" strokeLinecap="round"/>
                <line x1="14" y1="9.5"  x2="22" y2="9.5"  stroke="#5FD8E8" strokeWidth="1.3" opacity="0.7" strokeLinecap="round"/>
                <line x1="14" y1="15"   x2="22" y2="15"   stroke="#5FD8E8" strokeWidth="1.3" opacity="0.7" strokeLinecap="round"/>
                <line x1="14" y1="22.5" x2="22" y2="22.5" stroke="#5FD8E8" strokeWidth="1.3" opacity="0.7" strokeLinecap="round"/>
                <line x1="14" y1="28"   x2="22" y2="28"   stroke="#5FD8E8" strokeWidth="1.3" opacity="0.7" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="text-[clamp(8px,1vw,10.5px)] text-[#9b8fcf] text-center leading-[1.3]">DNA</div>
          </div>
          <div className="text-[clamp(11px,1.5vw,16px)] text-[#a08cdc73] shrink-0">→</div>
          <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <div className="w-[clamp(26px,3.6vw,36px)] h-[clamp(26px,3.6vw,36px)] flex items-center justify-center">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M13 4 Q8 14 13 20 Q18 26 13 32" stroke={activeColor} className="transition-colors duration-300" strokeWidth="1.7" strokeLinecap="round"/>
                <path d="M23 4 Q28 14 23 20 Q18 26 23 32" stroke={activeColor} className="transition-colors duration-300" strokeWidth="1.7" strokeLinecap="round"/>
                <line x1="14" y1="13" x2="22" y2="13" stroke={activeColor} className="transition-colors duration-300" strokeWidth="1.3" strokeLinecap="round"/>
                <line x1="14" y1="18" x2="22" y2="18" stroke={activeColor} className="transition-colors duration-300" strokeWidth="1.3" strokeLinecap="round"/>
                <line x1="14" y1="23" x2="22" y2="23" stroke={activeColor} className="transition-colors duration-300" strokeWidth="1.3" strokeLinecap="round"/>
                <ellipse cx="18" cy="18" rx="7" ry="9" stroke={activeColor} fill={`${activeColor}26`} className="transition-colors duration-300" strokeWidth="1.3"/>
              </svg>
            </div>
            <div className="text-[clamp(8px,1vw,10.5px)] text-[#9b8fcf] text-center leading-[1.3]">Gene</div>
          </div>
          <div className="text-[clamp(11px,1.5vw,16px)] text-[#a08cdc73] shrink-0">→</div>
          <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <div className="w-[clamp(26px,3.6vw,36px)] h-[clamp(26px,3.6vw,36px)] flex items-center justify-center">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="18" cy="18" r="10" stroke="#a78bfa" strokeWidth="1.5"/>
                <circle cx="18" cy="18" r="4.5" stroke="#a78bfa" strokeWidth="1.5"/>
                <line x1="18" y1="8"  x2="18" y2="3"  stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="18" y1="28" x2="18" y2="33" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="28" y1="18" x2="33" y2="18" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="8"  y1="18" x2="3"  y2="18" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="text-[clamp(8px,1vw,10.5px)] text-[#9b8fcf] text-center leading-[1.3]">
              {def.trait}
            </div>
          </div>
          <div className="text-[clamp(11px,1.5vw,16px)] text-[#a08cdc73] shrink-0">→</div>
          <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <div className="w-[clamp(26px,3.6vw,36px)] h-[clamp(26px,3.6vw,36px)] flex items-center justify-center">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {[0,72,144,216,288].map(deg => (
                  <ellipse key={deg} cx="18" cy="10" rx="4" ry="8" transform={`rotate(${deg} 18 18)`} fill={geneColor} opacity=".75" className="transition-colors duration-300"/>
                ))}
                <circle cx="18" cy="18" r="3.5" fill="#f9a825"/>
              </svg>
            </div>
            <div className="text-[clamp(8px,1vw,10.5px)] text-[#9b8fcf] text-center leading-[1.3]">Inherited Trait</div>
          </div>
        </div>
      </div>

      {/* ── Action buttons ────────────────────────────────────── */}
      <div className="phyto-action-row flex flex-col sm:flex-row gap-3 mt-auto pt-4 pb-2">
        <button
          onClick={onRandom}
          className="flex-1 py-3 rounded-xl border-none cursor-pointer text-[clamp(12px,1.4vw,14px)] font-semibold tracking-[0.01em] flex items-center justify-center gap-2 text-white transition-all duration-300 hover:-translate-y-[1px] active:translate-y-0"
          style={{ backgroundColor: geneColor, boxShadow: `0 0 18px rgba(${r},${g},${b},0.45)` }}
        >
          <Shuffle className="w-4 h-4" />
          Random Gene
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-3 rounded-xl bg-white/5 text-[#c4b5fd] border border-white/10 cursor-pointer text-[clamp(12px,1.4vw,14px)] font-semibold tracking-[0.01em] flex items-center justify-center gap-2 transition-colors duration-200 hover:bg-white/10"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <button
        onClick={onSimulate}
        className="phyto-simulate-button w-full py-4 rounded-xl border border-[#bfe3ee1c] bg-[#1c1547]/50 hover:bg-[#1c1547]/80 text-[#ede9fe] cursor-pointer text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        Simulate Pollination
        <span className="text-xl leading-none ml-1">→</span>
      </button>

    </motion.div>
  );
}
