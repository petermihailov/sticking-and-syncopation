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
      <filter id="sketch-0">
        <feTurbulence
          id="turbulence"
          baseFrequency="0.035"
          numOctaves="3"
          result="noise"
          seed="0"
        />
        <feDisplacementMap
          id="displacement"
          in="SourceGraphic"
          in2="noise"
          scale="1"
        />
      </filter>
      <filter id="sketch-1">
        <feTurbulence
          id="turbulence"
          baseFrequency="0.035"
          numOctaves="3"
          result="noise"
          seed="1"
        />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
      </filter>
      <filter id="sketch-2">
        <feTurbulence
          id="turbulence"
          baseFrequency="0.035"
          numOctaves="3"
          result="noise"
          seed="2"
        />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
      </filter>
      <filter id="sketch-3">
        <feTurbulence
          id="turbulence"
          baseFrequency="0.035"
          numOctaves="3"
          result="noise"
          seed="3"
        />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
      </filter>
      <filter id="sketch-4">
        <feTurbulence
          id="turbulence"
          baseFrequency="0.035"
          numOctaves="3"
          result="noise"
          seed="4"
        />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
      </filter>
    </svg>
  )
}
