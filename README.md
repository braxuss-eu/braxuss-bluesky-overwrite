# bluesky-overwrite

If you want to edit a post without losing it's position in a thread or the answers you can overwrite it with this tool:

1. Start by creating a new post with the content that you want to use. That will be the "source" post.
2. This tool will overwrite the "target" post with the content of the "source" post when you say so.
3. Then you can delete the "source" one, it's no longer needed.

## Ready to use

https://overwrite.braxuss.eu

## Acknowledgements

This project is heavily inspired by the famous tool https://pdsls.dev.
I just wanted to make it simpler for non geeks to edit posts with facets and resources.

I also used https://github.com/mary-ext/atcute as Bluesky client library and also for oauth login.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

Remember to change `client-metadata.json` so it reflects your domain name.

```sh
npm run build
```