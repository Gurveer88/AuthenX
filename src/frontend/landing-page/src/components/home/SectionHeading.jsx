function SectionHeading({ id, eyebrow, title, description }) {
  return (
    <div id={id} className="mb-6 md:mb-8">
      {eyebrow ? (
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-white/60">{eyebrow}</p>
      ) : null}
      <h2 className="text-2xl leading-tight md:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-3 max-w-3xl text-sm text-white/70 md:text-base">{description}</p>
      ) : null}
    </div>
  )
}

export default SectionHeading
