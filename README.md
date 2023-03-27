# NATS Docs

The v2 NATS documentation site.

## Development

This is a [Next.js](https://nextjs.org/docs) site using [Tailwind CSS](https://tailwindcss.com/docs) and [Markdoc](https://markdoc.io/docs) for simplified authoring and management of Markdown-based pages.

### Setup

To get run the docs site locally, clone this repo and within the directory install the dependencies:

```bash
npm install
```

Next, run the development server:

```bash
npm run dev
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

### Structure

Notable files and directories.

- `src/toc.js` - Declares the left-side navigation as a nested markdown list.
- `src/pages` - The pages of the site. Primarily markdown files, but can be component-based pages.
- `src/components` - Components that may be used in pages, nodes, and tags.
- `markdoc/nodes` - Custom components that override Markdoc [nodes](#nodes).
- `markdoc/tags` - Custom components that define Markdoc [tags](#tags).

### Markdoc

The Markdoc configuration is under `markdoc/` and bootstrapped in `next.config.js`.

#### Nodes

The `markdoc/nodes.js` file registers custom components as [Markdoc nodes](https://markdoc.dev/docs/nodes) which override rendering the core Markdown components. For example, an `##` rendering an `h2` element. The current overrides include:

- `th` - table head cell
- `fence` - code block fence which adds syntax highlighting and a "Copy" button
- `link` - link/anchor which automatically opens a new tab/window for external links

#### Tags

The `markdoc/tags.js` file registers custom components as [Markdoc tags](https://markdoc.dev/docs/tags) using the tag syntax, `{% mytag key1=value key2=value ... /%}`. The current set includes:

##### Callout

```
{% callout title="..." type="note" /%}
```

##### Figure

```
{% figure src="..." alt="..." caption="" /%}
```

##### Embed

```
{% embed url="..." /%}
```

##### Quick Links

```
{% quick-links %}
  {% quick-link title="Idea!" description="" icon="lightbulb" href="" /%}
  {% quick-link title="Getting Started" description="" icon="installation" href="" /%}
{% /quick-links %}
```

##### Tabs

```
{% tabs %}
  {% tab title="C" %}
    ...
  {% /tab %}

  {% tab title="Go" %}
    ...
  {% /tab %}
{% /tabs %}
```

##### Version

```
{% version name="python" %}
```

Versions are sourced from `src/versions.json`.

### Redirects

The `redirects.js` file contains redirects of existing paths to the new paths. The redirect are applied in `next.config.js` along with default redirects for `readme` or `index` naming.


## TODOs

- Apply for search indexing (Docusearch)
  - Requires OSS, docs in a public repo
  - Requires the site to be live and populated
  - Will not work for developer.synadia.com
- Integrate with service to receive per-page feedback
  - Hotjar, Freddy Feedback, etc.
  - Roll our own..
- Allow "version switcher" to pin server versions?
  - Top-level widget that changes the URL
  - All pages relative to that
- Allow "client switcher" to pin code examples
  - Requires local state in the browser

