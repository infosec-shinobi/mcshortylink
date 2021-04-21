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
      //setting some constants to log to kv for analysis/stats
      const referer = request.headers.get("Referer")
      // refer to https://developers.cloudflare.com/workers/runtime-apis/request#incomingrequestcfproperties
      const client_ip = request.headers.get("cf-connecting-ip")
      //used so cloudflare quick edit doesn't get mad because requests.cf will be undefined when testing that way
      const cf_data_exists = request.cf !== undefined ? true : false
      //console.log(`cf data exists: ${cf_data_exists}`)
      const client_country = cf_data_exists === true ? request.cf.country : null
      const client_state = cf_data_exists === true ? request.cf.region : null
      const client_state_short = cf_data_exists === true ? request.cf.regionCode : null
      const client_city = cf_data_exists === true ? request.cf.city : null
      const client_zipcode = cf_data_exists === true ? request.cf.postalCode : null
      const client_timezone = cf_data_exists === true ? request.cf.timezone : null
     
      // Helpful to understand why we are creating a new url here: https://javascript.info/url
      let keyphrase = new URL(request.url).pathname.replace("/", "");

      if (keyphrase == ""){
        return Response.redirect(default_domain, 301)
      }
 
      // lookup url to redirect to from KV
      let mapped_url = await URL_STORAGE.get(keyphrase);

      if (mapped_url != null){
        // get current timestamp
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+' '+time;
        var shortened_link = shortener_link + '/' + keyphrase
        // lookup if we have stats
        let url_stats = await URL_STATS.get(shortened_link)

        //ensure a uniq key for long stats
        let uniq_key = `${dateTime} - ${Math.random()}`
        //capture all headers, refer to https://developers.cloudflare.com/workers/runtime-apis/request#properties
        let full_header = JSON.stringify([...request.headers])
        //log to kv
        let full_dets = JSON.stringify({shortened_link, referer, dateTime, client_ip, client_country, client_state, client_state_short, client_city, client_zipcode, client_timezone, full_header})
        //let full_dets = JSON.stringify({shortened_link, referer, dateTime, client_ip, cf_data_exists, client_country, full_header, request})
        await URL_LONG_STATS.put(uniq_key, full_dets)
        //console.log(uniq_key, JSON.stringify({shortened_link, full_header}))
        
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
      // If the key was found, redirect to the desired page, if key wasn't found, send to default site
      return mapped_url 
        ? Response.redirect(mapped_url, 301)
        : Response.redirect(default_domain, 301)
    } else {
      // Return error if not GET request
      return new Response("Not Found", { status: 404 })
    }
  }