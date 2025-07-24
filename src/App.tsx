import { Canvas } from '@/components/canvas';
import { WebGLTunnel } from '@/components/tunnel';
import MainScene from './components/scene/MainScene';

export default function App() {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas force={true} root={true}>
        <WebGLTunnel>
          <MainScene />
        </WebGLTunnel>
      </Canvas>
    </div>
  );
}
