import { useContext } from 'react'

import { GlobalContext } from '@/contexts/global'
import { Tabs } from './Tabs'

export function Example(props) {
  const { client, setClient } = useContext(GlobalContext)
  return <Tabs {...props} tab={client} setTab={setClient} />
}

export default {
  render: Example,
}
