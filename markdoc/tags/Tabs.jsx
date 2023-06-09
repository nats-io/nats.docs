import clsx from 'clsx'
import { useState } from 'react'

export function Tabs({ children, tab, setTab }) {
  const names = children.map((child) => child.props.name)

  if (!setTab) {
    ;[tab, setTab] = useState(names[0])
  }

  const styles = {
    base: 'inline-block p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300',
    selected:
      'inline-block p-4 text-blue-600 rounded-t-lg border-b-2 border-blue-600 active dark:text-blue-500 dark:border-blue-500',
  }

  return (
    <div className="border-b border-gray-200 text-center text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">
      <ul role="tablist" className="-mb-px flex list-none flex-wrap p-0">
        {children.map((child) => (
          <li key={child.props.name}>
            <button
              className={clsx(tab === child.props.name ? styles.selected : styles.base)}
              role="tab"
              onClick={() => setTab(child.props.name)}
            >
              {child.props.name}
            </button>
          </li>
        ))}
      </ul>

      <div className="-mt-4 text-left">
        {children.map((child) => (child.props.name === tab ? child : null))}
      </div>
    </div>
  )
}

export default {
  render: Tabs,
}
