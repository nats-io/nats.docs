import { nodes as defaultNodes } from '@markdoc/markdoc'

export default {
  ...defaultNodes.th,
  attributes: {
    ...defaultNodes.th.attributes,
    scope: {
      type: String,
      default: 'col',
    },
  },
}
