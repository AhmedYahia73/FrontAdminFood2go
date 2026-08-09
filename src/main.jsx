import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { ContextProvider } from './Context/Auth.jsx';
import { RouterProvider } from 'react-router-dom';
import { router } from './Router.jsx';
import { Provider } from 'react-redux';
import { persistor, StoreApp } from './Store/Store.jsx';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoaderLogin from './Components/Loaders/LoaderLogin.jsx';
import './app.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity, // Keep data in cache without background refetching until explicitly invalidated by WebSockets
      retry: 1,
    },
  },
});
createRoot(document.getElementById('root')).render(
  <Provider store={StoreApp}>
    <PersistGate loading={null} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <ContextProvider>
          <Suspense fallback={<LoaderLogin />}>
            <RouterProvider router={router} />
          </Suspense>
        </ContextProvider>
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);

