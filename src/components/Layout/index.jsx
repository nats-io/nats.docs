import Link from 'next/link'
import { useRouter } from 'next/router'
import Markdoc from '@markdoc/markdoc'

import { Navigation } from './Navigation'
import { Prose } from './Prose'
import { TableOfContents } from './TableOfContents'
import { Header } from '@/components/Header'

import tocMarkdown from '@/toc.js'

function liToLink(node) {
  const a = node.children[0]
  const ul = node.children[1]

  if (ul) {
    return {
      title: a.children[0],
      href: '/' + a.attributes.href.replace('', ''),
      links: ul.children.map(liToLink),
    }
  }

  return { title: a.children[0], href: '/' + a.attributes.href.replace('', '') }
}

function astToNavigation(ast) {
  let sections = []

  ast.children.forEach((child) => {
    switch (child.name) {
      case 'h2':
        if (child.children[0].name === 'a') {
          sections.push({ title: child.children[0] })
        } else {
          sections.push({ title: child.children[0] })
        }
        break
      case 'ul':
        if (sections.length > 0) {
          sections[sections.length - 1].links = child.children.map(liToLink)
        }
        break
      default:
        break
    }
  })

  return sections
}

// Load the table of contents and parse it into a navigation structure.
const navigation = astToNavigation(Markdoc.transform(Markdoc.parse(tocMarkdown), {}))

export function Layout({ children, title, tableOfContents, markdoc }) {
  let router = useRouter()

  const getAllLinks = (children) => children.flatMap((c) => [c].concat(getAllLinks(c.links || [])))
  const getAllHrefs = ({ href, links = [] }) => [href].concat(links.map(getAllHrefs))

  let allLinks = getAllLinks(navigation.flatMap((section) => section.links))
  let linkIndex = allLinks.findIndex((link) => link.href === router.pathname)
  let previousPage = allLinks[linkIndex - 1]
  let nextPage = allLinks[linkIndex + 1]
  let section = navigation.find((section) => {
    return section.links.flatMap(getAllHrefs).flat(100).includes(router.pathname)
  })

  return (
    <>
      <Header navigation={navigation} />

      <div className="relative mx-auto flex max-w-8xl justify-center sm:px-2 lg:px-8 xl:px-12">
        <div className="hidden lg:relative lg:block lg:flex-none">
          <div className="absolute inset-y-0 right-0 w-[50vw] bg-slate-50 dark:hidden" />
          <div className="sticky top-[4.5rem] -ml-0.5 h-[calc(100vh-4.5rem)] overflow-y-auto py-8 pl-0.5">
            <div className="absolute top-16 bottom-0 right-0 hidden h-12 w-px bg-gradient-to-t from-slate-800 dark:block" />
            <div className="absolute top-28 bottom-0 right-0 hidden w-px bg-slate-800 dark:block" />
            <Navigation navigation={navigation} className="w-48 pr-8" />
          </div>
        </div>

        <div className="min-w-0 max-w-2xl flex-auto px-4 py-8 lg:max-w-none lg:pr-0 lg:pl-8 xl:px-16">
          <article>
            {(title || section) && (
              <header className="mb-4 space-y-1">
                {section && (
                  <p className="font-display text-sm font-medium text-slate-400">{section.title}</p>
                )}
                {title && (
                  <h1 className="font-display text-3xl tracking-tight text-slate-900 dark:text-white">
                    {title}
                  </h1>
                )}
              </header>
            )}
            <Prose>{children}</Prose>
          </article>

          <dl className="mt-6 flex border-t border-slate-200 pt-6 dark:border-slate-800">
            {previousPage && (
              <div>
                <dt className="font-display text-sm font-medium text-slate-900 dark:text-white">Previous</dt>
                <dd className="mt-1">
                  <Link
                    href={previousPage.href}
                    className="text-base font-semibold text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    <span aria-hidden="true">&larr;</span> {previousPage.title}
                  </Link>
                </dd>
              </div>
            )}

            {nextPage && (
              <div className="ml-auto text-right">
                <dt className="font-display text-sm font-medium text-slate-900 dark:text-white">Next</dt>
                <dd className="mt-1">
                  <Link
                    href={nextPage.href}
                    className="text-base font-semibold text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    {nextPage.title} <span aria-hidden="true">&rarr;</span>
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </div>

        <TableOfContents toc={tableOfContents} markdoc={markdoc} />
      </div>
    </>
  )
}
