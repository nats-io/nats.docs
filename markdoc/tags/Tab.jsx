import { useContext } from 'react'

import { TabContext } from './Tabs'

function Tab({ children, title }) {
  const currentTab = useContext(TabContext)
  return title !== currentTab ? null : children
}

export default {
  render: Tab,
  attributes: {
    title: { type: String },
  },
}
