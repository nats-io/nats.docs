import {Callout} from '@/components/Callout'
import {Embed} from '@/components/Embed'
import {QuickLink, QuickLinks} from '@/components/QuickLinks'
import {Tab, Tabs} from '@/components/Tabs'

const tags = {
  callout: {
    attributes: {
      title: {type: String},
      type: {
        type: String,
        default: 'note',
        matches: ['note', 'warning'],
        errorLevel: 'critical',
      },
    },
    render: Callout,
  },
  figure: {
    selfClosing: true,
    attributes: {
      src: {type: String},
      alt: {type: String},
      caption: {type: String},
    },
    render: ({src, alt = '', caption}) => (
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} />
        <figcaption>{caption}</figcaption>
      </figure>
    ),
  },
  embed: {
    attributes: {
      url: {type: String},
    },
    render: Embed
  },
  'quick-links': {
    render: QuickLinks,
  },
  'quick-link': {
    selfClosing: true,
    render: QuickLink,
    attributes: {
      title: {type: String},
      description: {type: String},
      icon: {type: String},
      href: {type: String},
    },
  },
  tabs: {
    render: Tabs
  },
  tab: {
    render: Tab,
    attributes: {
      title: {type: String}
    },
  }
}

export default tags
