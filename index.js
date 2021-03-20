// Enter the domain you want to default bad requests to
var default_domain = "https://itdrc.org";
var shortener_link = "go.derekvolmering.com";

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

      if (mapped_url != null){
        // get current timestamp
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+' '+time;
        //console.log(`date is: ${dateTime}`)
        var shortened_link = shortener_link + '/' + keyphrase
        //console.log(`shortened url is: ${shortened_link}`)
        // lookup if we have stats
        let url_stats = await URL_STATS.get(shortened_link)
        
        if (url_stats == null) {
          //if no stats, add an entry to kv
          stats_value = dateTime + ' | ' + 1
          await URL_STATS.put(shortened_link, stats_value)
        } else{
          //else update kv
          access_count = url_stats.split('|')
          temp_count = parseInt(access_count[1])
          temp_count = temp_count + 1
          stats_value = dateTime + ' | ' + temp_count
          await URL_STATS.put(shortened_link, stats_value) 
        }
      }
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