/**
 * GasFlowViz — 3D animated gas flow visualization.
 * Particles flow from wallet → UGF relayer → blockchain.
 */
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

interface FlowParticle {
  progress: number;
  speed: number;
  offset: number;
}

function GasParticles({ count = 30 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo<FlowParticle[]>(() =>
    Array.from({ length: count }, () => ({
      progress: Math.random(),
      speed: 0.003 + Math.random() * 0.004,
      offset: (Math.random() - 0.5) * 0.3,
    })),
  [count]);

  // Bezier path: wallet (-3,0) → relay (0, 1.5) → chain (3, 0)
  const getPointOnPath = (t: number, offset: number): [number, number, number] => {
    const p0 = new THREE.Vector3(-3, 0, 0);
    const p1 = new THREE.Vector3(-1, 1.5, 0);
    const p2 = new THREE.Vector3(1, 1.5, 0);
    const p3 = new THREE.Vector3(3, 0, 0);
    const curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
    const pt = curve.getPoint(t);
    return [pt.x, pt.y + offset, pt.z];
  };

  const posArray = useMemo(() => new Float32Array(count * 3), [count]);

  const ptGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(posArray, 3));
    return geo;
  }, [posArray]);

  useFrame(() => {
    for (let i = 0; i < count; i++) {
      particles[i].progress += particles[i].speed;
      if (particles[i].progress > 1) particles[i].progress = 0;
      const [x, y, z] = getPointOnPath(particles[i].progress, particles[i].offset);
      posArray[i * 3] = x;
      posArray[i * 3 + 1] = y;
      posArray[i * 3 + 2] = z;
    }
    if (pointsRef.current) {
      const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      attr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <primitive object={ptGeo} />
      <pointsMaterial size={0.09} color="#22d3ee" transparent opacity={0.9} sizeAttenuation />
    </points>
  );
}

function Node({ position, label, color }: { position: [number, number, number]; label: string; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
    }
  });

  return (
    <Float speed={1.5} floatIntensity={0.2} rotationIntensity={0}>
      <group position={position}>
        <mesh ref={meshRef}>
          <octahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} metalness={0.8} roughness={0.1} />
        </mesh>
        <Text
          position={[0, -0.6, 0]}
          fontSize={0.22}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
        >
          {label}
        </Text>
      </group>
    </Float>
  );
}

function FlowPath() {
  const points = useMemo(() => {
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-3, 0, 0),
      new THREE.Vector3(-1, 1.5, 0),
      new THREE.Vector3(1, 1.5, 0),
      new THREE.Vector3(3, 0, 0)
    );
    return curve.getPoints(60);
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  return (
    <line>
      <primitive object={geometry} />
      <lineBasicMaterial color="#1e40af" transparent opacity={0.3} />
    </line>
  );
}

export default function GasFlowViz({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full h-40 ${className}`}>
      <Canvas camera={{ position: [0, 0.5, 6], fov: 55 }} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 3, 3]} intensity={1.5} color="#22d3ee" />

        <Node position={[-3, 0, 0]} label="Wallet" color="#3b82f6" />
        <Node position={[0, 1.5, 0]} label="UGF Relayer" color="#8b5cf6" />
        <Node position={[3, 0, 0]} label="Chain" color="#22d3ee" />

        <FlowPath />
        <GasParticles count={35} />
      </Canvas>
    </div>
  );
}
