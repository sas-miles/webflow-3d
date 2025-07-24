import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import { ATTRIBUTE } from '@/lib/dataAttributes';
import { getAttribute } from '@/hooks/getAttributes';

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
