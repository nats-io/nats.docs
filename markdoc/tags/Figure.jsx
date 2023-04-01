import clsx from 'clsx'

function Figure({ src, alt, caption, className }) {
  return (
    <figure className="text-center">
      <img className={clsx('m-0 m-auto', className)} src={src} alt={alt} />
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

export default {
  selfClosing: true,
  attributes: {
    src: { type: String },
    alt: { type: String },
    caption: { type: String },
    className: { type: String },
  },
  render: Figure,
}
