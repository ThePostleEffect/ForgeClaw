import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Expanding ring ripple effect emanating from the orb on interactions.
 * Triggered by passing a new `trigger` timestamp.
 */
interface OrbRippleProps {
  trigger: number; // timestamp of last trigger
}

export default function OrbRipple({ trigger }: OrbRippleProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(0);
  const active = useRef(false);

  useFrame((state) => {
    if (!ringRef.current) return;

    // Detect new trigger
    if (trigger > startTime.current) {
      startTime.current = trigger;
      active.current = true;
    }

    if (!active.current) {
      ringRef.current.visible = false;
      return;
    }

    const elapsed = state.clock.elapsedTime - (trigger / 1000 - state.clock.elapsedTime);
    const age = (Date.now() - trigger) / 1000;
    const duration = 1.5;

    if (age > duration) {
      active.current = false;
      ringRef.current.visible = false;
      return;
    }

    const progress = age / duration;
    const scale = 1.6 + progress * 4;
    ringRef.current.visible = true;
    ringRef.current.scale.set(scale, scale, scale);
    ringRef.current.rotation.x = Math.PI / 2;

    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = (1 - progress) * 0.5;
    void elapsed; // used for sync reference
  });

  return (
    <mesh ref={ringRef} visible={false}>
      <ringGeometry args={[0.95, 1.0, 64]} />
      <meshBasicMaterial
        color="#6c5ce7"
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
