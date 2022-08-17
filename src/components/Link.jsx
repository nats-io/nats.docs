export function Link({ href, title, children }) {

  const props = { href, title }

  if (href.startsWith("http")) {
    props.target = "_blank"
  }

  return (
    <a {...props}>{children}</a>
  )
}
