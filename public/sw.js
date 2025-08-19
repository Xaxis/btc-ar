// Service Worker for BTC AR PWA

const CACHE_NAME = 'btc-ar-v1';
const STATIC_CACHE_NAME = 'btc-ar-static-v1';
const DYNAMIC_CACHE_NAME = 'btc-ar-dynamic-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/favicon.png',
  // Tesseract.js core files will be cached dynamically
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method === 'GET') {
    // Handle API requests (Bitcoin price)
    if (url.hostname === 'api.coingecko.com') {
      event.respondWith(handleApiRequest(request));
      return;
    }
    
    // Handle Tesseract.js files
    if (url.hostname === 'unpkg.com' && url.pathname.includes('tesseract.js')) {
      event.respondWith(handleTesseractRequest(request));
      return;
    }
    
    // Handle static files
    event.respondWith(handleStaticRequest(request));
  }
});

// Handle API requests with cache fallback
async function handleApiRequest(request) {
  const cacheName = DYNAMIC_CACHE_NAME;
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful response
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    // Fallback to cache
    console.log('Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return a default Bitcoin price if no cache available
    return new Response(JSON.stringify({
      bitcoin: { usd: 50000 } // Fallback price
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle Tesseract.js files with aggressive caching
async function handleTesseractRequest(request) {
  const cacheName = DYNAMIC_CACHE_NAME;
  
  // Check cache first for Tesseract files
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache Tesseract files aggressively
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Failed to fetch Tesseract file:', request.url);
    throw error;
  }
}

// Handle static files
async function handleStaticRequest(request) {
  // Check static cache first
  const staticResponse = await caches.match(request, {
    cacheName: STATIC_CACHE_NAME
  });
  
  if (staticResponse) {
    return staticResponse;
  }
  
  // Check dynamic cache
  const dynamicResponse = await caches.match(request, {
    cacheName: DYNAMIC_CACHE_NAME
  });
  
  if (dynamicResponse) {
    return dynamicResponse;
  }
  
  // Try network and cache response
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // For navigation requests, return the cached index.html
    if (request.mode === 'navigate') {
      const indexResponse = await caches.match('/');
      if (indexResponse) {
        return indexResponse;
      }
    }
    
    throw error;
  }
}

// Handle background sync for Bitcoin price updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'bitcoin-price-sync') {
    event.waitUntil(syncBitcoinPrice());
  }
});

async function syncBitcoinPrice() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(response.url, response.clone());
      
      // Notify clients of updated price
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'BITCOIN_PRICE_UPDATED',
          data: response.json()
        });
      });
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}
