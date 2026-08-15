import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Pause, Play, RotateCcw } from 'lucide-react';
import PollinationAnimation from './PollinationAnimation';
import { useState, useEffect } from 'react';
import type { FlowerSize, PetalShape, PigmentIntensity } from '../App';

interface PollinationViewProps {
  geneColor: string;
  onBack: () => void;
  selectedGeneId: number;
  onSelectGene: (id: number) => void;
  flowerSize: FlowerSize;
  petalShape: PetalShape;
  pigmentIntensity: PigmentIntensity;
}

export default function PollinationView({
  geneColor,
  onBack,
  selectedGeneId,
  onSelectGene,
  flowerSize,
  petalShape,
  pigmentIntensity,
}: PollinationViewProps) {
  const [stage, setStage] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-play sequence
  useEffect(() => {
    if (!isPlaying) return;
    
    const times = [0, 3600, 7600, 11600, 15600, 19800, 24000, 28000, 32000];
    const timers: number[] = [];

    times.forEach((time, index) => {
      if (index === 0) return; // Stage 1 is immediate
      
      const timerId = window.setTimeout(() => {
        if (index <= 8) {
          setStage(index + 1); // 1-indexed stages (1 to 8)
        }
        if (index === 8) {
          setIsPlaying(false);
        }
      }, time);
      timers.push(timerId);
    });

    return () => timers.forEach(id => clearTimeout(id));
  }, [isPlaying]);

  const handleReplay = () => {
    setStage(1);
    setIsPlaying(true);
  };

  const handleStageSelect = (nextStage: number) => {
    setStage(nextStage);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (stage >= 8 && !isPlaying) {
      handleReplay();
      return;
    }
    setIsPlaying(value => !value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="phyto-pollination-view flex flex-col h-full relative"
    >
      {/* Header / Back */}
      <div className="flex items-center gap-3 mb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-medium text-[#a78bfa] hover:text-[#ede9fe] transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to DNA
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold tracking-[0.12em] ${isPlaying ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-[#a78bfa33] bg-[#a78bfa0d] text-[#b8aee8]'}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isPlaying ? 'animate-pulse bg-emerald-300' : 'bg-[#8b7ac4]'}`} />
            {isPlaying ? 'POLLINATION ACTIVE' : stage >= 8 ? 'POLLINATION COMPLETE' : 'PAUSED'}
          </span>
          <span className="text-[10px] tabular-nums text-[#8276ad]">{stage}/8</span>
          <button
            onClick={handlePlayPause}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#a08cdc] hover:text-[#c4b5fd] transition-colors py-1 px-3 rounded-full bg-white/5 hover:bg-white/10"
            aria-label={isPlaying ? 'Pause pollination animation' : 'Play pollination animation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={handleReplay}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#a08cdc] hover:text-[#c4b5fd] transition-colors py-1 px-3 rounded-full bg-white/5 hover:bg-white/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Replay
          </button>
        </div>
      </div>

      {/* Top flow diagram */}
      <div className="flex items-center justify-between gap-[2px] bg-white/[0.04] rounded-xl border border-[#bfe3ee14] px-3 py-3 mb-5 shrink-0 overflow-x-auto">
       <FlowStep icon="flower" label="Flower" geneColor={geneColor} active={stage >= 1} onClick={() => handleStageSelect(1)} />
        <FlowArrow />
        <FlowStep icon="anther" label="Anther" active={stage >= 2} onClick={() => handleStageSelect(2)} />
        <FlowArrow />
        <FlowStep icon="pollen" label="Pollen" active={stage >= 3} onClick={() => handleStageSelect(3)} />
        <FlowArrow />
        <FlowStep icon="chromosome" label="Chromosome" active={stage >= 5} onClick={() => handleStageSelect(5)} />
        <FlowArrow />
        <FlowStep icon="gene" label="Gene" geneColor={geneColor} active={stage >= 6} onClick={() => handleStageSelect(6)} />
      </div>

      {/* Animation Area */}
      <div className="flex-1 relative bg-black/20 rounded-xl border border-[#8b5cf633] overflow-hidden min-h-[300px]">
        <PollinationAnimation
          stage={stage}
          geneColor={geneColor}
          paused={!isPlaying}
          selectedGeneId={selectedGeneId}
          onSelectGene={onSelectGene}
          flowerSize={flowerSize}
          petalShape={petalShape}
          pigmentIntensity={pigmentIntensity}
        />
      </div>

      {/* Info box */}
      <div className="mt-5 bg-white/5 border border-[#bfe3ee1c] rounded-xl p-4 shrink-0">
        <p className="text-[clamp(12px,1.3vw,14px)] leading-relaxed text-[#b8aee8] m-0">
          Each pollen grain carries DNA with the <span className="font-bold transition-colors duration-300" style={{ color: geneColor }}>Colour</span>, Size, Shape, and Intensity genes.
          Select a flow step to pause and inspect the pollen, chromosome, or individual gene regions. The biological 20-day timeline is shown as accelerated simulation time.
        </p>
      </div>
    </motion.div>
  );
}

function FlowArrow() {
  return <div className="text-[12px] text-[#a08cdc55] shrink-0 mx-1">→</div>;
}

function FlowStep({
  icon,
  label,
  active,
  geneColor,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  geneColor?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Show ${label} stage`}
      className={`phyto-flow-step flex flex-col items-center gap-1.5 min-w-[46px] border-0 bg-transparent p-0 transition-all duration-500 cursor-pointer hover:scale-105 ${active ? 'opacity-100' : 'opacity-40'}`}
    >
      <div className="w-7 h-7 flex items-center justify-center shrink-0">
        {icon === 'flower' && (
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            {[0, 72, 144, 216, 288].map(deg => (
              <ellipse key={deg} cx="12" cy="7" rx="3" ry="5.5" transform={`rotate(${deg} 12 12)`} fill={geneColor} opacity=".8" />
            ))}
            <circle cx="12" cy="12" r="2.5" fill="#f9a825"/>
          </svg>
        )}
        {icon === 'anther' && (
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <rect x="9" y="5" width="6" height="14" rx="3" fill="#f9a825" stroke="#ca8a04" strokeWidth="1"/>
            <line x1="12" y1="6" x2="12" y2="18" stroke="#ca8a04" strokeWidth="1" strokeDasharray="2 2"/>
          </svg>
        )}
        {icon === 'pollen' && (
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <defs>
              <radialGradient id="fsw-pg" cx="38%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ffe680"/>
                <stop offset="100%" stopColor="#8b5000"/>
              </radialGradient>
            </defs>
            <circle cx="12" cy="12" r="6.5" fill="url(#fsw-pg)"/>
            {/* 3 colpi */}
            {[0,120,240].map(d => (
              <ellipse key={d} cx="12" cy="5.8" rx="1" ry="2" fill="rgba(40,15,0,0.5)" transform={`rotate(${d} 12 12)`}/>
            ))}
            {/* spines */}
            {[0,45,90,135,180,225,270,315].map((d,i) => {
              const rad = d*Math.PI/180;
              return <line key={i}
                x1={12+Math.cos(rad)*6} y1={12+Math.sin(rad)*6}
                x2={12+Math.cos(rad)*8} y2={12+Math.sin(rad)*8}
                stroke="#6b3800" strokeWidth="0.7" strokeLinecap="round"/>;
            })}
          </svg>
        )}
        {icon === 'chromosome' && (
          /* Nucleus with diffuse interphase chromatin — NOT X-shapes */
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <circle cx="12" cy="12" r="8" fill="rgba(60,30,120,0.5)" stroke="rgba(160,120,255,0.55)" strokeWidth="1"/>
            <circle cx="12" cy="12" r="7" fill="none" stroke="rgba(140,100,220,0.25)" strokeWidth="0.5"/>
            {/* diffuse chromatin loops */}
            <path d="M9,10 C8,8 10,7 12,9 C14,11 12,13 10,12 C8,11 9,10 9,10" fill="rgba(150,110,230,0.4)" stroke="rgba(170,140,255,0.5)" strokeWidth="0.4"/>
            <path d="M13,11 C14,9 16,10 15,13 C14,15 12,14 13,12" fill="rgba(130,95,210,0.35)" stroke="rgba(160,125,240,0.45)" strokeWidth="0.4"/>
            <path d="M9,14 C8,15 9,17 11,16 C13,15 12,13 10,14" fill="rgba(110,80,190,0.35)" stroke="rgba(150,120,230,0.40)" strokeWidth="0.4"/>
            {/* nucleolus */}
            <ellipse cx="11.5" cy="12" rx="2" ry="1.6" fill="rgba(50,25,100,0.7)" stroke="rgba(160,130,240,0.35)" strokeWidth="0.4"/>
          </svg>
        )}
        {icon === 'gene' && (
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <circle cx="12" cy="12" r="8" fill="rgba(60,30,120,0.5)" stroke="rgba(160,120,255,0.55)" strokeWidth="1"/>
            <circle cx="12" cy="12" r="7" fill="none" stroke="rgba(140,100,220,0.25)" strokeWidth="0.5"/>
            <path d="M9,10 C8,8 10,7 12,9 C14,11 12,13 10,12 C8,11 9,10 9,10" fill="rgba(150,110,230,0.4)" stroke="rgba(170,140,255,0.5)" strokeWidth="0.4"/>
            <path d="M13,11 C14,9 16,10 15,13 C14,15 12,14 13,12" fill="rgba(130,95,210,0.35)" stroke="rgba(160,125,240,0.45)" strokeWidth="0.4"/>
            {/* gene locus highlight */}
            <path d="M13,9.5 Q14.5,11 13,12.5" stroke={geneColor} strokeWidth="2" strokeLinecap="round" fill="none"/>
            <ellipse cx="11.5" cy="12" rx="2" ry="1.6" fill="rgba(50,25,100,0.7)" stroke="rgba(160,130,240,0.35)" strokeWidth="0.4"/>
          </svg>
        )}
      </div>
      <div className={`phyto-flow-label text-[9px] text-center leading-[1.1] ${active ? 'text-[#ede9fe] font-medium' : 'text-[#9b8fcf]'}`}>
        {label}
      </div>
    </button>
  );
}
