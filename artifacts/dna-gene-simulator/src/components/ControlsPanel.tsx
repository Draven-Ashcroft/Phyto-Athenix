import { AnimatePresence } from 'framer-motion';
import GeneView from './GeneView';
import PollinationView from './PollinationView';
import type { FlowerSize, PetalShape, PigmentIntensity } from '../App';

interface ControlsPanelProps {
  geneColor: string;
  onChangeColor: (hex: string) => void;
  onRandom: () => void;
  onReset: () => void;
  isSimulating: boolean;
  onSimulateToggle: (simulate: boolean) => void;
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

export default function ControlsPanel({ 
  geneColor, onChangeColor, onRandom, onReset,
  isSimulating, onSimulateToggle,
  selectedGeneId, onSelectGene,
  flowerSize, onSizeChange,
  petalShape, onShapeChange,
  pigmentIntensity, onIntensityChange,
}: ControlsPanelProps) {
  return (
    <div className="phyto-controls-panel flex-1 h-full min-w-0 overflow-y-auto overflow-x-hidden border-t md:border-t-0 md:border-l border-[#bfe3ee1a] bg-gradient-to-b from-[#09071f] to-[#0c0924] p-[clamp(14px,2.5vh,28px)] sm:px-[clamp(14px,2.8vw,30px)] glass-panel-scroll relative">
      <AnimatePresence mode="wait">
        {!isSimulating ? (
          <GeneView 
            key="gene-view"
            geneColor={geneColor} 
            onChangeColor={onChangeColor} 
            onRandom={onRandom} 
            onReset={onReset}
            onSimulate={() => onSimulateToggle(true)}
            selectedGeneId={selectedGeneId}
            onSelectGene={onSelectGene}
            flowerSize={flowerSize}
            onSizeChange={onSizeChange}
            petalShape={petalShape}
            onShapeChange={onShapeChange}
            pigmentIntensity={pigmentIntensity}
            onIntensityChange={onIntensityChange}
          />
        ) : (
          <PollinationView 
            key="pollination-view"
            geneColor={geneColor} 
            onBack={() => onSimulateToggle(false)}
            selectedGeneId={selectedGeneId}
            onSelectGene={onSelectGene}
            flowerSize={flowerSize}
            petalShape={petalShape}
            pigmentIntensity={pigmentIntensity}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
