"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

// Color configs for each rarity
const STAR_COLORS = {
  3: { primary: "#60a5fa", glow: "#3b82f6", bg: "#0a1628" },
  4: { primary: "#a855f7", glow: "#7c3aed", bg: "#1a0f2e" },
  5: { primary: "#fbbf24", glow: "#f59e0b", bg: "#1a140a" },
} as const;

interface WishStar3DProps {
  rarity: 3 | 4 | 5;
  phase: "entering" | "revealed" | "idle";
}

// ── 4-pointed Genshin star shape ──────────────────────────────────────
// Creates the iconic elongated 4-pointed star from Genshin wishes.
// The shape has 4 long spikes with concave edges between them.

function createStarGeometry(
  outerRadius: number,
  innerRadius: number,
  thickness: number,
  points: number = 4,
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const totalPoints = points * 2;

  for (let i = 0; i <= totalPoints; i++) {
    const angle = (i / totalPoints) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }

  return new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.3,
    bevelSize: thickness * 0.2,
    bevelSegments: 3,
  });
}

// ── 3-Star: Blue star ─────────────────────────────────────────────────

function BlueStar() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(
    () => createStarGeometry(0.7, 0.18, 0.08),
    [],
  );

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 1.2;
      meshRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <Float speed={2} floatIntensity={0.3}>
      <mesh ref={meshRef} geometry={geometry} position={[0, 0, -0.04]}>
        <meshStandardMaterial
          color={STAR_COLORS[3].primary}
          emissive={STAR_COLORS[3].glow}
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.9}
          transparent
          opacity={0.95}
        />
      </mesh>
      <pointLight color={STAR_COLORS[3].glow} intensity={3} distance={6} />
    </Float>
  );
}

// ── 4-Star: Purple star with orbiting particles ───────────────────────

function PurpleStar() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const geometry = useMemo(
    () => createStarGeometry(0.9, 0.2, 0.1),
    [],
  );

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 1.6;
      meshRef.current.rotation.y += delta * 0.5;
    }
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.15 + 1;
      glowRef.current.scale.setScalar(pulse);
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.z -= delta * 1.5;
    }
  });

  const ringParticles = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2;
      return {
        pos: [Math.cos(angle) * 1.6, Math.sin(angle) * 1.6, 0] as [number, number, number],
        size: 0.03 + Math.random() * 0.03,
      };
    });
  }, []);

  return (
    <Float speed={3} floatIntensity={0.5}>
      <mesh ref={meshRef} geometry={geometry} position={[0, 0, -0.05]}>
        <meshStandardMaterial
          color={STAR_COLORS[4].primary}
          emissive={STAR_COLORS[4].glow}
          emissiveIntensity={1}
          roughness={0.15}
          metalness={0.95}
          transparent
          opacity={0.95}
        />
      </mesh>
      {/* Soft inner glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial
          color={STAR_COLORS[4].primary}
          transparent
          opacity={0.15}
        />
      </mesh>
      {/* Orbiting particles */}
      <group ref={ringsRef}>
        {ringParticles.map((p, i) => (
          <mesh key={i} position={p.pos}>
            <sphereGeometry args={[p.size, 8, 8]} />
            <meshStandardMaterial
              color={STAR_COLORS[4].primary}
              emissive={STAR_COLORS[4].glow}
              emissiveIntensity={1.5}
            />
          </mesh>
        ))}
      </group>
      <pointLight color={STAR_COLORS[4].glow} intensity={5} distance={10} />
    </Float>
  );
}

// ── 5-Star: Golden star with rays, pulse, and dramatic lighting ───────

function GoldenStar() {
  const meshRef = useRef<THREE.Mesh>(null);
  const raysRef = useRef<THREE.Group>(null);
  const innerGlowRef = useRef<THREE.Mesh>(null);
  const outerGlowRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(
    () => createStarGeometry(1.1, 0.22, 0.12),
    [],
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 2;
      meshRef.current.rotation.y += delta * 0.6;
      const pulse = Math.sin(t * 3) * 0.08 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
    if (raysRef.current) {
      raysRef.current.rotation.z -= delta * 0.5;
    }
    if (innerGlowRef.current) {
      const glow = Math.sin(t * 2) * 0.1 + 0.3;
      (innerGlowRef.current.material as THREE.MeshBasicMaterial).opacity = glow;
    }
    if (outerGlowRef.current) {
      const glow = Math.sin(t * 1.5 + 1) * 0.05 + 0.1;
      (outerGlowRef.current.material as THREE.MeshBasicMaterial).opacity = glow;
    }
  });

  // Light rays - long thin planes radiating outward
  const rays = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const length = 1.8 + (i % 2 === 0 ? 1.2 : 0.6);
      const width = i % 2 === 0 ? 0.06 : 0.03;
      return { angle, length, width };
    });
  }, []);

  return (
    <>
      <Float speed={4} floatIntensity={0.6}>
        {/* Main star body */}
        <mesh ref={meshRef} geometry={geometry} position={[0, 0, -0.06]}>
          <meshStandardMaterial
            color={STAR_COLORS[5].primary}
            emissive={STAR_COLORS[5].glow}
            emissiveIntensity={1.5}
            roughness={0.08}
            metalness={1}
            transparent
            opacity={0.95}
          />
        </mesh>

        {/* Inner bright glow */}
        <mesh ref={innerGlowRef}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial
            color="#fff5d4"
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Outer soft glow */}
        <mesh ref={outerGlowRef}>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshBasicMaterial
            color={STAR_COLORS[5].primary}
            transparent
            opacity={0.1}
          />
        </mesh>
      </Float>

      {/* Radiating light rays */}
      <group ref={raysRef}>
        {rays.map((ray, i) => (
          <mesh
            key={i}
            position={[
              Math.cos(ray.angle) * (ray.length / 2 + 0.3),
              Math.sin(ray.angle) * (ray.length / 2 + 0.3),
              0,
            ]}
            rotation={[0, 0, ray.angle]}
          >
            <planeGeometry args={[ray.length, ray.width]} />
            <meshBasicMaterial
              color={STAR_COLORS[5].primary}
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      <pointLight color={STAR_COLORS[5].glow} intensity={10} distance={15} />
      <pointLight color="#fff5d4" intensity={3} distance={5} />
    </>
  );
}

// ── Scene wrapper ─────────────────────────────────────────────────────

function StarScene({ rarity }: { rarity: 3 | 4 | 5 }) {
  const colors = STAR_COLORS[rarity];

  return (
    <>
      <ambientLight intensity={0.05} />
      <Stars
        radius={25}
        depth={40}
        count={rarity === 5 ? 2000 : rarity === 4 ? 1000 : 400}
        factor={rarity === 5 ? 5 : 3}
        saturation={0}
        fade
        speed={rarity === 5 ? 3 : 1}
      />
      <fog attach="fog" args={[colors.bg, 5, 25]} />

      {rarity === 3 && <BlueStar />}
      {rarity === 4 && <PurpleStar />}
      {rarity === 5 && <GoldenStar />}
    </>
  );
}

// ── Exported component ────────────────────────────────────────────────

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
