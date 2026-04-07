export function SVGFilters() {
  return (
    <svg
      style={{
        opacity: '0',
        position: 'absolute',
        zIndex: -1,
        pointerEvents: 'none',
        top: '-100vh',
        left: '-100vw',
      }}
    >
      <filter id="roughpaper">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.04"
          result="noise"
          numOctaves="5"
        />

        <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="2">
          <feDistantLight azimuth="45" elevation="60" />
        </feDiffuseLighting>
      </filter>
    </svg>
  )
}
