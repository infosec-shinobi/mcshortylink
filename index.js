// Enter the domain you want to default bad requests to
var default_domain = "https://itdrc.org";

// Event handler
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event))
})
   
  async function handleRequest(event) {
    //Represents the http request: https://developers.cloudflare.com/workers/runtime-apis/request
    const request = event.request;
  
    // Respond to only 'GET' requests
    if (request.method === `GET`) {
      
      // Helpful to understand why we are creating a new url here: https://javascript.info/url
      let keyphrase = new URL(request.url).pathname.replace("/", "");

      if (keyphrase == ""){
        //debug alerting
        //console.log(`Inside the empty keyphase loop`)
        return Response.redirect(default_domain, 301)
      }
      //debug alerting
      //console.log(`keyphrase is: ${keyphrase}`)
      // lookup url to redirect to from KV
      let mapped_url = await URL_STORAGE.get(keyphrase);
      //debug alerting
      //console.log(`mapped url: ${mapped_url}`)
      // If the key was found, redirect to the desired page, if key wasn't found, send to default site
      return mapped_url 
        ? Response.redirect(mapped_url, 301) 
        //: new Response("Not Found", {status: 404})
        : Response.redirect(default_domain, 301)
    } else {
      // Return error if not GET request
      return new Response("Not Found", { status: 404 })
    }
  }