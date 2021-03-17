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

    Ensure you update the top two global vars (default_domain and shortener_tld) with appropriate values.
1. If you plan on doing this with a custom url shortener domain, the DNS needs to be managed by Cloudflare. Additionally, if you are going to be doing this with a subdomain (ex. go.shortlink.com) you need to make sure there is a cname for go that points to shortlink.com.
1. You also need to create a KV in cloudflare. The key will be the "slug" at the end of your shortened url (ex. 'github' is the slug of go.shortlink.com/github) and the value will be the full url you want to redirect to. 
1. You need to update your wranlger.toml (an example one has been provided here for you) with appropriate data. Specifically, make sure you update
    * name
    * type
    * account_id
        * found on your worker's homepage
    * kv_namespaces
        * binding is arbitrary. I leveraged 'URL_STORAGE' in index.js so if you deviate from that you will need to make appropriate updates.
        * id and preview_id are obtained from the kv homepage, these can be the same
    
    I also included an environment specific section called "production". If you do this and you want to do a custom domain, you will need to update the zone_id with the one provided on the domain homepage in Cloudflare and the route which is the shortener url pattern Cloudflare should monitor.
1. To publish, run the following from the root of the project:
    ```
    # Publish to Cloudflare provided domain
    wrangler publish

    # Publish to production environment/custom domain
    wranlger publish --env production
    ```

## To Do
1. Create an easy way to update KV without logging into Cloudflare gui
    * looking into GO client maybe or a curl request with a secret key stored in a different kv
1. Collect stats
    * Another KV that stores stats related to how much a url shortener link has been hit, last time it was used, etc...
