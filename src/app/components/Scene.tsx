'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField({ count = 3000, scanning = false }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 8 + Math.random() * 12;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += scanning ? 0.008 : 0.001;
      ref.current.rotation.x += scanning ? 0.002 : 0.0005;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color={scanning ? '#00ff41' : '#00f0ff'}
        size={0.03}
        sizeAttenuation
        depthWrite={false}
        opacity={scanning ? 0.8 : 0.4}
      />
    </Points>
  );
}

function HoloSphere({ scanning = false }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += scanning ? 0.02 : 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y -= scanning ? 0.015 : 0.003;
      wireRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group>
      {/* Inner distorted sphere */}
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color={scanning ? '#00ff41' : '#00f0ff'}
          transparent
          opacity={0.15}
          distort={scanning ? 0.4 : 0.2}
          speed={scanning ? 4 : 2}
          wireframe
        />
      </Sphere>

      {/* Outer wireframe sphere */}
      <Sphere ref={wireRef} args={[2, 32, 32]}>
        <meshBasicMaterial
          color={scanning ? '#00ff41' : '#0088aa'}
          transparent
          opacity={0.1}
          wireframe
        />
      </Sphere>

      {/* Scanning ring */}
      {scanning && <ScanRing />}
    </group>
  );
}

function ScanRing() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2;
      ringRef.current.rotation.z = state.clock.elapsedTime * 2;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      ringRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[2.5, 0.02, 16, 100]} />
      <meshBasicMaterial color="#00ff41" transparent opacity={0.8} />
    </mesh>
  );
}

function DataStreams({ scanning = false }) {
  const count = 50;
  const streamsRef = useRef<THREE.Group>(null);

  const streams = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
      offset: Math.random() * Math.PI * 2,
      length: 0.5 + Math.random() * 1.5,
    }));
  }, []);

  useFrame((state) => {
    if (streamsRef.current && scanning) {
      streamsRef.current.rotation.y += 0.01;
    }
  });

  if (!scanning) return null;

  return (
    <group ref={streamsRef}>
      {streams.map((stream, i) => (
        <DataStream key={i} {...stream} />
      ))}
    </group>
  );
}

function DataStream({ angle, speed, offset, length }: { angle: number; speed: number; offset: number; length: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      const t = ((state.clock.elapsedTime * speed + offset) % 4) - 2;
      const radius = 3 + t;
      ref.current.position.x = Math.cos(angle) * radius;
      ref.current.position.z = Math.sin(angle) * radius;
      ref.current.position.y = (Math.sin(state.clock.elapsedTime * 2 + offset) * 0.5);
      ref.current.lookAt(0, 0, 0);
    }
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.02, 0.02, length]} />
      <meshBasicMaterial color="#00ff41" transparent opacity={0.6} />
    </mesh>
  );
}

function GridFloor() {
  return (
    <gridHelper
      args={[40, 40, '#0a2a2a', '#0a1a1a']}
      position={[0, -4, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

export default function Scene({ scanning = false }: { scanning: boolean }) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        <ParticleField scanning={scanning} />
        <HoloSphere scanning={scanning} />
        <DataStreams scanning={scanning} />
        <GridFloor />

        {/* Subtle fog for depth */}
        <fog attach="fog" args={['#050508', 5, 25]} />
      </Canvas>
    </div>
  );
}
