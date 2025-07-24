import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import { ATTRIBUTE } from '@/lib/dataAttributes';
import { getAttribute } from '@/hooks/getAttributes';
import Lenis from 'lenis';

// Initialize Lenis globally before Webflow's ready event
const lenis = new Lenis();
lenis.start();

// Add raf animation loop for Lenis
function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Make Lenis available globally
window.lenis = lenis;

window.Webflow ||= [];
window.Webflow.push(() => {
  const mountPoint = getAttribute(ATTRIBUTE.REACT_MOUNT);

  if (mountPoint) {
    const root = ReactDOM.createRoot(mountPoint);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.error(
      'Mount point not found. Make sure an element with data-react-mount attribute exists in the HTML'
    );
  }
});
