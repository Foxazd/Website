const CACHE_NAME = 'comic-chapters-cache-v1';
const serverUrl = 'http://localhost';

// Cài đặt Service Worker và cache tài nguyên ban đầu
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cài đặt cache ban đầu');
                return cache.addAll([
                    '/login',
                    '/comics',
                    '/read',
                    '/css/style.css',
                    '/js/app.js',
                    '/manifest.json',
                    '/assets/images/logo1.png',
                    // Thêm các trang khác mà bạn muốn cho phép di chuyển khi offline
                ]);
            })
            .catch((error) => {
                console.error('Service Worker: Lỗi khi cài đặt cache', error);
            })
    );
});

// Xử lý các yêu cầu fetch
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    // Bỏ qua cache cho các yêu cầu đến API, đặc biệt là các yêu cầu POST
    if (requestUrl.pathname.startsWith('/api/')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Kiểm tra xem trang có trong cache không
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Nếu có mạng, phục vụ từ mạng, nếu không có mạng phục vụ từ cache
                return navigator.onLine ? fetch(event.request) : cachedResponse;
            } else {
                // Nếu không có trong cache và offline, chuyển hướng người dùng về /login
                return navigator.onLine ? fetch(event.request) : Response.redirect('/login', 302);
            }
        })
    );
});

// Hàm trả về phản hồi khi offline và không có cache
function offlineFallback() {
    return new Response('<h1>Trang này không thể truy cập offline. Hãy kiểm tra lại kết nối mạng của bạn.</h1>', {
        status: 503,
        statusText: 'Service Unavailable',
    });
}

// Cập nhật lại Service Worker khi kết nối lại mạng
self.addEventListener('online', () => {
    console.log('Mạng đã kết nối lại');
    // Sau khi có mạng, có thể tự động làm mới cache và cập nhật nội dung
    caches.open(CACHE_NAME).then((cache) => {
        cache.keys().then((keys) => {
            keys.forEach((request) => {
                fetch(request).then((response) => {
                    if (response.status === 200) {
                        cache.put(request, response);
                    }
                });
            });
        });
    });
});

// Cung cấp cho người dùng khả năng reload trang khi có mạng
self.addEventListener('message', (event) => {
    if (event.data === 'reload') {
        self.skipWaiting();  // Bỏ qua Service Worker hiện tại và cài đặt Service Worker mới
    }
});

// Cập nhật lại các trang khi có mạng
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        // Xóa các cache cũ không còn dùng nữa
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
