"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

// Mirrors the shield glyph in components/Logo.tsx (viewBox 0-24), re-centered
// on the origin and flipped from SVG's y-down space to y-up, then extruded.
const SHIELD_SHAPE = (() => {
  const shape = new THREE.Shape();
  shape.moveTo(0, 10);
  shape.lineTo(-8, 6.5);
  shape.lineTo(-8, 1);
  shape.bezierCurveTo(-8, -4.2, -4.6, -8.9, 0, -10);
  shape.bezierCurveTo(4.6, -8.9, 8, -4.2, 8, 1);
  shape.lineTo(8, 6.5);
  shape.closePath();
  return shape;
})();

const ORBS: { position: [number, number, number]; color: string; radius: number; speed: number }[] = [
  { position: [-2.3, 1, 0.6], color: "#22C55E", radius: 0.34, speed: 1.6 },
  { position: [2.1, -0.7, 1], color: "#F59E0B", radius: 0.28, speed: 1.2 },
  { position: [1.6, 1.5, -1.1], color: "#22C55E", radius: 0.24, speed: 1.9 },
  { position: [-1.8, -1.2, -0.7], color: "#F59E0B", radius: 0.3, speed: 1.4 },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}

function Shield({ spinning }: { spinning: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(SHIELD_SHAPE, {
      depth: 3,
      bevelEnabled: true,
      bevelThickness: 0.6,
      bevelSize: 0.6,
      bevelSegments: 2,
      curveSegments: 8,
    });
    geo.center();
    geo.scale(0.13, 0.13, 0.13);
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!spinning || !meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial color="#3B6DF5" emissive="#3B6DF5" emissiveIntensity={0.3} metalness={0.35} roughness={0.35} />
    </mesh>
  );
}

function Orb({ position, color, radius, speed, enabled }: (typeof ORBS)[number] & { enabled: boolean }) {
  return (
    <Float enabled={enabled} speed={speed} rotationIntensity={0.5} floatIntensity={1} floatingRange={[-0.25, 0.25]}>
      <group position={position}>
        {/* Cheap stand-in for bloom: a bigger, additively-blended, transparent
            twin behind the solid core reads as a soft glow with no postprocessing pass. */}
        <mesh scale={2}>
          <sphereGeometry args={[radius, 12, 12]} />
          <meshBasicMaterial color={color} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[radius, 1]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.25} metalness={0.1} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const reducedMotion = usePrefersReducedMotion();

  useFrame((state, delta) => {
    if (reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.15;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[4, 4, 4]} intensity={1.2} color="#3B6DF5" />
      <pointLight position={[-4, -2, -3]} intensity={0.6} color="#22C55E" />
      <group ref={groupRef}>
        <Shield spinning={!reducedMotion} />
        {ORBS.map((orb) => (
          <Orb key={orb.color + orb.position.join(",")} {...orb} enabled={!reducedMotion} />
        ))}
      </group>
    </>
  );
}

export function HeroAnimation() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 6.5], fov: 40 }}
    >
      <Scene />
    </Canvas>
  );
}
