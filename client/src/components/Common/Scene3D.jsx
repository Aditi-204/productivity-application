import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Trail } from '@react-three/drei';
import * as THREE from 'three';

const MouseTracker = () => {
  const { pointer } = useThree();
  const target = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });

  useFrame(() => {
    smooth.current.x += (pointer.x * 0.3 - smooth.current.x) * 0.03;
    smooth.current.y += (-pointer.y * 0.3 - smooth.current.y) * 0.03;
  });

  return { smooth };
};

const CoreCrystal = () => {
  const mesh = useRef();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useFrame((state) => {
    if (mesh.current) {
      const t = state.clock.elapsedTime;
      mesh.current.rotation.x += (mouse.current.y * 0.3 + Math.sin(t * 0.1) * 0.1 - mesh.current.rotation.x) * 0.02;
      mesh.current.rotation.y += (mouse.current.x * 0.5 + Math.cos(t * 0.08) * 0.15 - mesh.current.rotation.y) * 0.02;
      mesh.current.position.y += (mouse.current.y * 0.2 + Math.sin(t * 0.15) * 0.15 - mesh.current.position.y) * 0.015;
      mesh.current.position.x += (mouse.current.x * 0.3 - mesh.current.position.x) * 0.015;
    }
  });

  return (
    <group ref={mesh}>
      <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh>
          <icosahedronGeometry args={[1.2, 1]} />
          <MeshDistortMaterial
            color="#C4B5FD"
            transparent
            opacity={0.2}
            roughness={0.1}
            metalness={0.9}
            envMapIntensity={2}
            distort={0.15}
            speed={2}
            wireframe
          />
        </mesh>
        <mesh scale={0.8}>
          <icosahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color="#A5F3FC"
            transparent
            opacity={0.15}
            roughness={0}
            metalness={1}
            envMapIntensity={1.5}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </Float>
    </group>
  );
};

const OrbitingRing = ({ radius = 2.5, color = '#C4B5FD', speed = 0.3, size = 0.03, count = 30 }) => {
  const ref = useRef();
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      arr.push({ angle, x: Math.cos(angle) * radius, z: Math.sin(angle) * radius });
    }
    return arr;
  }, [count, radius]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * speed;
    }
  });

  return (
    <group ref={ref}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, 0, p.z]}>
          <sphereGeometry args={[size, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

const FloatingShapes = () => {
  const group = useRef();
  const shapes = useMemo(() => {
    const items = [];
    const geometries = [
      { type: 'torus', args: [0.4, 0.15, 16, 32] },
      { type: 'octahedron', args: [0.5, 0] },
      { type: 'dodecahedron', args: [0.45, 0] },
      { type: 'torusKnot', args: [0.35, 0.12, 64, 8] },
    ];
    const colors = ['#C4B5FD', '#A5F3FC', '#A7F3D0', '#F9A8D4', '#D6BCFA'];
    for (let i = 0; i < 8; i++) {
      const geo = geometries[i % geometries.length];
      items.push({
        key: i,
        position: [
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 7,
          (Math.random() - 0.5) * 5 - 2,
        ],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scale: 0.25 + Math.random() * 0.4,
        color: colors[i % colors.length],
        speed: 0.2 + Math.random() * 0.4,
        geometry: geo,
      });
    }
    return items;
  }, []);

  return (
    <group ref={group}>
      {shapes.map((s) => (
        <Float key={s.key} speed={s.speed} rotationIntensity={0.3} floatIntensity={0.4}>
          <mesh position={s.position} rotation={s.rotation} scale={s.scale}>
            {s.geometry.type === 'torus' && <torusGeometry args={s.geometry.args} />}
            {s.geometry.type === 'octahedron' && <octahedronGeometry args={s.geometry.args} />}
            {s.geometry.type === 'dodecahedron' && <dodecahedronGeometry args={s.geometry.args} />}
            {s.geometry.type === 'torusKnot' && <torusKnotGeometry args={s.geometry.args} />}
            <MeshDistortMaterial
              color={s.color}
              transparent
              opacity={0.12 + Math.random() * 0.08}
              roughness={0.2}
              metalness={0.8}
              envMapIntensity={1}
              distort={0.15 + Math.random() * 0.15}
              speed={1 + Math.random()}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

const Particles = ({ count = 300 }) => {
  const mesh = useRef();
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      vel[i] = 0.002 + Math.random() * 0.005;
    }
    return [pos, vel];
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.008;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.005) * 0.05;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#C4B5FD" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
};

const Scene3D = ({ className = '', interactive = true }) => {
  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} color="#C4B5FD" />
        <directionalLight position={[-5, -5, 5]} intensity={0.3} color="#A5F3FC" />
        <pointLight position={[0, 3, 2]} intensity={0.4} color="#A7F3D0" />
        <CoreCrystal />
        <OrbitingRing radius={2.2} color="#C4B5FD" speed={0.25} count={24} size={0.04} />
        <OrbitingRing radius={2.8} color="#A5F3FC" speed={-0.2} count={32} size={0.03} />
        <OrbitingRing radius={3.4} color="#A7F3D0" speed={0.15} count={40} size={0.025} />
        <FloatingShapes />
        <Particles count={250} />
      </Canvas>
    </div>
  );
};

export default Scene3D;
