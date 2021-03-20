# Free URL Shortener 

A free url shortener service leveraging Cloudflare's Worker serverless functionality. 

## To get started

Checkout Cloudflare's excellent getting started guide [here](https://developers.cloudflare.com/workers/learning/getting-started). No need for me to rehash their steps. This guide will get your local environment set up. 

## Using this project

1. Create a new project 

    To generate using [wrangler](https://github.com/cloudflare/wrangler)

    ```
    wrangler generate projectname https://github.com/cloudflare/worker-template
    ```
1. Drop in the index.js file from here.
    Ensure you update the top global vars (default_domain) with an appropriate value.
1. You also need to create a KV in cloudflare. The key will be the "slug" at the end of your shortened url (ex. 'github' is the slug of go.shortlink.com/github) and the value will be the full url you want to redirect to. 
1. You need to update your wranlger.toml (an example one has been provided here for you) with appropriate data. Specifically, make sure you update
    * name
    * type
    * account_id
        * found on your worker's homepage
    * kv_namespaces
        * binding is arbitrary. I leveraged 'URL_STORAGE' in index.js so if you deviate from that you will need to make appropriate updates.
        * id and preview_id are obtained from the kv homepage, these can be the same
    * zone_id (optional, only required if using a custom domain)
        * The ID of the domain to deploying to, which can be found on the "overview" page for your site (the domain you will be using)
    * route (optional, only required if using a custom domain)
        * The route pattern your Workers application will be served at. Very important, this should have a trailing "/*"... Don't waste as much time as I troubleshooting dns problems... 
        * EX: "go.example.com/*"

    **NOTE:** If you plan on doing this with a custom url shortener domain, the DNS needs to be managed by Cloudflare. Additionally, if you are going to be doing this with a subdomain (ex. go.shortlink.com) you need to ensure a dns record exists for the domain. If you are like me, and nothing lives at the subdomain, Cloudflare mentions you can set up an AAAA record pointing to "100::" (the reserved IPv6 discard prefix). Reference [here](https://developers.cloudflare.com/workers/platform/routes#subdomains-must-have-a-dns-record). I failed to read these instructions and spent way to much time troubleshooting... As I have learned, it is ALWAYS DNS ;)
1. To publish, run the following from the root of the project:
    ```
    wrangler publish
    ```

## To Do
1. Create an easy way to update KV without logging into Cloudflare gui
    * looking into GO client maybe or a curl request with a secret key stored in a different kv
1. Collect stats
    * Another KV that stores stats related to how much a url shortener link has been hit, last time it was used, etc...
