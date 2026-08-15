import { useState } from 'react';
import DnaPanel from '@/components/DnaPanel';
import ControlsPanel from '@/components/ControlsPanel';
import { DEFAULT_COLOR, PRESETS } from '@/lib/dnaEngine';

export type FlowerSize = 'small' | 'medium' | 'large';
export type PetalShape = 'rounded' | 'narrow' | 'wavy';
export type PigmentIntensity = 'pale' | 'medium' | 'deep';

function App() {
  const [geneColor, setGeneColor] = useState(DEFAULT_COLOR);
  const [randomSeed, setRandomSeed] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Multi-gene state (new)
  const [selectedGeneId, setSelectedGeneId] = useState(0);
  const [flowerSize, setFlowerSize] = useState<FlowerSize>('large');
  const [petalShape, setPetalShape] = useState<PetalShape>('rounded');
  const [pigmentIntensity, setPigmentIntensity] = useState<PigmentIntensity>('deep');

  const handleRandom = () => {
    const randomPreset = PRESETS[Math.floor(Math.random() * PRESETS.length)].hex;
    setGeneColor(randomPreset);
    setRandomSeed(prev => prev + 1);
  };

  const handleReset = () => {
    setGeneColor(DEFAULT_COLOR);
    setFlowerSize('large');
    setPetalShape('rounded');
    setPigmentIntensity('deep');
    setSelectedGeneId(0);
    setIsSimulating(false);
  };

  return (
    <div id="app" className="phyto-app w-full h-[100dvh] flex flex-col md:flex-row bg-[#03020a] overflow-hidden text-[#d9d3f7]">
      <DnaPanel 
        geneColor={geneColor} 
        randomSeed={randomSeed}
        selectedGeneId={selectedGeneId}
        onGeneClick={setSelectedGeneId}
      />
      <ControlsPanel 
        geneColor={geneColor}
        onChangeColor={setGeneColor}
        onRandom={handleRandom}
        onReset={handleReset}
        isSimulating={isSimulating}
        onSimulateToggle={setIsSimulating}
        selectedGeneId={selectedGeneId}
        onSelectGene={setSelectedGeneId}
        flowerSize={flowerSize}
        onSizeChange={setFlowerSize}
        petalShape={petalShape}
        onShapeChange={setPetalShape}
        pigmentIntensity={pigmentIntensity}
        onIntensityChange={setPigmentIntensity}
      />
    </div>
  );
}

export default App;
