import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';
import tunnel from 'tunnel-rat';
import { create } from 'zustand';

import { WebGLCanvas } from './webgl';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

type CanvasContextValue = {
  WebGLTunnel?: ReturnType<typeof tunnel>;
  DOMTunnel?: ReturnType<typeof tunnel>;
};

type CanvasProps = PropsWithChildren<{
  root?: boolean;
  force?: boolean;
}>;

const useRoot = create<CanvasContextValue>(() => ({}));

export const CanvasContext = createContext<CanvasContextValue>({});

export function Canvas({ children, root = false, force = false, ...props }: CanvasProps) {
  const [WebGLTunnel] = useState(() => tunnel());
  const [DOMTunnel] = useState(() => tunnel());

  const { isWebGL } = useDeviceDetection();

  useEffect(() => {
    if (root) {
      useRoot.setState(isWebGL || force ? { WebGLTunnel, DOMTunnel } : {});
    }

    return () => {
      useRoot.setState({});
    };
  }, [root, isWebGL, force, WebGLTunnel, DOMTunnel]);

  return (
    <CanvasContext.Provider value={isWebGL || force ? { WebGLTunnel, DOMTunnel } : {}}>
      {(isWebGL || force) && <WebGLCanvas {...props} />}
      {children}
    </CanvasContext.Provider>
  );
}
export function useCanvas() {
  const local = useContext(CanvasContext);
  const root = useRoot();

  const isLocalDefined = Object.keys(local).length > 0;

  return (isLocalDefined ? local : root) as Required<CanvasContextValue>;
}
