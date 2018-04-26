self.addEventListener('install', (event) => {
    console.log(event)
    event.waitUntil(
        caches.open('conductor-v1-core')
            .then(cache => cache.addAll([
                '/js/bundle.min.js',
                '/styles/style.css',
            ]))
            .then(self.skipWaiting())
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => cachePage(request, response))
                .catch(err => getCachedPage(request))
        );
    } else {
        event.respondWith(
            caches.match(request)
                .then(response => cacheFile(request, response))
                .catch(err => fetchCoreFile(request.url))
        );
    }
});

function fetchCoreFile(url) {
    return caches.open('conductor-v1-core')
        .then(cache => cache.match(url))
        .then(response => response ? response : Promise.reject());
}

function getCachedPage(request) {
    return caches.open('conductor-v1-pages')
        .then(cache => cache.match(request))
        .then(response => response ? response : Promise.reject());
}

function cachePage(request, response) {
    const clonedResponse = response.clone();
    caches.open('conductor-v1-pages')
        .then(cache => cache.put(request, clonedResponse));
    return response;
}

// Met hulp van Alex van der Wal
function cacheFile(request, response) {
    if (response) {
        return response
    } else {
        return fetch(request)
            .then((newResponse) => {
                return caches.open('conductor-v1-core')
                    .then((cache) => {
                        cache.put(request.url, newResponse.clone())
                        return newResponse
                    })
            })
    }
}

