import Head from 'next/head'
import { slugifyWithCounter } from '@sindresorhus/slugify'
import { Layout } from '@/components/Layout'
import { GlobalProvider } from '@/contexts/global'

import 'focus-visible'
import '@/styles/tailwind.css'

function getNodeText(node) {
  let text = ''
  for (let child of node.children ?? []) {
    if (typeof child === 'string') {
      text += child
    }
    text += getNodeText(child)
  }
  return text
}

// collectHeadings is a recursive function that collects all headings from the
// page in order to build a table of contents.
function collectHeadings(nodes = [], slugify = slugifyWithCounter()) {
  let sections = []

  for (let node of nodes) {
    if (node.name === 'h2' || node.name === 'h3') {
      let title = getNodeText(node)
      if (title) {
        let id = slugify(title)
        node.attributes.id = id
        if (node.name === 'h3') {
          if (!sections[sections.length - 1]) {
            throw new Error('Cannot add `h3` to table of contents without a preceding `h2`')
          }
          sections[sections.length - 1].children.push({
            ...node.attributes,
            title,
          })
        } else {
          sections.push({ ...node.attributes, title, children: [] })
        }
      }
    }

    sections.push(...collectHeadings(node.children ?? [], slugify))
  }

  return sections
}

// Fallback to get the title from the first `h1` tag
// if not defined in the frontmatter.
function getHeadingTitle(nodes = []) {
  for (let node of nodes) {
    if (node.name === 'h1') {
      return getNodeText(node)
    }
  }
}

// Fallback to get the description from the first `p` tag
// if not defined in the frontmatter.
function getDescription(nodes = []) {
  for (let node of nodes) {
    if (node.name === 'p') {
      return getNodeText(node)
    }
  }
}

export default function App({ Component, pageProps }) {
  const frontmatter = pageProps.markdoc?.frontmatter || {}
  const children = pageProps.markdoc?.content?.children

  let title = frontmatter.title || getHeadingTitle(children)

  let description = frontmatter.description || getDescription(children)

  let tableOfContents = collectHeadings(children)

  return (
    <>
      <Head>
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
      </Head>
      <GlobalProvider>
        <Layout tableOfContents={tableOfContents} markdoc={pageProps.markdoc}>
          <Component {...pageProps} />
        </Layout>
      </GlobalProvider>
    </>
  )
}
