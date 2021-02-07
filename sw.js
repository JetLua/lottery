const users = [
  {id: '1', name: 'JetLu'},
  {id: '2', name: 'Gift'}
]

self.addEventListener('fetch', e => {

  /**
   * 拦截 /api/user/list
   */
  if (e.request.url.endsWith('/api/user/list')) {
    return e.respondWith(function() {
      return new Response(
        JSON.stringify({ok: true, data: users}),
        {headers: {'content-type': 'application/json'}}
      )
    }())
  }

  /**
   * 拦截 /api/lottery
   */
  if (e.request.url.endsWith('/api/lottery')) {
    return e.respondWith(function() {
      return new Response(
        JSON.stringify({ok: true, data: users}),
        {headers: {'content-type': 'application/json'}}
      )
    }())
  }

  // 缓存图片资源
  if (!/.jpe?g|.png/.test(e.request.url)) return

  e.respondWith(async function() {
    const cache = await caches.open('v1')
    let data = await cache.match(e.request)
    if (data) return data
    data = await fetch(e.request)
    cache.put(e.request, data.clone())
    return data
  }())
})

self.addEventListener('install', e => {
  self.skipWaiting()
})
