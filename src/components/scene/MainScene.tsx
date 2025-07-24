import { useRef, useState } from 'react';
import { Mesh } from 'three';
import { Box, OrbitControls } from '@react-three/drei';
import { WebGLTunnel } from '@/components/tunnel';

export default function MainScene() {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const meshRef = useRef<Mesh>(null);

  return (
    <WebGLTunnel>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} />
    </WebGLTunnel>
  );
}
