'use client';

import { useContextBridge } from '@react-three/drei';
import { Fragment, type PropsWithChildren, useId } from 'react';
import { useCanvas } from '@/components/canvas';
import { TransformContext } from '@/hooks/useTransform';

export function WebGLTunnel({ children }: PropsWithChildren) {
  const { WebGLTunnel } = useCanvas();

  if (!WebGLTunnel) return null;

  const ContextBridge = useContextBridge(TransformContext);
  const uuid = useId();

  return (
    <WebGLTunnel.In>
      <ContextBridge key={uuid}>{children}</ContextBridge>
    </WebGLTunnel.In>
  );
}

export function DOMTunnel({ children }: PropsWithChildren) {
  const { DOMTunnel } = useCanvas();

  if (!DOMTunnel) return null;

  const uuid = useId();

  return (
    <DOMTunnel.In>
      <Fragment key={uuid}>{children}</Fragment>
    </DOMTunnel.In>
  );
}
