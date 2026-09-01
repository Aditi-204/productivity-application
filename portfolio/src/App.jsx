import { useState, useCallback } from 'react'
import IntroPortrait from './components/IntroPortrait'
import HeroScene from './components/HeroScene'
import ProjectsSection from './components/ProjectsSection'
import Footer from './components/Footer'

export default function App() {
  const [revealed, setRevealed] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  const handleReveal = useCallback(() => setRevealed(true), [])

  return (
    <div className="min-h-screen bg-butter-50 text-cocoa-800">
      {!revealed && <IntroPortrait onReveal={handleReveal} />}
      <HeroScene revealed={revealed} />
      <ProjectsSection />
      <Footer />
    </div>
  )
}