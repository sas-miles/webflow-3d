import Lenis from 'lenis';

declare global {
  interface Window {
    Webflow: any[];
    lenis: Lenis;
  }
}

export {};
