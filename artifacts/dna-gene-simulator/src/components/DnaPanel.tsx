import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CONFIG, DEFAULT_COLOR, DNAHelix, GeneHighlight, GeneRegion, ParticleField, GENE_DEFS, GENE_COLORS } from '@/lib/dnaEngine';
import PhytoEmblem from './PhytoEmblem';

interface DnaPanelProps {
  geneColor: string;
  randomSeed: number;
  selectedGeneId: number;
  onGeneClick: (id: number) => void;
}

const CHROMOSOME_LOCUS = [
  { x: 212, y: 185, lineX: 104, labelY: 170, side: 'left' as const },
  { x: 309, y: 212, lineX: 416, labelY: 197, side: 'right' as const },
  { x: 213, y: 388, lineX: 104, labelY: 403, side: 'left' as const },
  { x: 310, y: 365, lineX: 416, labelY: 380, side: 'right' as const },
];

function ChromosomeView({
  geneColor,
  selectedGeneId,
  onGeneClick,
}: {
  geneColor: string;
  selectedGeneId: number;
  onGeneClick: (id: number) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.015 }}
      transition={{ duration: 0.42, ease: 'easeOut' }}
      className="absolute inset-0 z-[8] flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_45%,#1c1547_0%,#0d0a26_46%,#030210_100%)] px-3 pt-14 pb-10"
    >
      <div className="absolute top-[5%] left-[5%] right-[5%] flex items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-[clamp(20px,3.2vw,36px)] font-bold tracking-tight text-white">
            Chromosome
          </h1>
          <p className="mt-1.5 max-w-[240px] text-[clamp(10px,1.2vw,13px)] leading-relaxed text-[#9b8fcf]">
            Tightly packed DNA carrying many genes.
          </p>
        </div>
        <div className="rounded-lg border border-[#bfe3ee18] bg-black/20 px-2 py-1 text-right text-[9px] text-[#7469a5]">
          <span className="block text-[#b8aee8]">Chromosome 1</span>
          <span>DNA molecule, condensed</span>
        </div>
      </div>

      <svg
        viewBox="0 0 520 580"
        className="h-full max-h-[min(78vh,580px)] w-full max-w-[560px]"
        role="img"
        aria-label="Chromosome with four clickable DNA regions and their genes"
      >
        <defs>
          <filter id="chromosome-glow" x="-80%" y="-30%" width="260%" height="160%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="chromosome-gene-soft-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="4.5" />
          </filter>
          <linearGradient id="chromosome-arm" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5fd8e8" />
            <stop offset="0.48" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        <text x="260" y="46" textAnchor="middle" fill="#71669e" fontSize="12" letterSpacing="2">
          DNA REGIONS / LOCI
        </text>

        <g opacity=".24" filter="url(#chromosome-glow)" stroke="url(#chromosome-arm)" strokeWidth="31" strokeLinecap="round" fill="none">
          <path d="M207 127 C205 177 220 224 260 278 C300 332 315 380 313 451" />
          <path d="M313 127 C315 177 300 224 260 278 C220 332 205 380 207 451" />
        </g>
        <g stroke="url(#chromosome-arm)" strokeWidth="20" strokeLinecap="round" fill="none">
          <path d="M207 127 C205 177 220 224 260 278 C300 332 315 380 313 451" />
          <path d="M313 127 C315 177 300 224 260 278 C220 332 205 380 207 451" />
        </g>
        <g stroke="#e9e4ff" strokeOpacity=".3" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M207 127 C205 177 220 224 260 278 C300 332 315 380 313 451" />
          <path d="M313 127 C315 177 300 224 260 278 C220 332 205 380 207 451" />
        </g>
        <ellipse cx="260" cy="278" rx="31" ry="22" fill="#19133e" stroke="#d8d0ff" strokeOpacity=".6" strokeWidth="2" />
        <ellipse cx="260" cy="278" rx="17" ry="10" fill="#a78bfa" fillOpacity=".18" stroke="#c4b5fd" strokeOpacity=".5" />
        <text x="260" y="310" textAnchor="middle" fill="#8d80bd" fontSize="10">centromere</text>

        {GENE_DEFS.map((def, index) => {
          const locus = CHROMOSOME_LOCUS[index];
          const color = index === 0 ? geneColor : GENE_COLORS[index];
          const isSelected = selectedGeneId === def.id;
          const rgb = `${parseInt(color.slice(1, 3), 16)},${parseInt(color.slice(3, 5), 16)},${parseInt(color.slice(5, 7), 16)}`;
          const labelX = locus.side === 'left' ? 24 : 496;
          const textAnchor = locus.side === 'left' ? 'start' : 'end';

          return (
            <g
              key={def.id}
              role="button"
              tabIndex={0}
              aria-label={`DNA region for ${def.name}`}
              onClick={() => onGeneClick(def.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onGeneClick(def.id);
                }
              }}
              className="chromosome-gene-region cursor-pointer focus:outline-none"
            >
              <line
                x1={locus.x}
                y1={locus.y}
                x2={locus.lineX}
                y2={locus.labelY}
                stroke={`rgba(${rgb},${isSelected ? 0.8 : 0.35})`}
                strokeWidth={isSelected ? 1.8 : 1}
                strokeDasharray="3 4"
              />
              <rect
                x={locus.x - 17}
                y={locus.y - 6}
                width="34"
                height="12"
                rx="6"
                fill={color}
                opacity={isSelected ? 0.78 : 0}
                filter={isSelected ? 'url(#chromosome-gene-soft-glow)' : undefined}
                pointerEvents="none"
              />
              <rect
                x={locus.x - 17}
                y={locus.y - 6}
                width="34"
                height="12"
                rx="6"
                fill={`rgba(${rgb},${isSelected ? 0.42 : 0.18})`}
                stroke={isSelected ? 'transparent' : `rgba(${rgb},0.55)`}
                strokeWidth={isSelected ? 0 : 1}
              />
              {isSelected && (
                <circle
                  cx={locus.x}
                  cy={locus.y}
                  r="8"
                  fill={color}
                  opacity=".45"
                  filter="url(#chromosome-gene-soft-glow)"
                  pointerEvents="none"
                />
              )}
              <circle
                cx={locus.x}
                cy={locus.y}
                r={isSelected ? 5 : 3.5}
                fill={color}
                opacity={isSelected ? 1 : 0.72}
              />
              <text x={labelX} y={locus.labelY - 5} textAnchor={textAnchor} fill="#8d80bd" fontSize="9" letterSpacing=".8">
                DNA REGION
              </text>
              <text x={labelX} y={locus.labelY + 10} textAnchor={textAnchor} fill={isSelected ? color : '#d0c9ee'} fontSize="13" fontWeight="600">
                Gene: {def.shortName}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-[3%] left-1/2 w-[min(90%,420px)] -translate-x-1/2 rounded-xl border border-[#bfe3ee14] bg-black/25 px-3 py-2 text-center text-[clamp(9px,1vw,11px)] leading-[1.45] text-[#9b8fcf]">
        A <span className="font-semibold text-[#c4b5fd]">gene</span> is a specific DNA region on a chromosome that carries instructions for a trait.
      </div>
    </motion.div>
  );
}

export default function DnaPanel({ geneColor, randomSeed, selectedGeneId, onGeneClick }: DnaPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dnaRootRef = useRef<SVGGElement>(null);
  const particleRootRef = useRef<SVGGElement>(null);
  const nucleolusRef = useRef<SVGEllipseElement>(null);
  const [showChromosome, setShowChromosome] = useState(false);

  const engineRef = useRef<{
    helix: DNAHelix;
    particles: ParticleField;
    geneHighlight: GeneHighlight;
    geneRegions: GeneRegion[]; // genes 1-3
  } | null>(null);

  // Initialization — unchanged except we also create GeneRegion instances for genes 1-3
  useEffect(() => {
    if (!dnaRootRef.current || !particleRootRef.current || !containerRef.current || !svgRef.current) return;

    const rm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    
    dnaRootRef.current.innerHTML = '';
    particleRootRef.current.innerHTML = '';

    const helix = new DNAHelix(dnaRootRef.current, rm);
    const particles = new ParticleField(particleRootRef.current, CONFIG.particles.count, rm);
    const geneHighlight = new GeneHighlight(helix, geneColor || DEFAULT_COLOR, rm);

    // Create GeneRegion for genes 1, 2, 3 (gene 0 handled by existing GeneHighlight)
    const geneRegions = GENE_DEFS.slice(1).map(def =>
      new GeneRegion(helix, def.id, def.fraction, def.shortName, GENE_COLORS[def.id], rm)
    );

    engineRef.current = { helix, particles, geneHighlight, geneRegions };

    let reqId: number;
    let running = true;

    function layout() {
      if (!containerRef.current || !svgRef.current || !engineRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      svgRef.current.setAttribute('viewBox', `0 0 ${w} ${h}`);
      
      const mu = h / CONFIG.layout.masterUnitDivisor;
      engineRef.current.helix.layout(w, h);
      engineRef.current.particles.layout(w, h, mu);
      
      setTimeout(() => {
        if (!engineRef.current || !containerRef.current) return;
        const w2 = containerRef.current.clientWidth;
        const h2 = containerRef.current.clientHeight;
        engineRef.current.geneHighlight.layout(w2, h2);
        engineRef.current.geneRegions.forEach(r => r.layout(w2, h2));
      }, 0);

      document.getElementById('glow-blur')?.setAttribute('stdDeviation', (mu * 0.05).toFixed(2));
      document.getElementById('nucleolus-blur')?.setAttribute('stdDeviation', (mu * 0.9).toFixed(2));
      document.getElementById('gene-glow-blur')?.setAttribute('stdDeviation', (mu * CONFIG.gene.glowBlurUnits).toFixed(2));
      document.getElementById('gene-rung-glow-blur')?.setAttribute('stdDeviation', (mu * CONFIG.gene.rungGlowBlurUnits).toFixed(2));
      
      if (nucleolusRef.current) {
        nucleolusRef.current.setAttribute('cx', (w * 0.86).toFixed(1));
        nucleolusRef.current.setAttribute('cy', (h * 0.28).toFixed(1));
        nucleolusRef.current.setAttribute('rx', (mu * 3.2).toFixed(1));
        nucleolusRef.current.setAttribute('ry', (mu * 2.3).toFixed(1));
      }
    }

    const onResize = () => layout();
    window.addEventListener('resize', onResize);
    layout();

    const onVisChange = () => {
      const was = !running;
      running = !document.hidden;
      if (running && was) requestAnimationFrame(frame);
    };
    document.addEventListener('visibilitychange', onVisChange);

    function frame(t: number) {
      if (!running || !engineRef.current) return;
      engineRef.current.helix.update(t);
      engineRef.current.particles.update(t);
      engineRef.current.geneHighlight.update(t);
      engineRef.current.geneRegions.forEach(r => r.update(t));
      reqId = requestAnimationFrame(frame);
    }
    reqId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, []);

  // Handle colour change (gene 0 only — unchanged)
  useEffect(() => {
    if (engineRef.current && geneColor) {
      engineRef.current.geneHighlight.setColor(geneColor);
    }
  }, [geneColor]);

  // Handle random regeneration (unchanged)
  useEffect(() => {
    if (engineRef.current && randomSeed > 0) {
      engineRef.current.helix.sequence = [];
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        engineRef.current.helix.layout(w, h);
        engineRef.current.geneHighlight.layout(w, h);
        engineRef.current.geneRegions.forEach(r => r.layout(w, h));
      }
    }
  }, [randomSeed]);

  // Sync selected gene visuals
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.geneRegions.forEach(r => r.setSelected(r.id === selectedGeneId));
    // Gene 0 selection is shown via existing GeneHighlight glow; no extra needed
  }, [selectedGeneId]);

  // SVG click → find nearest gene within threshold and call onGeneClick
  function handleSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    const eng = engineRef.current;
    if (!svg || !eng) return;

    // Convert screen coords to SVG user-space coords
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const screenMatrix = svg.getScreenCTM();
    if (!screenMatrix) return;
    const svgPt = pt.matrixTransform(screenMatrix.inverse());

    const mu = eng.helix.masterUnit;
    const threshold = mu * 3.8;

    // Check gene 0 (use GeneHighlight marker position via bpSamples)
    const gh = eng.geneHighlight;
    const midIdx0 = Math.floor((gh.startIndex + gh.endIndex) / 2);
    const s0 = eng.helix.bpSamples[midIdx0];
    if (s0) {
      const gX0 = (s0.curX1 + s0.curX2) / 2, gY0 = s0.curY;
      if (Math.hypot(svgPt.x - gX0, svgPt.y - gY0) < threshold) {
        onGeneClick(0); return;
      }
    }

    // Check genes 1-3
    for (const region of eng.geneRegions) {
      if (Math.hypot(svgPt.x - region.curCenterX, svgPt.y - region.curCenterY) < threshold) {
        onGeneClick(region.id); return;
      }
    }
  }

  return (
      <div className="phyto-dna-panel relative flex-none h-[50vh] md:h-full md:w-[57%] min-w-0 overflow-hidden bg-[#03020a]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showChromosome ? 0 : 1 }}
        transition={{ duration: 0.35, delay: showChromosome ? 0 : 0.3 }}
        className="phyto-brand-header pointer-events-none absolute inset-x-0 top-0 z-20 h-[clamp(104px,15vh,138px)] border-b border-[#bfe3ee18] bg-[#03020acc] backdrop-blur-[2px]"
      >
        <div className="phyto-brand-lockup absolute inset-0 flex items-center justify-center gap-[clamp(10px,1.8vw,24px)] px-[clamp(16px,4.4vw,56px)] py-2 font-sans">
          <PhytoEmblem className="phyto-brand-emblem h-[clamp(52px,6vw,78px)] w-[clamp(52px,6vw,78px)] shrink-0" />
          <div className="min-w-0 text-center">
            <h1 className="m-0 whitespace-nowrap text-[clamp(20px,3.1vw,42px)] font-bold tracking-[0.14em] text-[#f8f5ff]">
              PHYTO ATHENIX
            </h1>
            <div className="relative mx-auto my-[clamp(4px,0.6vh,7px)] h-px w-[min(100%,560px)] bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent opacity-65">
              <span className="absolute -left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#8b5cf6] shadow-[0_0_8px_#8b5cf6]" />
              <span className="absolute -right-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#8b5cf6] shadow-[0_0_8px_#8b5cf6]" />
            </div>
            <p className="m-0 whitespace-nowrap text-[clamp(9px,1.2vw,16px)] font-medium tracking-[0.05em] text-[#aaa6bb]">
              Interactive Genetics &amp; Inheritance Simulator
            </p>
          </div>
        </div>
      </motion.div>

      <div ref={containerRef} className="absolute inset-x-0 bottom-0 top-[clamp(104px,15vh,138px)] overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showChromosome ? 0 : 1 }}
        transition={{ duration: 0.35, delay: showChromosome ? 0 : 0.3 }}
        className="pointer-events-none absolute left-[4%] top-[4%] z-10"
      >
        <h2 className="m-0 text-[clamp(16px,2.6vw,30px)] font-bold tracking-tight text-white">
          DNA
        </h2>
        <p className="mt-1 max-w-[155px] text-[clamp(9px,1.1vw,13px)] leading-relaxed text-[#9b8fcf]">
          A long molecule that contains our genes.
        </p>
      </motion.div>

      <div className="absolute right-[5%] top-[5%] z-20 flex items-center rounded-xl border border-[#bfe3ee18] bg-[#09071fcc] p-1 backdrop-blur-md shadow-[0_4px_18px_rgba(0,0,0,0.24)]" role="group" aria-label="Molecule view">
        <button
          type="button"
          onClick={() => setShowChromosome(false)}
          aria-pressed={!showChromosome}
          className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-all duration-250 ${!showChromosome ? 'bg-[#5fd8e826] text-[#d8f8ff] shadow-[0_0_10px_rgba(95,216,232,0.16)]' : 'text-[#756aa2] hover:text-[#b8aee8]'}`}
        >
          DNA
        </button>
        <button
          type="button"
          onClick={() => setShowChromosome(true)}
          aria-pressed={showChromosome}
          className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-all duration-250 ${showChromosome ? 'bg-[#a78bfa26] text-[#eeeaff] shadow-[0_0_10px_rgba(167,139,250,0.18)]' : 'text-[#756aa2] hover:text-[#b8aee8]'}`}
        >
          Chromosome
        </button>
      </div>

      {/* Click-to-select hint: contained in its own responsive safe area */}
      {!showChromosome && <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.35, ease: 'easeOut' }}
        className="absolute inset-x-3 bottom-3 sm:bottom-5 z-10 flex justify-center pointer-events-none"
      >
        <div className="max-w-[min(92%,260px)] text-center text-[clamp(9px,1vw,11px)] leading-[1.35] text-[#8d80bd] bg-[#09071fcc] backdrop-blur-md rounded-full px-3.5 py-1.5 border border-white/[0.1] shadow-[0_4px_18px_rgba(0,0,0,0.24)]">
          Click any gene to explore its trait
        </div>
      </motion.div>}

      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: showChromosome ? 0 : 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <svg
          ref={svgRef}
          id="scene-svg"
          className="absolute inset-0 h-full w-full cursor-pointer overflow-hidden"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Animated DNA double helix with multiple gene highlights"
          onClick={handleSvgClick}
        >
        <title>DNA double helix — gene simulator</title>
        <defs>
          <radialGradient id="bg-gradient" cx="35%" cy="46%" r="85%">
            <stop offset="0%" stopColor="#1c1547" />
            <stop offset="45%" stopColor="#0d0a26" />
            <stop offset="100%" stopColor="#030210" />
          </radialGradient>
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2" result="blur" id="glow-blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="nucleolus-filter" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="30" id="nucleolus-blur" />
          </filter>
          <filter id="particle-blur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
          <filter id="gene-glow-filter" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="14" id="gene-glow-blur" />
          </filter>
          <filter id="gene-rung-glow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="2.5" result="blur" id="gene-rung-glow-blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#bg-gradient)" />
        <ellipse
          ref={nucleolusRef}
          id="nucleolus"
          cx="86%"
          cy="28%"
          rx="150"
          ry="110"
          fill="#241b5e"
          opacity="0.32"
          filter="url(#nucleolus-filter)"
        />
        <g ref={particleRootRef} id="particle-root" filter="url(#particle-blur)"></g>
        <g ref={dnaRootRef} id="dna-root"></g>
        </svg>
      </motion.div>

      </div>

      {showChromosome && (
        <ChromosomeView
          geneColor={geneColor}
          selectedGeneId={selectedGeneId}
          onGeneClick={onGeneClick}
        />
      )}
    </div>
  );
}
