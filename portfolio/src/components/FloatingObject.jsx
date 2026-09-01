export default function FloatingObject({ obj }) {
  const {
    id,
    node,
    dx,
    dy,
    rot = 0,
    srot = 0,
    dur = 1,
    delay = 0,
    drift = false,
    hide = false,
    depth = 'mid',
    z = 30,
  } = obj

  const style = {
    '--dx': dx || '0px',
    '--dy': dy || '0px',
    '--rot': `${rot}deg`,
    '--srot': `${srot}deg`,
    '--dur': `${dur}s`,
    '--delay': `${delay}s`,
    '--bx': `0px`,
    '--by': `${drift ? -7 : 0}px`,
    '--br': `${drift ? 1.2 : 0}deg`,
    '--after': `calc(${dur}s + ${delay}s + 0.5s)`,
    zIndex: z,
  }

  return (
    <div
      className={`obj ${drift ? 'drift' : ''} ${hide ? 'obj-hide-sm' : ''}`}
      style={style}
      aria-hidden="true"
    >
      <div className="obj-par" data-depth={depth}>
        {node}
      </div>
    </div>
  )
}