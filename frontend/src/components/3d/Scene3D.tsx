/**
 * Scene3D — Immersive holographic neural sphere background.
 *
 * 3,000 particles distributed on a spherical shell that:
 *  • Auto-rotates slowly
 *  • Tilts toward the mouse cursor with smooth damping
 *  • Dives the camera from z=28 → z=4 based on scroll position (landing page)
 *
 * Uses additive blending for a luminous cyan/blue glow.
 */
import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

/* ── Scroll-driven camera ────────────────────────────────────────────── */

function ScrollCamera() {
  const { camera } = useThree();
  const scrollRef = useRef(0);
  const targetZ = useRef(28);

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useFrame(() => {
    // Map scroll 0..800px → camera z 28..4
    const maxScroll = 800;
    const progress = Math.min(scrollRef.current / maxScroll, 1);
    targetZ.current = 28 - progress * 24; // 28 → 4
    camera.position.z += (targetZ.current - camera.position.z) * 0.06;
  });

  return null;
}

/* ── Neural Particle Sphere ──────────────────────────────────────────── */

function NeuralSphere({ count = 3000 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Generate spherical point cloud
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const radius = 12;

    for (let i = 0; i < count; i++) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      // Slight depth variation for organic feel
      const r = radius * (0.92 + Math.random() * 0.16);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      sizes[i] = 0.03 + Math.random() * 0.06;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
    return geo;
  }, [count]);

  // Track mouse for interactive tilt
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const mesh = pointsRef.current;

    // Slow auto-rotation
    mesh.rotation.y += 0.0015;
    mesh.rotation.x += 0.0008;

    // Mouse-driven tilt with smooth damping
    const targetRotY = mouseRef.current.x * 0.3;
    const targetRotX = mouseRef.current.y * 0.2;
    mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.02;
    mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.02;

    // Subtle breathing scale
    const breathe = 1 + Math.sin(t * 0.4) * 0.02;
    mesh.scale.setScalar(breathe);
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.06}
        color="#adc6ff"
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Inner Wireframe Sphere (subtle structure) ───────────────────────── */

function WireframeSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.08;
    meshRef.current.rotation.x = clock.getElapsedTime() * 0.05;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[9, 2]} />
      <meshBasicMaterial
        color="#1d4ed8"
        wireframe
        transparent
        opacity={0.04}
      />
    </mesh>
  );
}

/* ── Ambient Fog Planes ──────────────────────────────────────────────── */

function FogPlanes() {
  return (
    <group>
      {/* Soft cyan radial glow behind the sphere */}
      <mesh position={[0, 0, -15]}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial
          color="#2fd9f4"
          transparent
          opacity={0.015}
        />
      </mesh>
      {/* Warm blue glow offset */}
      <mesh position={[-8, 5, -20]}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial
          color="#adc6ff"
          transparent
          opacity={0.01}
        />
      </mesh>
    </group>
  );
}

/* ── Main Scene Export ───────────────────────────────────────────────── */

export default function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 28], fov: 65 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.15} />
        <pointLight position={[10, 10, 10]} intensity={0.4} color="#3b82f6" />
        <pointLight position={[-10, -8, 5]} intensity={0.25} color="#8b5cf6" />

        <Stars
          radius={80}
          depth={40}
          count={600}
          factor={1.8}
          saturation={0}
          fade
          speed={0.3}
        />

        <NeuralSphere count={3000} />
        <WireframeSphere />
        <FogPlanes />
        <ScrollCamera />
      </Canvas>
    </div>
  );
}
