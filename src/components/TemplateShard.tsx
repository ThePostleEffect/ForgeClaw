import { useRef, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";
import type { AgentTemplate } from "../lib/templates";

interface TemplateShardProps {
  template: AgentTemplate;
  index: number;
  total: number;
  orbitRadius?: number;
  onSelect: (template: AgentTemplate) => void;
}

const statusColorMap: Record<string, [number, number, number]> = {
  ready: [0.3, 0.9, 0.5],
  installing: [0.3, 0.5, 1.0],
  installed: [0.2, 0.8, 0.4],
  locked: [0.4, 0.4, 0.5],
};

export default function TemplateShard({
  template,
  index,
  total,
  orbitRadius = 3.8,
  onSelect,
}: TemplateShardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Distribute evenly around a circle, with slight vertical variation
  const angle = (index / total) * Math.PI * 2;
  const yOffset = Math.sin(index * 1.7) * 0.4;

  const statusColor = statusColorMap[template.status] ?? statusColorMap.ready;
  const baseColor = new THREE.Color(...template.color);
  const emissiveColor = new THREE.Color(...statusColor);

  const handleClick = useCallback(
    (e: THREE.Event) => {
      (e as unknown as { stopPropagation: () => void }).stopPropagation();
      onSelect(template);
    },
    [template, onSelect],
  );

  const handlePointerOver = useCallback(
    (e: THREE.Event) => {
      (e as unknown as { stopPropagation: () => void }).stopPropagation();
      setHovered(true);
      document.body.style.cursor = "pointer";
    },
    [],
  );

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = "auto";
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    const t = state.clock.elapsedTime;
    // Orbit: rotate around Y axis at varying speeds
    const speed = 0.08 + index * 0.005;
    const currentAngle = angle + t * speed;

    groupRef.current.position.x = Math.cos(currentAngle) * orbitRadius;
    groupRef.current.position.z = Math.sin(currentAngle) * orbitRadius;
    groupRef.current.position.y = yOffset + Math.sin(t * 0.5 + index) * 0.15;

    // Self-rotation
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.3 + index;
      meshRef.current.rotation.z = t * 0.2;
    }
  });

  // Scale based on hover
  const scale = hovered ? 1.35 : 1.0;

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.2}>
        <mesh
          ref={meshRef}
          scale={scale}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={emissiveColor}
            emissiveIntensity={hovered ? 2.5 : 1.2}
            roughness={0.15}
            metalness={0.9}
            transparent
            opacity={0.92}
          />
        </mesh>

        {/* Wireframe overlay for crystalline look */}
        <mesh scale={scale * 1.05}>
          <octahedronGeometry args={[0.22, 0]} />
          <meshBasicMaterial
            color={emissiveColor}
            wireframe
            transparent
            opacity={hovered ? 0.6 : 0.2}
          />
        </mesh>

        {/* Tooltip on hover */}
        {hovered && (
          <Html
            center
            distanceFactor={8}
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                background: "rgba(10, 10, 20, 0.9)",
                border: "1px solid rgba(108, 92, 231, 0.5)",
                borderRadius: 6,
                padding: "6px 12px",
                whiteSpace: "nowrap",
                color: "#e8e8f0",
                fontSize: 12,
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                backdropFilter: "blur(8px)",
                boxShadow: "0 0 20px rgba(108, 92, 231, 0.3)",
              }}
            >
              <strong>{template.name}</strong>
              {template.isBonus && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 10,
                    color: "#ffa502",
                  }}
                >
                  BONUS
                </span>
              )}
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
}
