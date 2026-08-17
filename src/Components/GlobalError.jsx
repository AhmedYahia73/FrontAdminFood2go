import React from 'react';
import { useRouteError } from 'react-router-dom';

const GlobalError = () => {
  const error = useRouteError();

  // If this is a lazy-loading chunk error, force a page reload.
  // This typically happens when a new version of the app is deployed
  // and the user has an old version of the app loaded.
  if (
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.message?.includes('Importing a module script failed')
  ) {
    window.location.reload();
    return null; // Return null so we don't render anything while reloading
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Unexpected Application Error!</h1>
      <p>{error?.message || "Something went wrong."}</p>
      <button 
        onClick={() => window.location.reload()}
        style={{ 
          marginTop: '1rem', 
          padding: '0.5rem 1rem', 
          cursor: 'pointer',
          border: '1px solid #ccc',
          borderRadius: '4px',
          background: '#fff'
        }}
      >
        Reload Page
      </button>
    </div>
  );
};

export default GlobalError;
