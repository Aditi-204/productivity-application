/* ============================================================
   DecorativeElements — reusable hand-drawn / paper-cutout
   scrapbook doodles. Each accepts a `size` so it can sit at
   different scales across the page.

   Everything is drawn from scratch in the butter-cream + dark
   chocolate family. No stock imagery, no random sticker colors.
   ============================================================ */

const ink = '#3E2D23'
const inkSoft = '#6B4F3A'
const paper = '#F7F0DC'
const bright = '#FFFDF2'
const cocoa = '#54361F'

export function PlaneSVG({ size }) {
  return (
    <svg width={size} height={(size * 0.62).toFixed(1)} viewBox="0 0 120 75">
      <path
        d="M6 56 L114 12 C116 10 119 13 117 16 L70 64 C68 67 64 64 65 60 L74 38 L8 54 C4 54 3 57 6 56 Z"
        fill={bright}
        stroke={cocoa}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M14 58 L44 40"
        stroke={ink}
        strokeWidth="2"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function GridNoteSVG() {
  return (
    <div className="relative w-[150px]" style={{ aspectRatio: '4 / 3' }}>
      <span
        className="tape -top-3 left-1/2 w-20"
        style={{ transform: 'translateX(-50%) rotate(3deg)' }}
      />
      <div
        className="grid-paper h-full w-full p-3"
        style={{ border: '1px solid rgba(62,45,35,.28)' }}
      >
        <span className="block font-hand text-sm leading-snug text-cocoa-600">
          ideas told in sketches...
          lines, glue &amp; plain curiosity
        </span>
        <span className="absolute bottom-2 right-3 font-hand text-[11px] italic text-cocoa-500">
          — A
        </span>
      </div>
    </div>
  )
}

export function BobaSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <ellipse cx="60" cy="92" rx="36" ry="8" fill="rgba(62,45,35,0.14)" />
      <path
        d="M34 44 C34 22 70 22 70 44 L70 80 C70 94 40 94 40 80 C40 40 36 48 34 44 Z"
        fill="#F2E0BC"
      />
      <path
        d="M34 66 L34 80 C34 96 70 96 70 80 L70 66 C58 84 42 84 34 66 Z"
        fill="#E3C98F"
      />
      <circle cx="46" cy="78" r="7" fill="#8A6844" />
      <circle cx="62" cy="88" r="7" fill="#8A6844" />
      <circle cx="46" cy="94" r="7" fill="#8A6844" />
      <circle cx="62" cy="100" r="7" fill="#8A6844" />
      <path d="M60 16 L62 34" stroke={inkSoft} strokeWidth="3.4" strokeLinecap="round" />
      <path
        d="M64 22 L72 30 L78 28"
        stroke={inkSoft}
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="86" cy="24" r="3.4" fill="#CDB57F" />
      <circle cx="59" cy="30" r="2.6" fill="#CDB57F" />
    </svg>
  )
}

export function NotebooksSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 140 122">
      <g transform="rotate(-3 70 60)">
        <rect x="10" y="58" width="122" height="40" rx="5" fill="#EADFBE" stroke={cocoa} strokeWidth="2.6" />
        <rect x="10" y="40" width="112" height="40" rx="5" fill="#F2E8C9" stroke={cocoa} strokeWidth="2.6" />
        <path d="M20 50 L20 92 M134 50 L134 92" stroke={inkSoft} strokeWidth="2" opacity="0.5" />
        <path d="M32 52 L52 52 M62 52 L62 42 L124 42 L124 60" stroke={inkSoft} strokeWidth="2" fill="none" opacity="0.7" />
        <circle cx="62" cy="40" r="4" fill={cocoa} />
      </g>
    </svg>
  )
}

export function LaptopSVG({ size }) {
  return (
    <svg width={size} height={(size * 0.7).toFixed(1)} viewBox="0 0 160 112">
      <rect x="26" y="16" width="104" height="70" rx="6" fill={bright} stroke={cocoa} strokeWidth="3" />
      <rect x="36" y="24" width="84" height="52" rx="3" fill="#F1E7C8" />
      <circle cx="78" cy="50" r="10" fill="none" stroke={inkSoft} strokeWidth="2" />
      <path d="M84 44 L70 58 M76 44 L62 56" stroke={inkSoft} strokeWidth="2" strokeLinecap="round" />
      <rect x="60" y="34" width="6" height="6" fill={cocoa} opacity="0.5" />
      <rect x="92" y="34" width="6" height="6" fill={cocoa} opacity="0.5" />
      <path
        d="M10 90 L142 90 L124 104 C121 106 29 106 28 104 Z"
        fill="#E3CE9D"
        stroke={cocoa}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M10 90 C40 96 110 96 142 88" stroke={cocoa} strokeWidth="1.6" strokeDasharray="3 3" />
    </svg>
  )
}

export function PaletteSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <g transform="rotate(-14 60 60)">
        <circle cx="60" cy="62" r="42" fill={paper} stroke={cocoa} strokeWidth="3" />
        <rect x="104" y="56" width="26" height="12" rx="6" fill={paper} stroke={cocoa} strokeWidth="2" />
        <circle cx="40" cy="52" r="8" fill="#C98A53" />
        <circle cx="62" cy="38" r="8" fill="#8A6844" />
        <circle cx="82" cy="66" r="8" fill="#E3C98F" />
        <circle cx="40" cy="84" r="8" fill="#A87B57" />
        <path
          d="M150 58 L156 76 L142 44 L156 76 L138 80"
          stroke={ink}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={ink}
        />
      </g>
    </svg>
  )
}

