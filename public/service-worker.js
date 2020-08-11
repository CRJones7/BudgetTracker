const FILES_TO_CACHE = ["/", "index.html", "db.js", "index.js", "manifest.webmanifest",];

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

// install
self.addEventListener("install", function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Your files were pre-cached successfully!");
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

// activate
self.addEventListener("activate", function (evt) {
    console.log(caches);
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

//fetch 
self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                console.log(evt.request);
                return fetch(evt.request)
                    .then(response => {
                        // If the response was good, clone it and store it in the cache.
                        if (response.status === 200) {
                            console.log(evt.request.url);
                            cache.put(evt.request.url, response.clone());
                        }
                        console.log(response);
                        return response;
                    })
                    .catch(err => {
                        // Network request failed, try to get it from the cache.
                        console.log(cache);
                        return cache.match(evt.request);
                    });
            }).catch(err => console.log(err))
        );

        return;
    }
});