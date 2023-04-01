import clsx from 'clsx'
import { createContext, useState } from 'react'

export const TabContext = createContext()

export function Tabs({ children }) {
  const titles = children.map((child) => child.props.title)
  const [currentTab, setCurrentTab] = useState(titles[0])

  const styles = {
    base: 'inline-block p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300',
    selected:
      'inline-block p-4 text-blue-600 rounded-t-lg border-b-2 border-blue-600 active dark:text-blue-500 dark:border-blue-500',
  }

  return (
    <TabContext.Provider value={currentTab}>
      <div className="border-b border-gray-200 text-center text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">
        <ul role="tablist" className="-mb-px flex list-none flex-wrap p-0">
          {children.map((child) => (
            <li key={child.props.title}>
              <button
                className={clsx(currentTab === child.props.title ? styles.selected : styles.base)}
                role="tab"
                onClick={() => setCurrentTab(child.props.title)}
              >
                {child.props.title}
              </button>
            </li>
          ))}
        </ul>

        <div className="-mt-4 text-left">{children}</div>
      </div>
    </TabContext.Provider>
  )
}

export default {
  render: Tabs,
}
