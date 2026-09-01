export default function ProjectsSection() {
  const projects = [
    {
      title: 'WorkTrack',
      tag: 'productivity · full-stack',
      blurb:
        'A warm task, attendance and EOD tool for teams — React, Tailwind, Node.js and MongoDB. Built to make the daily grind feel a little lighter.',
      status: 'in progress',
    },
    {
      title: 'Scrapbook Portfolio',
      tag: 'design · interaction',
      blurb:
        'This very page — a handmade collage of doodles, person that gets built in two stages. Everything is drawn, nothing is templated.',
      status: 'live',
    },
    {
      title: 'Next sketch …',
      tag: 'ideas on paper',
      blurb: 'Reserved in the corner of a sketchbook for whatever idea refuses to quiet down.',
      status: 'coming soon',
    },
  ]

  return (
    <section id="projects" className="projects-section relative min-h-[80vh] bg-butter-50 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 flex items-end justify-between gap-4">
          <div>
            <p className="m-0 font-hand text-lg italic text-cocoa-500">the shelf</p>
            <h2 className="m-0 font-display text-4xl font-normal text-cocoa-800 sm:text-6xl">
              Projects
              <svg className="mt-2 block w-56 max-w-full" viewBox="0 0 220 20" aria-hidden="true">
                <path className="doodle" d="M4 12 C80 4 170 4 216 10" />
              </svg>
            </h2>
          </div>
          <p className="hidden max-w-[220px] text-right font-hand text-sm italic leading-snug text-cocoa-500 sm:block">
            made with paper, coffee type dark chocolate &amp; too many sticky notes
          </p>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <li key={p.title}>
              <article
                className={`relative h-full rounded-[6px] border border-cocoa-700/25 bg-butter-100 p-6 shadow-[0_10px_24px_-12px_rgba(62,45,35,0.28)] ${
                  i % 2 === 0 ? 'sm:rotate-[-0.6deg]' : 'sm:rotate-[0.5deg]'
                }`}
              >
                <span
                  className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 bg-butter-200/80"
                  style={{ border: '1px dashed rgba(62,45,35,0.3)', boxShadow: '0 2px 6px rgba(62,45,35,0.1)' }}
                  aria-hidden="true"
                />
                <p className="m-0 mb-2 font-hand text-xs uppercase tracking-wide text-cocoa-500">
                  {p.tag}
                </p>
                <h3 className="m-0 mb-3 font-display text-2xl font-normal text-cocoa-800">
                  {p.title}
                </h3>
                <p className="m-0 mb-5 text-lg leading-relaxed text-cocoa-600">{p.blurb}</p>
                <span className="inline-block rounded-full border border-cocoa-600/40 px-3 py-1 font-hand text-xs italic text-cocoa-600">
                  ✧ {p.status}
                </span>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}