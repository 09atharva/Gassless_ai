/**
 * AIOrb3D — Animated 3D glowing orb for the AI Assistant page.
 */
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

function Orb({ isActive }: { isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial & { distort: number };
      mat.distort = isActive ? 0.5 + Math.sin(t * 3) * 0.15 : 0.25 + Math.sin(t) * 0.05;
      mat.emissiveIntensity = isActive ? 0.8 + Math.sin(t * 4) * 0.3 : 0.4 + Math.sin(t * 1.5) * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.8;
      ringRef.current.rotation.z = t * 0.5;
      (ringRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + Math.sin(t * 2) * 0.3;
    }
  });

  return (
    <Float speed={2} floatIntensity={0.5} rotationIntensity={0.2}>
      <group>
        {/* Outer ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[1.3, 0.04, 16, 80]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} metalness={1} roughness={0} />
        </mesh>

        {/* Second ring */}
        <mesh rotation={[-Math.PI / 3, Math.PI / 4, 0]}>
          <torusGeometry args={[1.1, 0.025, 16, 80]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} metalness={1} roughness={0} />
        </mesh>

        {/* Core orb */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[0.8, 64, 64]} />
          <MeshDistortMaterial
            color="#1e3a8a"
            emissive="#3b82f6"
            emissiveIntensity={0.6}
            metalness={0.5}
            roughness={0.2}
            distort={0.3}
            speed={2}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function AIOrb3D({ isActive = false, className = '' }: { isActive?: boolean; className?: string }) {
  return (
    <div className={`${className}`}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[2, 2, 2]} intensity={2} color="#3b82f6" />
        <pointLight position={[-2, -2, 1]} intensity={1} color="#8b5cf6" />
        <Orb isActive={isActive} />
      </Canvas>
    </div>
  );
}
