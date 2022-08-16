export function Embed({ children, url }) {

  const embedURL = () => {
    return url.
      replace("youtube.com/watch?v=", "youtube.com/embed/").
      replace("youtu.be/", "youtube.com/embed/")
  }

  return (
    <div className='w-full aspect-video'>
      <iframe
        className='w-full h-full'
        src={embedURL()}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      <span className="prose-sm text-center">
        {children}
      </span>
    </div>
  )
}
