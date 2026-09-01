import { useEffect, useRef, useState } from 'react'
import portrait from '../assets/portrait.svg'

export default function IntroPortrait({ onReveal }) {
  const [exiting, setExiting] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const reveal = () => {
    setExiting(true)
    timer.current = setTimeout(onReveal, 560)
  }

  return (
    <div className={`intro-portrait ${exiting ? 'exiting' : ''}`} aria-hidden={exiting}>
      <button
        type="button"
        onClick={reveal}
        onKeyDown={(e) => e.key === 'Enter' && reveal()}
        className="portrait outline-none rounded-full transition-transform duration-300 hover:scale-[1.04] active:scale-95"
        aria-label="Open my world — click to explore"
      >
        <img
          src={portrait}
          alt="Aditi, illustrated portrait wearing headphones"
          className="intro-img select-none"
          draggable="false"
        />
      </button>
      <p className="click-here m-0">✦ click to explore ✦</p>
    </div>
  )
}