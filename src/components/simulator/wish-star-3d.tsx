"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

// Color configs for each rarity
const STAR_COLORS = {
  3: { primary: "#60a5fa", glow: "#3b82f6", bg: "#1e3a5f" },
  4: { primary: "#a855f7", glow: "#7c3aed", bg: "#3b1f5e" },
  5: { primary: "#fbbf24", glow: "#f59e0b", bg: "#5f3a1e" },
} as const;

interface WishStar3DProps {
  rarity: 3 | 4 | 5;
  phase: "entering" | "revealed" | "idle";
}

function BlueStar() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.8;
      meshRef.current.rotation.x += delta * 0.3;
    }
  });

  return (
    <Float speed={2} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color={STAR_COLORS[3].primary}
          emissive={STAR_COLORS[3].glow}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      <pointLight color={STAR_COLORS[3].glow} intensity={2} distance={5} />
    </Float>
  );
}

function PurpleStar() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 1.2;
      meshRef.current.rotation.z += delta * 0.4;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 2;
    }
  });

  const ringParticles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      return [Math.cos(angle) * 1.4, Math.sin(angle) * 1.4, 0] as [number, number, number];
    });
  }, []);

  return (
    <Float speed={3} floatIntensity={0.8}>
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial
          color={STAR_COLORS[4].primary}
          emissive={STAR_COLORS[4].glow}
          emissiveIntensity={0.8}
          roughness={0.15}
          metalness={0.9}
        />
      </mesh>
      <group ref={ringRef}>
        {ringParticles.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial
              color={STAR_COLORS[4].primary}
              emissive={STAR_COLORS[4].glow}
              emissiveIntensity={1}
            />
          </mesh>
        ))}
      </group>
      <pointLight color={STAR_COLORS[4].glow} intensity={4} distance={8} />
    </Float>
  );
}

function GoldenStar() {
  const meshRef = useRef<THREE.Mesh>(null);
  const raysRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 1.5;
      meshRef.current.rotation.x += delta * 0.5;
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
    if (raysRef.current) {
      raysRef.current.rotation.y -= delta * 0.8;
    }
  });

  const rays = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      return { angle, length: 2.5 + Math.random() * 1 };
    });
  }, []);

  return (
    <>
      <Float speed={4} floatIntensity={1}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={STAR_COLORS[5].primary}
            emissive={STAR_COLORS[5].glow}
            emissiveIntensity={1.2}
            roughness={0.1}
            metalness={1}
          />
        </mesh>
      </Float>

      {/* Light rays */}
      <group ref={raysRef}>
        {rays.map((ray, i) => (
          <mesh
            key={i}
            position={[
              Math.cos(ray.angle) * 0.5,
              Math.sin(ray.angle) * 0.5,
              0,
            ]}
            rotation={[0, 0, ray.angle]}
          >
            <planeGeometry args={[ray.length, 0.08]} />
            <meshBasicMaterial
              color={STAR_COLORS[5].primary}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      <pointLight color={STAR_COLORS[5].glow} intensity={8} distance={12} />
      <pointLight color="#fff" intensity={2} distance={4} />
    </>
  );
}

function StarScene({ rarity }: { rarity: 3 | 4 | 5 }) {
  const colors = STAR_COLORS[rarity];

  return (
    <>
      <ambientLight intensity={0.1} />
      <Stars
        radius={20}
        depth={30}
        count={rarity === 5 ? 1500 : rarity === 4 ? 800 : 300}
        factor={rarity === 5 ? 6 : 3}
        saturation={0}
        fade
        speed={rarity === 5 ? 3 : 1}
      />
      <fog attach="fog" args={[colors.bg, 5, 20]} />

      {rarity === 3 && <BlueStar />}
      {rarity === 4 && <PurpleStar />}
      {rarity === 5 && <GoldenStar />}
    </>
  );
}

export function WishStar3D({ rarity, phase }: WishStar3DProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: phase === "entering" ? 1 : phase === "revealed" ? 0.3 : 0,
        transition: "opacity 0.5s ease-out",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <StarScene rarity={rarity} />
      </Canvas>
    </div>
  );
}
