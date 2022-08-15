import Head from 'next/head'
import { slugifyWithCounter } from '@sindresorhus/slugify'

import { Layout } from '@/components/Layout'

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

function collectHeadings(nodes, slugify = slugifyWithCounter()) {
  let sections = []

  for (let node of nodes) {
    if (node.name === 'h2' || node.name === 'h3') {
      let title = getNodeText(node)
      if (title) {
        let id = slugify(title)
        node.attributes.id = id
        if (node.name === 'h3') {
          if (!sections[sections.length - 1]) {
            throw new Error(
              'Cannot add `h3` to table of contents without a preceding `h2`'
            )
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

function getHeadingTitle(nodes) {
  for (let node of nodes) {
    if (node.name === 'h1') {
      return getNodeText(node)
    }
  }
}

function getDescription(nodes) {
  for (let node of nodes) {
    if (node.name === 'p') {
      return getNodeText(node)
    }
  }
}

export default function App({ Component, pageProps }) {
  let title = pageProps.markdoc?.frontmatter.title ||
    getHeadingTitle(pageProps.markdoc.content)

  let pageTitle = title

  let description = getDescription(pageProps.markdoc.content)

  let tableOfContents = pageProps.markdoc?.content
    ? collectHeadings(pageProps.markdoc.content)
    : []

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        {description && <meta name="description" content={description} />}
      </Head>
      <Layout tableOfContents={tableOfContents}>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}
