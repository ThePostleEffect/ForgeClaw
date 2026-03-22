import { Suspense, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import CentralOrb from "./CentralOrb";
import TemplateShard from "./TemplateShard";
import Starfield from "./Starfield";
import OrbRipple from "./OrbRipple";
import type { AgentTemplate } from "../lib/templates";

interface SoulChamberProps {
  templates: AgentTemplate[];
  onSelectTemplate: (template: AgentTemplate) => void;
}

function Scene({
  templates,
  onSelectTemplate,
  rippleTrigger,
  orbPulse,
}: {
  templates: AgentTemplate[];
  onSelectTemplate: (t: AgentTemplate) => void;
  rippleTrigger: number;
  orbPulse: number;
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#6c5ce7" />
      <pointLight position={[5, 3, 5]} intensity={0.4} color="#1e90ff" />
      <pointLight position={[-5, -2, -5]} intensity={0.3} color="#9b59b6" />

      {/* Central Orb */}
      <CentralOrb pulse={orbPulse} />
      <OrbRipple trigger={rippleTrigger} />

      {/* Orbiting template shards */}
      {templates.map((template, i) => (
        <TemplateShard
          key={template.id}
          template={template}
          index={i}
          total={templates.length}
          onSelect={onSelectTemplate}
        />
      ))}

      {/* Starfield background */}
      <Starfield count={2500} />

      {/* Camera controls — limited zoom, smooth damping */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={4}
        maxDistance={12}
        autoRotate
        autoRotateSpeed={0.3}
        dampingFactor={0.05}
        enableDamping
      />

      {/* Postprocessing */}
      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
      </EffectComposer>
    </>
  );
}

export default function SoulChamber({ templates, onSelectTemplate }: SoulChamberProps) {
  const [rippleTrigger, setRippleTrigger] = useState(0);
  const [orbPulse, setOrbPulse] = useState(0);

  const handleSelect = useCallback(
    (template: AgentTemplate) => {
      // Trigger ripple + pulse on shard click
      setRippleTrigger(Date.now());
      setOrbPulse(1);
      setTimeout(() => setOrbPulse(0), 300);
      onSelectTemplate(template);
    },
    [onSelectTemplate],
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#020208",
      }}
    >
      <Canvas
        camera={{ position: [0, 2, 7], fov: 50 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene
            templates={templates}
            onSelectTemplate={handleSelect}
            rippleTrigger={rippleTrigger}
            orbPulse={orbPulse}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
