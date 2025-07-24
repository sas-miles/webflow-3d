import { Canvas } from '@react-three/fiber';
import { useCanvas } from './index';
import { Suspense } from 'react';
import { PerspectiveCamera } from '@react-three/drei';

type WebGLCanvasProps = React.HTMLAttributes<HTMLDivElement> & {
  render?: boolean;
  postprocessing?: boolean;
};

export function WebGLCanvas({ render = true, postprocessing = false, ...props }: WebGLCanvasProps) {
  const { WebGLTunnel, DOMTunnel } = useCanvas();

  return (
    <div style={{ width: '100%', height: '100%' }} {...props}>
      <Canvas
        gl={{
          precision: 'highp',
          powerPreference: 'high-performance',
          antialias: true,
          alpha: true,
          ...(postprocessing && { stencil: false, depth: false }),
        }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 10], fov: 50 }}
        frameloop="always"
        resize={{ scroll: false, debounce: { scroll: 0, resize: 500 } }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <Suspense fallback={null}>
          <WebGLTunnel.Out />
        </Suspense>
      </Canvas>
      <DOMTunnel.Out />
    </div>
  );
}
