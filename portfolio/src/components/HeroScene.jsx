import { useEffect, useRef } from 'react'
import portrait from '../assets/portrait.svg'
import sceneObjects from '../data/sceneConfig.jsx'
import FloatingObject from './FloatingObject'

export default function HeroScene({ revealed }) {
  const rootRef = useRef(null)
  const open = useRef(false)

  /* trigger the reveal choreography after mount */
  useEffect(() => {
    if (!revealed || open.current) return
    open.current = true
    const id = requestAnimationFrame(() => {
      rootRef.current?.classList.add('is-open')
    })
    return () => cancelAnimationFrame(id)
  }, [revealed])

  /* gentle mouse parallax (desktop pointer only, after reveal) */
  useEffect(() => {
    if (!revealed) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !window.matchMedia('(pointer: fine)').matches) return

    let raf = 0
    const onMove = (e) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const x = (e.clientX / window.innerWidth - 0.5) * 2
        const y = (e.clientY / window.innerHeight - 0.5) * 2
        const el = rootRef.current
        if (!el) return
        el.style.setProperty('--shift-x-far', `${-12 * x}px`)
        el.style.setProperty('--shift-y-far', `${-12 * y}px`)
        el.style.setProperty('--shift-x-mid', `${-22 * x}px`)
        el.style.setProperty('--shift-y-mid', `${-22 * y}px`)
        el.style.setProperty('--shift-x-near', `${-34 * x}px`)
        el.style.setProperty('--shift-y-near', `${-34 * y}px`)
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [revealed])

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero-scene" ref={rootRef} aria-label="Aditi Mahajan, builder at heart">
      <div className="scene-vignette" aria-hidden="true" />

      {/* Name — nothing above it */}
      <h1 className="hero-title font-display text-[clamp(3rem,11vw,7.5rem)] font-normal text-cocoa-800 select-none">
        Aditi&nbsp;Mahajan
        <svg className="title-underline" viewBox="0 0 460 34" aria-hidden="true">
          <path
            className="doodle"
            d="M4 20 C120 6 260 4 398 16 C426 19 448 22 456 27"
          />
          <path
            className="doodle"
            d="M20 30 C120 22 250 24 380 31"
            opacity="0.65"
          />
        </svg>
      </h1>

      {/* flight hub — everything orbits the portrait centre */}
      <div className="obj-hub reticle" aria-hidden="true">
        {sceneObjects.map((obj) => (
          <FloatingObject key={obj.id} obj={obj} />
        ))}
      </div>

      {/* portrait — the steady centre */}
      <div className="portrait hero-portrait reticle">
        <img src={portrait} alt="" className="portrait-breathe" draggable="false" />
      </div>

      {/* enter my world */}
      <button
        type="button"
        onClick={scrollToProjects}
        className="enter-world m-0"
      >
        Enter My World
      </button>
    </section>
  )
}