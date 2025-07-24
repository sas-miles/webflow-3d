import { useMediaQuery } from 'hamo'
const breakpoints = {
    dt: 800,
  }

export function useDeviceDetection() {
  const breakpoint = breakpoints.dt

  const isMobile = useMediaQuery(`(max-width: ${breakpoint - 1}px)`)
  const isDesktop = useMediaQuery(`(min-width: ${breakpoint}px)`)
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  
  // Always enable WebGL regardless of screen size, only disable for reduced motion
  const isWebGL = !isReducedMotion

  // Check for low power mode with fallback for unsupported browsers
  const isLowPowerMode = useMediaQuery(
    '(any-pointer: coarse) and (hover: none)'
  )

  return { isMobile, isDesktop, isReducedMotion, isWebGL, isLowPowerMode }
}