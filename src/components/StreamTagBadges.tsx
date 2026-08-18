import { streamTagDisplay } from '../utils/streamTags'

interface StreamTagBadgesProps {
  tags: string[]
}

export default function StreamTagBadges({ tags }: StreamTagBadgesProps) {
  if (tags.length === 0) return null

  return (
    <>
      {tags.map(tag => {
        const { label, variant } = streamTagDisplay(tag)
        return (
          <span key={tag} className={`badge badge-stream badge-stream--${variant}`}>
            {label}
          </span>
        )
      })}
    </>
  )
}
