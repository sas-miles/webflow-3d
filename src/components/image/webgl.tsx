import { useTexture } from '@react-three/drei';
import type { Rect } from 'hamo';
import { useEffect, useRef, useState } from 'react';
import {
  LinearFilter,
  type Mesh,
  MeshBasicMaterial,
  DoubleSide,
  RepeatWrapping,
  Texture,
} from 'three';
import { useWebGLRect } from '@/hooks/useWebGLRect';
import { useThree } from '@react-three/fiber';

type WebGLImageProps = {
  src: string | undefined;
  rect: Rect;
};

// Debug function to log information with a prefix
const debug = (message: string, data?: any) => {
  const DEBUG = true; // Set to false to disable debugging
  if (!DEBUG) return;

  console.log(`[WebGL Texture] ${message}`, data || '');
};

export function WebGLImage({ src, rect }: WebGLImageProps) {
  const meshRef = useRef<Mesh>(null!);
  // Start with transparent material instead of gray
  const [material] = useState(
    () =>
      new MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        side: DoubleSide, // Render both sides of the plane
      })
  );
  const [textureLoaded, setTextureLoaded] = useState(false);
  const { camera, viewport, size } = useThree();

  // Log important information when component mounts
  useEffect(() => {
    debug(`Initializing WebGLImage with src: ${src}`);
    debug(`Rect:`, {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    });
    debug('Camera type:', camera.type);
    debug('Viewport:', viewport);
    debug('Canvas size:', size);
  }, [rect, camera, viewport, size, src]);

  // Use drei's useTexture hook with onLoad callback
  const texture = useTexture(src || '', (loadedTexture) => {
    debug(`Texture loaded successfully: ${src}`, {
      dimensions: `${loadedTexture.image.width}x${loadedTexture.image.height}`,
    });
  });

  // Handle texture setup when it's loaded
  useEffect(() => {
    if (!texture) {
      debug('No texture available yet');
      return;
    }

    debug(`Texture loaded for ${src}`, {
      dimensions: texture.image ? `${texture.image.width}x${texture.image.height}` : 'unknown',
    });

    try {
      // Set proper texture filtering
      texture.magFilter = LinearFilter;
      texture.minFilter = LinearFilter;
      texture.generateMipmaps = false;
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.needsUpdate = true;

      // Update material with texture and make visible
      material.map = texture;
      material.transparent = true;
      material.opacity = 1;
      material.needsUpdate = true;

      setTextureLoaded(true);
      debug('Material updated with texture', {
        textureSize: texture.image ? `${texture.image.width}x${texture.image.height}` : 'unknown',
        materialMap: material.map ? 'present' : 'missing',
      });
    } catch (error) {
      debug('Error setting texture on material', error);
    }

    // Cleanup when component unmounts or texture changes
    return () => {
      if (material.map) {
        material.map = null;
        material.needsUpdate = true;
      }
    };
  }, [texture, material, src]);

  useWebGLRect(
    rect,
    ({
      position,
      scale,
      isVisible,
    }: {
      position: { x: number; y: number; z: number };
      scale: { x: number; y: number; z: number };
      isVisible: boolean;
    }) => {
      if (!meshRef.current) {
        debug('Mesh ref not available');
        return;
      }

      debug('Updating mesh with transform', {
        position,
        scale,
        isVisible,
        viewport: {
          width: size.width,
          height: size.height,
        },
      });

      // Set position
      meshRef.current.position.set(position.x, position.y, position.z);

      // Set scale - ensure we maintain aspect ratio if texture is loaded
      if (textureLoaded && texture && texture.image) {
        try {
          // Get the actual texture dimensions
          const textureWidth = texture.image.width;
          const textureHeight = texture.image.height;
          const textureAspect = textureWidth / textureHeight;

          // Get the container dimensions
          const containerWidth = scale.x;
          const containerHeight = scale.y;
          const containerAspect = containerWidth / containerHeight;

          let finalWidth, finalHeight;

          // Cover approach - fill the container while maintaining aspect ratio
          if (textureAspect > containerAspect) {
            // Texture is wider than container - match height and let width overflow
            finalHeight = containerHeight;
            finalWidth = finalHeight * textureAspect;
          } else {
            // Texture is taller than container - match width and let height overflow
            finalWidth = containerWidth;
            finalHeight = finalWidth / textureAspect;
          }

          meshRef.current.scale.set(finalWidth, finalHeight, 1);

          debug('Applied aspect ratio correction', {
            textureSize: `${textureWidth}x${textureHeight}`,
            textureAspect,
            containerSize: `${containerWidth}x${containerHeight}`,
            containerAspect,
            finalSize: `${finalWidth}x${finalHeight}`,
          });
        } catch (error) {
          debug('Error applying aspect ratio', error);
          // Fallback to container dimensions
          meshRef.current.scale.set(scale.x, scale.y, scale.z);
        }
      } else {
        // No texture yet, just use the provided scale
        meshRef.current.scale.set(scale.x, scale.y, scale.z);
      }

      // Only update matrix when needed
      if (meshRef.current.matrixAutoUpdate === false) {
        meshRef.current.updateMatrix();
      }

      // Always show the mesh when texture is loaded, regardless of isVisible flag
      meshRef.current.visible = textureLoaded;
    }
  );

  return (
    <mesh ref={meshRef} matrixAutoUpdate={false} renderOrder={1000}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
