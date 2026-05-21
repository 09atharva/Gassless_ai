/**
 * Scene3D — Persistent Three.js background canvas.
 */
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField({ count = 100 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null);
  const lineRef = useRef<THREE.LineSegments>(null);

  const { positions, linePositions } = useMemo(() => {
    const pts: number[] = [];
    const linePts: number[] = [];
    const nodes: [number, number, number][] = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 15;
      pts.push(x, y, z);
      nodes.push([x, y, z]);
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i][0] - nodes[j][0];
        const dy = nodes[i][1] - nodes[j][1];
        const dz = nodes[i][2] - nodes[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 5.5) {
          linePts.push(...nodes[i], ...nodes[j]);
        }
      }
    }

    return {
      positions: new Float32Array(pts),
      linePositions: new Float32Array(linePts),
    };
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.04;
      meshRef.current.rotation.x = Math.sin(t * 0.02) * 0.1;
    }
    if (lineRef.current) {
      lineRef.current.rotation.y = t * 0.04;
      lineRef.current.rotation.x = Math.sin(t * 0.02) * 0.1;
    }
  });

  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    return geo;
  }, [linePositions]);

  const ptGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <group>
      <lineSegments ref={lineRef}>
        <primitive object={lineGeo} />
        <lineBasicMaterial color="#1d4ed8" transparent opacity={0.15} />
      </lineSegments>
      <points ref={meshRef}>
        <primitive object={ptGeo} />
        <pointsMaterial size={0.12} color="#3b82f6" transparent opacity={0.7} sizeAttenuation />
      </points>
    </group>
  );
}

function FloatingOrbs() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.children.forEach((child, i) => {
        child.position.y = Math.sin(t * 0.5 + i * 1.2) * 0.4 + (child.userData.baseY as number ?? 0);
        child.rotation.y = t * 0.3 + i;
        child.rotation.x = t * 0.2 + i * 0.5;
      });
    }
  });

  const orbs = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 10,
      z: -5 - Math.random() * 8,
      scale: 0.15 + Math.random() * 0.25,
      color: i % 2 === 0 ? '#3b82f6' : '#8b5cf6',
    })),
  []);

  return (
    <group ref={group}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={[orb.x, orb.y, orb.z]} userData={{ baseY: orb.y }} scale={orb.scale}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={orb.color} emissive={orb.color} emissiveIntensity={0.4} wireframe transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export default function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#3b82f6" />
        <pointLight position={[-10, -10, 5]} intensity={0.3} color="#8b5cf6" />
        <Stars radius={60} depth={30} count={800} factor={2} saturation={0} fade speed={0.4} />
        <ParticleField count={100} />
        <FloatingOrbs />
      </Canvas>
    </div>
  );
}
