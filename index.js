// Enter the domain you want to default bad requests to
var default_domain = "https://itdrc.org"

// Enter the TLD of the shortener url you are using (ex com|edu|dev|io)
var shortener_tld = "com"


// Event handler
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event))
})
  
// Function for the redirect html
function prepareRedirectResponse(path) {
  return new Response(
    //'<html><head><title>Redirect in progress...</title></head><body>You can wait for the redirect or <a href="' +
    //  path +'">click here.</a></body></html>',
    '<html><head><title>Redirecting to ' +
      path +
      '...</title></head><body>Please wait for the redirect, or, <a href="' +
      path +
      '">click here.</a></body></html>',
    {
      status: 302,
      headers: { 'content-type': 'text/html', location: path },
    },
  )
}
  
  async function handleRequest(event) {
    // See https://developers.cloudflare.com/workers/runtime-apis/cache for ref
    let cache = caches.default
    //Represents the http request: https://developers.cloudflare.com/workers/runtime-apis/request
    const request = event.request
  
    // Respond to only 'GET' requests
    if (request.method === 'GET') {
      
      // Attempt to fetch from cache
      let response = await cache.match(request)
  
      if (!response) {
        // If not in cache
        // Parse out key from from shortener url hit and remove any trailing slash
        const key = request.url.split('.'+shortener_tld+'/')[1].replace(/\/$/, "")
        // Look up key in KV and get the url stored as the value
        const mapped_url = await URL_STORAGE.get(key)
        // Create the response we will send
        // If key is in KV, send to stored url, if not send to default domain
        response = prepareRedirectResponse(
          mapped_url ? mapped_url : default_domain,
        )
        // Enable caching for 1 hour
        //const respHeaders = { 'cache-control': 'public, max-age=86400' }
        const respHeaders = { 'cache-control': 'public, max-age=3600' }
        response = new Response(response.body, { ...response, respHeaders })
        event.waitUntil(cache.put(request, response.clone()))
      }
      
      //let redirect_url = mapped_url ? mapped_url : default_domain
      // Send response
      return response.redirect(redirect_url)
    } else {
      // Return error if not GET request
      return new Response(null, { status: 405 })
    }
  }