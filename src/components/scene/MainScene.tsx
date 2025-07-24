import { useRef, useState } from 'react';
import { Mesh } from 'three';
import { Box, OrbitControls } from '@react-three/drei';

export default function MainScene() {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const meshRef = useRef<Mesh>(null);

  return (
    <>
      <OrbitControls />

      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        scale={clicked ? 1.5 : 1}
        onClick={() => setClicked(!clicked)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <Box args={[2, 2, 2]} />
        <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
      </mesh>

      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} />

      <gridHelper args={[10, 10]} />
    </>
  );
}
