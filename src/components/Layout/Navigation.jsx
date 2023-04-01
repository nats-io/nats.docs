import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'

function LinkItem({ title, href, links = [] }) {
  let router = useRouter()

  const isOpen = (route) => {
    const getAllHrefs = ({ href, links = [] }) => [href].concat(links.map(getAllHrefs))
    return getAllHrefs({ href, links }).flat(100).includes(route)
  }

  return (
    <div>
      <li key={href} className="relative">
        <Link
          href={href}
          className={clsx(
            'block w-full pl-3.5 before:pointer-events-none before:absolute before:-left-1 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full',
            href === router.pathname
              ? 'font-semibold text-sky-500 before:bg-sky-500'
              : 'text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 hover:before:block dark:text-slate-400 dark:before:bg-slate-700 dark:hover:text-slate-300'
          )}
        >
          {title}
        </Link>
      </li>
      {links && links.length > 0 && isOpen(router.pathname) && (
        <ul role="list" className="ml-5 mt-2 space-y-2">
          {links && links.map((link, i) => <LinkItem key={i} {...link} nested={true} />)}
        </ul>
      )}
    </div>
  )
}

export function Navigation({ navigation, className }) {
  return (
    <nav className={clsx('text-base lg:text-sm', className)}>
      <ul role="list" className="space-y-9">
        {navigation.map((section) => (
          <li key={section.title}>
            <h2 className="font-display font-medium text-slate-900 dark:text-white">{section.title}</h2>
            <ul
              role="list"
              className="mt-2 space-y-2 border-l-2 border-slate-100 dark:border-slate-800 lg:mt-4 lg:space-y-4 lg:border-slate-200"
            >
              {section.links.map((link, i) => (
                <LinkItem key={i} {...link} />
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  )
}