export function PencilSVG({ size }) {
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 120 110">
      <g transform="rotate(-32 60 55)">
        <rect x="34" y="6" width="52" height="14" rx="2" fill="#D9BE82" stroke={cocoa} strokeWidth="2.4" />
        <path d="M34 20 L34 74 L86 74 L86 20 Z" fill="#EAD9AB" stroke={cocoa} strokeWidth="2.4" />
        <path d="M60 20 L60 74" stroke={cocoa} strokeWidth="2" opacity="0.4" />
        <path d="M34 74 L44 96 L60 74 Z" fill="#8A6844" />
        <path d="M44 96 L52 84 Z" fill="#6B4F3A" />
        <path d="M60 90 L72 74 Z" fill="#6B4F3A" />
        <path d="M40 74 L52 60 M64 60 L76 74" stroke={cocoa} strokeWidth="1.6" opacity="0.45" />
      </g>
    </svg>
  )
}

export function UiCardSVG({ size }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 130 108">
      <g transform="rotate(6 65 54)">
        <rect x="12" y="8" width="106" height="82" rx="6" fill={bright} stroke={cocoa} strokeWidth="3" />
        <rect x="12" y="8" width="106" height="16" rx="6" fill="#E9DCB4" stroke={cocoa} strokeWidth="3" />
        <circle cx="24" cy="16" r="4" fill={cocoa} />
        <circle cx="34" cy="16" r="4" fill={cocoa} />
        <circle cx="44" cy="16" r="4" fill={cocoa} />
        <rect x="22" y="32" width="34" height="8" rx="4" fill="#CDA96B" />
        <rect x="22" y="46" width="62" height="8" rx="4" fill="#E2D0A6" />
        <rect x="22" y="60" width="46" height="8" rx="4" fill="#E2D0A6" />
        <circle cx="78" cy="52" r="16" fill={paper} stroke={cocoa} strokeWidth="2.4" />
        <path d="M72 56 C76 62 86 62 88 52" stroke={ink} strokeWidth="2" fill="none" />
      </g>
    </svg>
  )
}

export function PinsSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <g stroke={cocoa} strokeWidth="2.6" strokeLinecap="round">
        <circle cx="30" cy="30" r="8" fill="#CDA96B" />
        <path d="M30 38 L30 62 M30 52 L46 38" />
        <circle cx="82" cy="46" r="8" fill="#E3C98F" />
        <path d="M82 54 L82 78 M82 68 L98 54" />
        <circle cx="48" cy="88" r="8" fill="#C98A53" />
        <path d="M48 96 L48 108 M48 102 L62 96" />
      </g>
    </svg>
  )
}

export function DoodleStarSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <path
        d="M12 30 L24 24 L30 12 L36 24 L48 30 L36 36 L30 48 L24 36 Z"
        fill={paper}
        stroke={cocoa}
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function HeartClipSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <path
        d="M40 70 C18 50 8 34 12 22 C16 12 30 10 40 22 C50 10 64 12 68 22 C72 34 62 50 40 70 Z"
        fill="#E3C98F"
        stroke={cocoa}
        strokeWidth="3"
      />
    </svg>
  )
}

export function ChipSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="22" y="34" width="56" height="56" rx="8" fill="#E4CE98" stroke={cocoa} strokeWidth="3" />
      <rect x="22" y="34" width="56" height="20" rx="8" fill="#D8BE80" stroke={cocoa} strokeWidth="3" />
      <path d="M50 34 L50 90 M22 62 L78 62" stroke={cocoa} strokeWidth="2.4" opacity="0.7" />
      {[0, 1, 2].map((i) => (
        <line key={`tl${i}`} x1={30 + i * 12} y1="34" x2={32 + i * 12} y2="24" stroke={cocoa} strokeWidth="3" strokeLinecap="round" />
      ))}
      {[0, 1, 2].map((i) => (
        <line key={`tr${i}`} x1={86 - i * 12} y1="34" x2={88 - i * 12} y2="24" stroke={cocoa} strokeWidth="3" strokeLinecap="round" />
      ))}
    </svg>
  )
}

export function CoilSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <path
        d="M60 20 C40 20 30 34 30 52 C30 72 44 84 60 84 C76 84 84 70 84 58 C84 44 74 38 62 38 C52 38 44 44 44 54"
        fill="none"
        stroke={cocoa}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M18 90 C12 98 16 104 22 102 M30 106 C24 114 12 112 10 104"
        stroke={cocoa}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  )
}

/* hand-drawn star cluster / paper bits (grouped doodle) */
export function DoodleStarGrid() {
  return (
    <svg width={84} height={48} viewBox="0 0 120 70">
      <path d="M10 20 L20 20" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      <path d="M8 24 L20 24" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      <path d="M64 12 C70 6 78 6 80 14" stroke={ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M104 30 C100 22 92 22 90 30" stroke={ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="36" cy="16" r="3" fill={cocoa} />
      <circle cx="110" cy="56" r="3" fill={cocoa} />
      <path d="M86 8 L90 12 M92 4 L96 8 M84 2 L86 4" stroke={inkSoft} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}