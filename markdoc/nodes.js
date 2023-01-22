import {Fence} from '@/components/Fence'
import {Link} from '@/components/Link'
import {nodes as defaultNodes} from '@markdoc/markdoc'

const nodes = {
  document: {
    render: undefined,
  },
  th: {
    ...defaultNodes.th,
    attributes: {
      ...defaultNodes.th.attributes,
      scope: {
        type: String,
        default: 'col',
      },
    },
  },
  fence: {
    render: Fence,
    attributes: {
      language: {
        type: String,
      },
    },
  },
  link: {
    ...defaultNodes.link,
    render: Link
  }
}

export default nodes
