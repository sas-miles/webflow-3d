import { useThree } from '@react-three/fiber'
import type { Rect } from 'hamo'
import { useLenis } from 'lenis/react'
import { useCallback, useEffect, useRef } from 'react'
import { Euler, Vector3 } from 'three'
import { useTransform } from '@/hooks/useTransform'

interface WebGLTransform {
  position: Vector3
  rotation: Euler
  scale: Vector3
  isVisible: boolean
}

// Debug function to log information with a prefix
const debug = (message: string, data?: any) => {
  const DEBUG = true; // Set to false to disable debugging
  if (!DEBUG) return;
  
  console.log(`[WebGL Rect] ${message}`, data || '');
};

export function useWebGLRect(
  rect: Rect,
  onUpdate?: (transform: WebGLTransform) => void
) {
  const size = useThree((state) => state.size)
  const camera = useThree((state) => state.camera)

  const transformRef = useRef<WebGLTransform>({
    position: new Vector3(0, 0, 0),
    rotation: new Euler(0, 0, 0),
    scale: new Vector3(1, 1, 1),
    isVisible: true,
  })

  const lenis = useLenis()
  const getTransform = useTransform()

  const update = useCallback(() => {
    const { translate, scale } = getTransform()

    let scroll: number

    if (lenis) {
      scroll = Math.floor(lenis?.scroll)
    } else {
      scroll = window.scrollY
    }

    const transform = transformRef.current

    if (!(rect.top != null && rect.height != null && rect.left != null && rect.width != null)) {
      debug('Rect is missing required properties', rect)
      return
    }

    // Always set isVisible to true for now - we're having issues with visibility detection
    // The actual visibility will be handled by the WebGL renderer's frustum culling
    transform.isVisible = true;

    // Calculate element center in viewport coordinates
    // Account for scroll position to get the current viewport position
    const elementCenterX = rect.left + rect.width / 2
    const elementCenterY = rect.top + rect.height / 2 - scroll
    
    // Convert to WebGL coordinates (origin at center)
    // For X: convert from 0->width to -width/2->width/2
    // For Y: convert from 0->height to height/2->-height/2 (Y is flipped in WebGL)
    transform.position.x = elementCenterX - size.width / 2
    transform.position.y = size.height / 2 - elementCenterY
    transform.position.z = 0
    
    // Apply additional translations from transform context
    transform.position.x += translate.x
    transform.position.y += translate.y
    
    // Scale is in pixels for orthographic camera
    transform.scale.x = rect.width * scale.x
    transform.scale.y = rect.height * scale.y
    transform.scale.z = 1

    debug('Updated transform', {
      viewport: {
        width: size.width,
        height: size.height,
      },
      rect: {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      },
      position: {
        x: transform.position.x,
        y: transform.position.y,
        z: transform.position.z,
      },
      scale: {
        x: transform.scale.x,
        y: transform.scale.y,
      },
      isVisible: transform.isVisible,
      scroll,
    })

    onUpdate?.(transformRef.current)
  }, [lenis, getTransform, size, rect, onUpdate])

  useTransform(update, [update])
  useLenis(update, [update])

  useEffect(() => {
    if (lenis) return

    update()
    window.addEventListener('scroll', update, false)
    window.addEventListener('resize', update, false)

    return () => {
      window.removeEventListener('scroll', update, false)
      window.removeEventListener('resize', update, false)
    }
  }, [lenis, update])

  const get = useCallback(() => transformRef.current, [])

  return get
}