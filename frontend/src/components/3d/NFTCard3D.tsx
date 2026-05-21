/**
 * NFTCard3D — Interactive 3D holographic NFT card with mouse-tracking tilt.
 */
import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function HoloCard({ hovered }: { hovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const targetRotX = useRef(0);
  const targetRotY = useRef(0);

  useFrame(({ pointer, clock }) => {
    if (!meshRef.current || !glowRef.current) return;
    const t = clock.getElapsedTime();

    if (hovered) {
      targetRotX.current = -pointer.y * 0.4;
      targetRotY.current = pointer.x * 0.4;
    } else {
      targetRotX.current = Math.sin(t * 0.5) * 0.08;
      targetRotY.current = Math.cos(t * 0.3) * 0.12;
    }

    meshRef.current.rotation.x += (targetRotX.current - meshRef.current.rotation.x) * 0.08;
    meshRef.current.rotation.y += (targetRotY.current - meshRef.current.rotation.y) * 0.08;
    glowRef.current.rotation.x = meshRef.current.rotation.x;
    glowRef.current.rotation.y = meshRef.current.rotation.y;

    // Shimmer emissive pulse
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.3 + Math.sin(t * 2) * 0.15;
  });

  return (
    <group>
      {/* Glow backplane */}
      <mesh ref={glowRef} position={[0, 0, -0.15]}>
        <planeGeometry args={[2.4, 3.4]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.06} />
      </mesh>

      {/* Main card body */}
      <Float speed={1.2} rotationIntensity={0} floatIntensity={0.3}>
        <RoundedBox ref={meshRef} args={[2.1, 3.0, 0.06]} radius={0.12} smoothness={4}>
          <meshStandardMaterial
            color="#0f172a"
            emissive="#1d4ed8"
            emissiveIntensity={0.3}
            metalness={0.9}
            roughness={0.15}
            envMapIntensity={1}
          />
        </RoundedBox>

        {/* Shield badge */}
        <mesh position={[0, 0.55, 0.04]}>
          <icosahedronGeometry args={[0.38, 1]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#60a5fa"
            emissiveIntensity={0.8}
            metalness={1}
            roughness={0}
          />
        </mesh>

        {/* Bottom accent bar */}
        <mesh position={[0, -1.1, 0.04]}>
          <boxGeometry args={[1.6, 0.07, 0.01]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1.5} />
        </mesh>

        {/* Corner dots */}
        {[[-0.8, 1.1], [0.8, 1.1], [-0.8, -1.1], [0.8, -1.1]].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.04]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={2} />
          </mesh>
        ))}

        {/* Distort sphere overlay */}
        <mesh position={[0, 0.55, 0.08]} scale={0.28}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial
            color="#60a5fa"
            emissive="#3b82f6"
            emissiveIntensity={0.5}
            distort={0.4}
            speed={2}
            transparent
            opacity={0.5}
          />
        </mesh>
      </Float>
    </group>
  );
}

export default function NFTCard3D({ className = '' }: { className?: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`cursor-pointer ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={2} color="#3b82f6" />
        <pointLight position={[-3, -2, 2]} intensity={1} color="#8b5cf6" />
        <spotLight position={[0, 5, 5]} intensity={1.5} color="#ffffff" angle={0.4} penumbra={0.8} />
        <HoloCard hovered={hovered} />
      </Canvas>
    </div>
  );
}
