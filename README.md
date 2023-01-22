# NATS Docs

## Content

All content exists under `src/pages`.

## Redirects

The `redirects.json` file contains redirects of existing paths to the new paths. The redirect are applied in `next.config.js` along with default redirects for `readme` or `index` naming.

## Markdoc

The Markdoc configuration is under `./markdoc` and bootstrapped in `next.config.js`.

The `./markdoc/nodes.js` file registers custom components that override the default ones used for rendering the core Markdown components. For example, an `##` rendering an `h2` element. The current overrides include:

- `th` - table head cell
- `fence` - code block fence
- `link` - link/anchor


The `./markdoc/tags.js` file registers custom components using the tag syntax, e.g. `{% mytag /%}`. The current set includes:

- `callout`
  - title
  - type: note | warning
- `figure`
  - src
  - alt
  - caption
- `embed`
  - url
- `quick-links` - must contain `quick-link` tags
- `quick-link`
  - title
  - description
  - icon
  - href
- `tabs` - must contain `tab` tags
- `tab`
  - title

## Syntax

Syntax is a [Tailwind UI](https://tailwindui.com) site template built using [Tailwind CSS](https://tailwindcss.com) and [Next.js](https://nextjs.org).

## Getting started

To get started with this template, first install the npm dependencies:

```bash
npm install
cp .env.example .env.local
```

Next, run the development server:

```bash
npm run dev
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Customizing

You can start editing this template by modifying the files in the `/src` folder. The site will auto-update as you edit these files.

## License

This site template is a commercial product and is licensed under the [Tailwind UI license](https://tailwindui.com/license).

## Learn more
To learn more about the technologies used in this site template, see the following resources:

- [Tailwind CSS](https://tailwindcss.com/docs) - the official Tailwind CSS documentation
- [Next.js](https://nextjs.org/docs) - the official Next.js documentation
- [Headless UI](https://headlessui.dev) - the official Headless UI documentation
- [Markdoc](https://markdoc.io) - the official Markdoc documentation
- [DocSearch](https://docsearch.algolia.com) - the official DocSearch documentation
