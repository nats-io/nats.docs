import versions from '@/versions.json'

function Version({ name }) {
  const version = versions[name] || ''
  return <>{version}</>
}

export default {
  selfClosing: true,
  render: Version,
  attributes: {
    name: { type: String },
  },
}
