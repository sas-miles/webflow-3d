import { useRect } from 'hamo';
import { useEffect, useRef, useState } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { WebGLTunnel } from '../tunnel';
import { WebGLImage } from './webgl';
import { ATTRIBUTE } from '@/lib/dataAttributes';
import { getAttributes } from '@/hooks/getAttributes';

interface WebflowImageElement extends HTMLImageElement {
  currentSrc: string;
}

// Debug function to log information with a prefix
const debug = (message: string, data?: any) => {
  const DEBUG = true; // Set to false to disable debugging
  if (!DEBUG) return;

  console.log(`[WebGL Image] ${message}`, data || '');
};

export function WebflowImageEnhancer() {
  const { isWebGL } = useDeviceDetection();
  const [images, setImages] = useState<WebflowImageElement[]>([]);
  const [imageRects, setImageRects] = useState<Map<string, DOMRect>>(new Map());
  const [imageSources, setImageSources] = useState<Map<string, string>>(new Map());
  const observerRef = useRef<MutationObserver | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Track which images have been processed for WebGL
  const processedImagesRef = useRef<Set<string>>(new Set());

  // Find all images with the WEBGL_IMAGE attribute
  useEffect(() => {
    const findImages = () => {
      const elements = getAttributes(ATTRIBUTE.WEBGL_IMAGE);
      const imageElements = Array.from(elements).filter(
        (el): el is WebflowImageElement => el.tagName.toLowerCase() === 'img'
      );
      debug(
        `Found ${imageElements.length} images with ${ATTRIBUTE.WEBGL_IMAGE} attribute`,
        imageElements
      );
      setImages(imageElements);
    };

    // Initial search
    debug('Initializing WebflowImageEnhancer');
    findImages();

    // Set up mutation observer to detect new images
    if (!observerRef.current) {
      debug('Setting up MutationObserver');
      observerRef.current = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === ATTRIBUTE.WEBGL_IMAGE) {
            debug('Detected attribute change', mutation);
            shouldUpdate = true;
          } else if (mutation.type === 'childList') {
            debug('Detected DOM structure change', mutation);
            shouldUpdate = true;
          }
        });

        if (shouldUpdate) {
          debug('DOM changes detected, updating images');
          findImages();
        }
      });

      observerRef.current.observe(document.body, {
        attributes: true,
        attributeFilter: [ATTRIBUTE.WEBGL_IMAGE],
        childList: true,
        subtree: true,
      });
    }

    return () => {
      if (observerRef.current) {
        debug('Disconnecting MutationObserver');
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  // Set up resize observer to update image positions
  useEffect(() => {
    if (!isWebGL) return;

    const updateImageRects = () => {
      debug('Window resized, updating image rects');

      // Update all image rects
      setImages((prevImages) => {
        // Process all images again to get updated rects
        processImages(prevImages);
        return prevImages;
      });
    };

    // Create resize observer
    if (!resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver(updateImageRects);
      resizeObserverRef.current.observe(document.body);

      // Also listen for window resize events
      window.addEventListener('resize', updateImageRects);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      window.removeEventListener('resize', updateImageRects);
    };
  }, [isWebGL]);

  // Process found images
  const processImages = (imagesToProcess: WebflowImageElement[]) => {
    if (!isWebGL || imagesToProcess.length === 0) return;

    debug(`Processing ${imagesToProcess.length} images`);

    // Create a new map for image rects
    const newRects = new Map<string, DOMRect>();
    const newSources = new Map<string, string>();

    // Process each image
    imagesToProcess.forEach((img) => {
      const id = img.getAttribute(ATTRIBUTE.WEBGL_IMAGE) || img.src;

      // Get image rect
      const rect = img.getBoundingClientRect();
      newRects.set(id, rect);
      debug(`Image ${id} rect:`, {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      });

      // Get image source
      if (img.complete) {
        debug(`Image ${id} is already loaded:`, img.currentSrc);
        newSources.set(id, img.currentSrc);

        // Only hide the original image once we know it's loaded
        if (!processedImagesRef.current.has(id)) {
          img.style.opacity = '0';
          processedImagesRef.current.add(id);
        }
      } else {
        debug(`Image ${id} not loaded yet, setting up onload handler`);
        img.onload = () => {
          debug(`Image ${id} loaded:`, img.currentSrc);
          setImageSources((prev) => {
            const updated = new Map(prev);
            updated.set(id, img.currentSrc);

            // Only hide the original image once we know it's loaded
            if (!processedImagesRef.current.has(id)) {
              img.style.opacity = '0';
              processedImagesRef.current.add(id);
            }

            return updated;
          });
        };
      }
    });

    setImageRects((prev) => {
      const updated = new Map(prev);
      newRects.forEach((rect, id) => {
        updated.set(id, rect);
      });
      return updated;
    });

    setImageSources((prev) => {
      const updated = new Map(prev);
      newSources.forEach((src, id) => {
        updated.set(id, src);
      });
      return updated;
    });

    debug('Updated image rects and sources', {
      rects: newRects.size,
      sources: newSources.size,
    });
  };

  // Process images when they change
  useEffect(() => {
    processImages(images);
  }, [images, isWebGL]);

  // Render WebGL images
  if (!isWebGL) {
    debug('WebGL not enabled, not rendering WebGL images');
    return null;
  }

  const imageEntries = Array.from(imageRects.entries());
  debug(`Rendering ${imageEntries.length} WebGL images`);

  return (
    <WebGLTunnel>
      {imageEntries.map(([id, rect]) => {
        const src = imageSources.get(id);
        if (!src) {
          debug(`No source found for image ${id}, skipping render`);
          return null;
        }

        debug(`Rendering WebGL image ${id} with source ${src}`);
        return <WebGLImage key={id} rect={rect} src={src} />;
      })}
    </WebGLTunnel>
  );
}
