const addResourcesToCache = async (resources) => {
    const cache = await caches.open('v1');
    await cache.addAll(resources);
};

const putInCache = async (request, response) => {
    const cache = await caches.open('v1');
    await cache.put(request, response);
};

const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
    // First try to get the resource from the cache
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }

    // Next try to use the preloaded response, if it's there
    const preloadResponse = await preloadResponsePromise;
    if (preloadResponse) {
        console.info('using preload response', preloadResponse);
        putInCache(request, preloadResponse.clone());
        return preloadResponse;
    }

    // Next try to get the resource from the network
    try {
        const responseFromNetwork = await fetch(request);
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        putInCache(request, responseFromNetwork.clone());
        return responseFromNetwork;
    } catch (error) {
        const fallbackResponse = await caches.match(fallbackUrl);
        if (fallbackResponse) {
            return fallbackResponse;
        }
        // when even the fallback response is not available,
        // there is nothing we can do, but we must always
        // return a Response object
        return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
        });
    }
};

const enableNavigationPreload = async () => {
    if (self.registration.navigationPreload) {
        // Enable navigation preloads!
        await self.registration.navigationPreload.enable();
    }
};

self.addEventListener('activate', (event) => {
    event.waitUntil(enableNavigationPreload());
});

self.addEventListener('install', (event) => {
    event.waitUntil(
        addResourcesToCache([
            './',
            'https://www.ceferin.com',
            'https://www.ceferin.com/index.html',
            'https://www.ceferin.com/style.css',
            'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
            'https://www.ceferin.com/clogo.svg',
            'https://www.ceferin.com/macweb.webp',
            'https://www.ceferin.com/ipadweb.webp',
            'https://www.ceferin.com/iphoneweb.webp',
            'https://www.ceferin.com/circle.gif',
            'https://www.ceferin.com/RealEstate-6.webp',
            'https://www.ceferin.com/Education-2.webp',
            'https://www.ceferin.com/Healthcare-3.webp',
            'https://www.ceferin.com/Hospitality-1.webp',
            'https://www.ceferin.com/Store-4.webp',
            'https://www.ceferin.com/Fashion-2.webp',
            'https://www.ceferin.com/Store-5.webp',
            'https://www.ceferin.com/Fitness-4.webp',
            'https://www.ceferin.com/Finance-1.webp',
            'https://www.ceferin.com/Photography-2.webp',
            'https://www.ceferin.com/school.gif',
            'https://www.ceferin.com/pwa.gif',
            'https://www.ceferin.com/lead-capture.webp',
            'https://www.ceferin.com/team-members.webp',
            'https://www.ceferin.com/customize-template.webp',
            'https://www.ceferin.com/blog-feature.webp',
            'https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=5ee8e894dfcfd4765c67b3cc',
            'https://www.ceferin.com/script.js',
            'https://www.ceferin.com/lazysizes.min.js'
        ])
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        cacheFirst({
            request: event.request,
            preloadResponsePromise: event.preloadResponse,
            fallbackUrl: 'https://www.ceferin.com/index.html',
        })
    );
});