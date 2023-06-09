function Tab({ children }) {
  return children
}

export default {
  render: Tab,
  attributes: {
    name: { type: String },
  },
}
