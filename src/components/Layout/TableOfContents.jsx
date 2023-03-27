import {useCallback, useEffect, useState} from 'react'
import Link from 'next/link'
import clsx from 'clsx';


function githubLink(markdoc) {
  if (markdoc) {
    // TODO: change this to master when we move to production
    return "https://github.com/nats-io/nats.docs/edit/JMS-NATS-Docs-2.0/src/pages/" + markdoc.file.path
  } else {
    return "https://github.com/nats-io/nats.docs"
  }
}



function useTableOfContents(tableOfContents) {
  let [currentSection, setCurrentSection] = useState(tableOfContents[0]?.id)

  let getHeadings = useCallback((tableOfContents) => {
    return tableOfContents
      .flatMap((node) => [node.id, ...node.children.map((child) => child.id)])
      .map((id) => {
        let el = document.getElementById(id)
        if (!el) return

        let style = window.getComputedStyle(el)
        let scrollMt = parseFloat(style.scrollMarginTop)

        let top = window.scrollY + el.getBoundingClientRect().top - scrollMt
        return {id, top}
      })
  }, [])

  useEffect(() => {
    if (tableOfContents.length === 0) return
    let headings = getHeadings(tableOfContents)
    function onScroll() {
      let top = window.scrollY
      let current = headings[0].id
      for (let heading of headings) {
        if (top >= heading.top) {
          current = heading.id
        } else {
          break
        }
      }
      setCurrentSection(current)
    }
    window.addEventListener('scroll', onScroll, {passive: true})
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll, {passive: true})
    }
  }, [getHeadings, tableOfContents])

  return currentSection
}

export function TableOfContents({toc, markdoc}) {
  let currentSection = useTableOfContents(toc)

  function isActive(section) {
    if (section.id === currentSection) {
      return true
    }
    if (!section.children) {
      return false
    }
    return section.children.findIndex(isActive) > -1
  }

  return (
    <div className="hidden xl:sticky xl:top-[4.5rem] xl:-mr-6 xl:block xl:h-[calc(100vh-4.5rem)] xl:flex-none xl:overflow-y-auto xl:py-8">
      <nav className={clsx('w-56 text-base lg:text-sm')}>
        <ul className="space-y-9">
          {toc.length > 0 && (
            <li>
              <h4 className="font-display font-medium text-slate-900 dark:text-white">Contents</h4>
              <ol role="list" className="mt-2 space-y-2 border-l-2 border-slate-100 dark:border-slate-800 lg:mt-4 lg:border-slate-200">
                {toc.map((section) => (
                  <li key={section.id}
                    className={clsx(
                      'block w-full pl-3.5 before:pointer-events-none before:absolute before:-left-1 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 hover:before:block dark:text-slate-400 dark:before:bg-slate-700 dark:hover:text-slate-300'
                    )}

                  >
                    <h3>
                      <Link
                        href={`#${section.id}`}
                        className={clsx(
                          'font-normal text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        )}
                      >
                        {section.title}
                      </Link>
                    </h3>
                    {section.children.length > 0 && (
                      <ol
                        role="list"
                        className="mt-2 space-y-3 pl-5 text-slate-500 dark:text-slate-400"
                      >
                        {section.children.map((subSection) => (
                          <li key={subSection.id}>
                            <Link
                              href={`#${subSection.id}`}
                              className={clsx(
                                'font-normal text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                              )}
                            >
                              {subSection.title}
                            </Link>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                ))}
              </ol>
            </li>
          )}

          <li>
            <h4 className="font-display font-medium text-slate-900 dark:text-white">Contribute</h4>
            <ol role="list" className="mt-2 space-y-2 border-l-2 border-slate-100 dark:border-slate-800 lg:mt-4 lg:border-slate-200">
              <li>
                <a
                  className={clsx(
                    'block w-full pl-3.5 before:pointer-events-none before:absolute before:-left-1 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 hover:before:block dark:text-slate-400 dark:before:bg-slate-700 dark:hover:text-slate-300'
                  )}
                  href={githubLink(markdoc)}>
                  Improve this page
                </a>
              </li>
              <li>
                <a
                  className={clsx(
                    'block w-full pl-3.5 before:pointer-events-none before:absolute before:-left-1 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 hover:before:block dark:text-slate-400 dark:before:bg-slate-700 dark:hover:text-slate-300'
                  )}
                  href={githubLink(markdoc)}>
                  Give us feedback
                </a>
              </li>
            </ol>
          </li>

          <li>
            <h4 className="font-display font-medium text-slate-900 dark:text-white">Community</h4>
            <ol role="list" className="mt-2 space-y-2 border-l-2 border-slate-100 dark:border-slate-800 lg:mt-4 lg:border-slate-200">
              <li>
                <a
                  className={clsx(
                    'block w-full pl-3.5 before:pointer-events-none before:absolute before:-left-1 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 hover:before:block dark:text-slate-400 dark:before:bg-slate-700 dark:hover:text-slate-300'
                  )}

                  href="https://slack.nats.io">
                  Join us on Slack
                </a>
              </li>
            </ol>
          </li>
        </ul>

      </nav>
    </div >
  )
}
