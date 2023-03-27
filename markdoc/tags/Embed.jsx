const embedURL = (url) => {
  return url.
    replace("youtube.com/watch?v=", "youtube.com/embed/").
    replace("youtu.be/", "youtube.com/embed/")
}

function Embed({children, url}) {
  return (
    <div className='w-full aspect-video'>
      <iframe
        className='w-full h-full border-none'
        src={embedURL(url)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      <span className="prose-sm text-center">
        {children}
      </span>
    </div>
  )
}

export default {
  attributes: {
    url: {type: String},
  },
  render: Embed
}
