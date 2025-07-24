import { Canvas } from '@react-three/fiber';
import { useCanvas } from './index';
import { Suspense, useEffect, useState } from 'react';
import { OrthographicCamera } from '@react-three/drei';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

type WebGLCanvasProps = React.HTMLAttributes<HTMLDivElement> & {
  render?: boolean;
  postprocessing?: boolean;
};

// Debug function to log information with a prefix
const debug = (message: string, data?: any) => {
  const DEBUG = true; // Set to false to disable debugging
  if (!DEBUG) return;

  console.log(`[WebGL Canvas] ${message}`, data || '');
};

export function WebGLCanvas({ render = true, postprocessing = false, ...props }: WebGLCanvasProps) {
  const { WebGLTunnel, DOMTunnel } = useCanvas();
  const { isWebGL } = useDeviceDetection();
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Log canvas dimensions for debugging
  useEffect(() => {
    debug('Canvas initialized');
    debug('WebGL enabled:', isWebGL);

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewportSize({ width, height });

      debug('Canvas resized', {
        width,
        height,
        aspectRatio: width / height,
        isWebGL,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isWebGL]);

  // Calculate camera frustum values
  const left = -viewportSize.width / 2;
  const right = viewportSize.width / 2;
  const top = viewportSize.height / 2;
  const bottom = -viewportSize.height / 2;

  debug('Camera frustum', { left, right, top, bottom });

  if (!isWebGL) {
    debug('WebGL disabled - not rendering canvas');
    return null;
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}
      {...props}
    >
      <Canvas
        gl={{
          precision: 'highp',
          powerPreference: 'high-performance',
          antialias: true,
          alpha: true,
          ...(postprocessing && { stencil: false, depth: false }),
        }}
        dpr={[1, 2]}
        frameloop="always"
        resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
        style={{ pointerEvents: 'none' }}
        orthographic
        camera={{
          position: [0, 0, 1000],
          near: 0.1,
          far: 2000,
          zoom: 1,
        }}
      >
        {/* Use a custom OrthographicCamera that updates with viewport size */}
        <OrthographicCamera
          makeDefault
          position={[0, 0, 1000]}
          zoom={1}
          near={0.1}
          far={2000}
          top={top}
          bottom={bottom}
          left={left}
          right={right}
        />
        <Suspense fallback={null}>
          <WebGLTunnel.Out />
        </Suspense>
      </Canvas>
      <DOMTunnel.Out />
    </div>
  );
}
