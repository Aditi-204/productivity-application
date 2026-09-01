/* ============================================================
   Scene composition data for the scrapbook landing page.
   Every object is an offset (--dx, --dy in vw/vh) from the
   portrait center at (50vw, 55vh). It flies out from behind the
   portrait when the scene is revealed.

   Fields:
   - node:          element to render
   - dx, dy         flight/landing offset (vw, vh) from portrait center
   - rot / srot     final / starting rotation (deg)
   - dur, delay     entrance animation timing (s)
   - depth          parallax layer: 'far' | 'mid' | 'near'
   - drift          gentle idle float vars
   - hide           hide on small screens (avoids clutter)
   ============================================================ */

import {
  PlaneSVG,
  GridNoteSVG,
  BobaSVG,
  NotebooksSVG,
  LaptopSVG,
  PaletteSVG,
  PencilSVG,
  UiCardSVG,
  PinsSVG,
  DoodleStarSVG,
  HeartClipSVG,
  ChipSVG,
  CoilSVG,
  DoodleStarGrid,
} from '../components/DecorativeElements.jsx'

export const sceneObjects = [
  /* ---- personality labels (serif italic) ---- */
  {
    id: 'label-builder',
    depth: 'near',
    dx: '-46vw',
    dy: '-6vh',
    rot: -5,
    srot: -24,
    dur: 1.05,
    delay: 0.28,
    drift: true,
    node: (
      <p className="m-0 font-display text-2xl italic text-cocoa-800 sm:text-4xl lg:text-[2.6rem] leading-tight text-right rotate-[-4deg]">
        Builder
        <br />
        <span className="text-[0.72em] font-normal">at heart</span>
      </p>
    ),
  },
  {
    id: 'label-creative',
    depth: 'near',
    node: (
      <p className="m-0 font-display text-2xl italic text-cocoa-800 sm:text-4xl lg:text-[2.6rem] leading-tight rotate-[3deg]">
        Creative
        <br />
        <span className="text-[0.72em] font-normal">soul</span>
      </p>
    ),
    dx: '-34vw',
    dy: '18vh',
    rot: 4,
    srot: 22,
    dur: 1.1,
    delay: 0.42,
    drift: true,
  },
  {
    id: 'label-curious',
    depth: 'mid',
    node: (
      <p className="m-0 font-display text-[1.6rem] italic text-cocoa-800 sm:text-3xl lg:text-4xl leading-tight rotate-[6deg]">
        Curious<span className="text-cocoa-500"> mind</span>
      </p>
    ),
    dx: '36vw',
    dy: '0vh',
    rot: 6,
    srot: 20,
    dur: 1.05,
    delay: 0.5,
    drift: true,
  },

  /* ---- paper airplane, top-right of portrait ---- */
  {
    id: 'plane',
    node: <PlaneSVG size={92} />,
    dx: '26vw',
    dy: '-19vh',
    rot: -12,
    srot: 30,
    dur: 1.25,
    delay: 0.36,
    drift: true,
  },

  /* ---- corners & scattered treasures ---- */
  {
    id: 'gridnote',
    node: <GridNoteSVG />,
    dx: '-38vw',
    dy: '-31vh',
    rot: -6,
    srot: -20,
    dur: 1.2,
    delay: 0.3,
    hide: true,
  },
  {
    id: 'dots',
    node: <DoodleStarGrid />,
    dx: '-16vw',
    dy: '-26vh',
    rot: 0,
    dur: 0.9,
    delay: 0.26,
  },
  {
    id: 'boba',
    node: <BobaSVG size={118} />,
    dx: '-42vw',
    dy: '22vh',
    rot: -6,
    srot: 18,
    dur: 1.2,
    delay: 0.46,
    hide: true,
    drift: true,
  },
  {
    id: 'pencil',
    node: <PencilSVG size={88} />,
    dx: '-13vw',
    dy: '20vh',
    rot: -16,
    srot: 26,
    dur: 1.0,
    delay: 0.5,
    drift: true,
  },
  {
    id: 'palette',
    node: <PaletteSVG size={84} />,
    dx: '-30vw',
    dy: '-10vh',
    rot: -8,
    srot: 20,
    dur: 1.0,
    delay: 0.6,
    hide: true,
  },
  {
    id: 'notebooks',
    node: <NotebooksSVG size={132} />,
    dx: '36vw',
    dy: '25vh',
    rot: 6,
    srot: -16,
    dur: 1.25,
    delay: 0.55,
    hide: true,
    drift: true,
  },
  {
    id: 'laptop',
    node: <LaptopSVG size={126} />,
    dx: '16vw',
    dy: '27vh',
    rot: 2,
    srot: -14,
    dur: 1.3,
    delay: 0.66,
    drift: true,
  },
  {
    id: 'uicard',
    node: <UiCardSVG size={86} />,
    dx: '3vw',
    dy: '-24vh',
    rot: 3,
    srot: -20,
    dur: 1.05,
    delay: 0.5,
    hide: true,
  },
  {
    id: 'pins',
    node: <PinsSVG size={64} />,
    dx: '43vw',
    dy: '-10vh',
    rot: 6,
    srot: 24,
    dur: 1.0,
    delay: 0.6,
    hide: true,
  },
  {
    id: 'chip',
    node: <ChipSVG size={62} />,
    dx: '-7vw',
    dy: '-22vh',
    rot: 4,
    dur: 0.95,
    delay: 0.34,
    hide: true,
  },
  {
    id: 'coil',
    node: <CoilSVG size={78} />,
    dx: '21vw',
    dy: '14vh',
    rot: 8,
    dur: 1.1,
    delay: 0.72,
    hide: true,
  },
  {
    id: 'star',
    node: <DoodleStarSVG size={40} />,
    dx: '-24vw',
    dy: '6vh',
    rot: 12,
    dur: 0.9,
    delay: 0.5,
  },
  {
    id: 'heartclip',
    node: <HeartClipSVG size={40} />,
    dx: '29vw',
    dy: '9vh',
    rot: -8,
    dur: 0.95,
    delay: 0.7,
    hide: true,
  },
]

export default sceneObjects