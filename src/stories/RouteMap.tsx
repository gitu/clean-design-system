import { useEffect, useRef, useState } from 'react'
/**
 * MapLibre's tile-parsing worker, as a URL the bundler has actually emitted.
 *
 * The library works its own worker URL out at runtime — roughly
 * `new URL('./' + filename, import.meta.url)` with the filename in a variable —
 * which no bundler can follow statically. In dev that resolved to the real file
 * sitting in node_modules and everything worked; in a production build the
 * MapLibre chunk moves to `assets/` and the worker beside it was never emitted,
 * so the request 404s and the map renders its chrome, its attribution and its
 * markers and then asks for exactly zero tiles.
 *
 * `?worker&url` is the fix, and the `worker` half matters: plain `?url` emits
 * this one file and follows none of its imports, so the worker loaded and then
 * died reaching for `./maplibre-gl-shared.mjs` beside it. `?worker` bundles the
 * worker with its dependencies; `&url` hands back the address rather than a
 * constructor, which is what `setWorkerUrl` wants.
 */
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import type { Stop } from './fixtures'

/**
 * A real MapLibre map, story-only.
 *
 * It is deliberately *not* a shipped component. A map is not part of an
 * editorial search system, `maplibre-gl` is a ~200 KB dependency with its own
 * stylesheet, and it fetches tiles over the network — none of which belongs in
 * a package whose whole pitch is that it has almost no runtime. So it lives
 * here, imported dynamically, and `maplibre-gl` stays a devDependency.
 *
 * The dynamic import matters for a second reason: the story test runner mounts
 * every story, and a top-level import would pull the whole library into any
 * bundle that touched this file. Here it loads only when the map actually
 * renders, and a failure — offline, blocked, no WebGL — falls back to the
 * schematic below rather than taking the story down with it.
 *
 * The basemap is **OpenFreeMap**: full-planet OpenStreetMap tiles, no API key,
 * no sign-up, no rate limit. Two other obvious candidates do not work here —
 * MapLibre's demo tiles stop at zoom 6 and carry only country outlines, and
 * OSM's own raster server asks applications not to point at it directly. Set
 * `VITE_MAP_STYLE` to override with a commercial provider's style.
 */

/** Free, keyless, street-level. `positron` is grey; `dark` is its night twin. */
const OPENFREEMAP = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
} as const

const ENV_STYLE = (import.meta.env?.VITE_MAP_STYLE as string | undefined) ?? undefined

interface StyleLayer {
  id: string
  type: string
}

interface TintableMap {
  getStyle: () => { layers?: StyleLayer[] }
  setPaintProperty: (layer: string, property: string, value: unknown) => void
}

/**
 * Repaints the basemap in the system's own colours.
 *
 * Positron is already a quiet grey, but it is a *cool* grey, and every neutral
 * in this system carries a little yellow — side by side the map reads as a
 * screenshot of somebody else's product. Rather than forking a several-hundred
 * layer style document, this walks the loaded layers and recolours them from
 * the live custom properties, so the map follows the theme and any later token
 * change.
 *
 * By layer *type* rather than by id on purpose: style authors rename layers,
 * and a list of ids would quietly stop matching at the next style update.
 */
function tintToTokens(map: TintableMap) {
  const styles = getComputedStyle(document.documentElement)
  const read = (token: string, fallback: string) =>
    styles.getPropertyValue(token).trim() || fallback

  const canvas = read('--cds-color-canvas', '#ffffff')
  const sunken = read('--cds-color-surface-sunken', '#f6f4f1')
  const rule = read('--cds-color-rule', '#e0dcd5')
  const ruleStrong = read('--cds-color-rule-strong', '#c9c3b9')
  const textMuted = read('--cds-color-text-muted', '#666057')
  const water = read('--cds-color-accent-subtle', '#f1f4f8')

  const isWater = (id: string) => /water|ocean|sea|river|lake/.test(id)

  for (const layer of map.getStyle().layers ?? []) {
    const id = layer.id.toLowerCase()
    try {
      switch (layer.type) {
        case 'background':
          map.setPaintProperty(layer.id, 'background-color', canvas)
          break
        case 'fill':
          map.setPaintProperty(layer.id, 'fill-color', isWater(id) ? water : sunken)
          map.setPaintProperty(layer.id, 'fill-opacity', isWater(id) ? 1 : 0.55)
          break
        case 'line':
          // A motorway keeps more weight than a footpath, the same way
          // `rule-strong` outranks `rule` everywhere else in the system.
          map.setPaintProperty(
            layer.id,
            'line-color',
            /motorway|trunk|primary/.test(id) ? ruleStrong : rule
          )
          break
        case 'symbol':
          map.setPaintProperty(layer.id, 'text-color', textMuted)
          map.setPaintProperty(layer.id, 'text-halo-color', canvas)
          map.setPaintProperty(layer.id, 'text-halo-width', 1.2)
          break
        case 'raster':
          // The shaded-relief underlay fights a flat palette.
          map.setPaintProperty(layer.id, 'raster-opacity', 0)
          break
        default:
      }
    } catch {
      // A layer that does not accept a given paint property is not a reason to
      // abandon the rest of the pass.
    }
  }
}

export function RouteMap({
  stops,
  activeId,
  onSelect,
  height = 420,
  theme = 'light',
  styleUrl,
}: {
  stops: Stop[]
  activeId: string | null
  onSelect: (id: string) => void
  height?: number
  /** The resolved theme, so the basemap follows the page. */
  theme?: 'light' | 'dark'
  /** A MapLibre style URL, overriding the default basemap. */
  styleUrl?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<{ remove: () => void } | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading')

  const style = styleUrl ?? ENV_STYLE ?? OPENFREEMAP[theme]

  useEffect(() => {
    let cancelled = false
    const node = containerRef.current
    if (!node) return undefined
    setStatus('loading')

    ;(async () => {
      try {
        const maplibre = await import('maplibre-gl')
        await import('maplibre-gl/dist/maplibre-gl.css')
        if (cancelled) return

        // Before the first Map is constructed: the worker pool is built lazily
        // on construction and keeps whatever URL it was told then.
        maplibre.setWorkerUrl(workerUrl)

        const map = new maplibre.Map({
          container: node,
          style,
          center: [8.539, 47.379],
          zoom: 12.6,
          attributionControl: { compact: true },
        })
        mapRef.current = map

        map.on('error', () => !cancelled && setStatus('unavailable'))

        // Two different questions, deliberately not conflated:
        //
        //   *Is the basemap on screen?*  — the style document has layers, so
        //     there is something to look at. This is what uncovers the map.
        //   *Has everything finished loading?* — `isStyleLoaded()`, which also
        //     waits for every tile in view. Gating the reveal on that leaves the
        //     fallback sitting on top of a perfectly good map on a slow
        //     connection, which is exactly what it was doing.
        let drawn = false
        const draw = () => {
          if (cancelled || drawn) return
          const layers = map.getStyle()?.layers
          if (!layers || layers.length === 0) return
          drawn = true

          tintToTokens(map as unknown as TintableMap)

          const accent =
            getComputedStyle(document.documentElement)
              .getPropertyValue('--cds-color-accent')
              .trim() || '#2b4f77'

          try {
            map.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: stops.map(stop => stop.coordinates),
                },
              },
            })
            map.addLayer({
              id: 'route-line',
              type: 'line',
              source: 'route',
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: { 'line-color': accent, 'line-width': 4, 'line-opacity': 0.9 },
            })
          } catch {
            // The style can still be settling; the basemap is the part that
            // matters and the route is redrawn on the next idle.
            drawn = false
          }
          setStatus('ready')
        }

        map.on('load', draw)
        map.on('idle', draw)
        map.on('styledata', draw)

        // MapLibre measures its container once, at construction. Inside a
        // responsive grid that measurement can land before the box has settled,
        // and a map that believes it is zero pixels wide never asks for a
        // single tile.
        const observer = new ResizeObserver(() => map.resize())
        observer.observe(node)
        observerRef.current = observer

        // Markers are plain DOM, so they take the system's own tokens instead
        // of MapLibre's default pin.
        for (const stop of stops) {
          const el = document.createElement('button')
          el.type = 'button'
          el.className = 'sb-route-marker'
          el.dataset.status = stop.status
          el.dataset.stop = stop.id
          el.textContent = String(stop.sequence)
          el.setAttribute('aria-label', `Stop ${stop.sequence}, ${stop.name}`)
          el.addEventListener('click', () => onSelect(stop.id))
          new maplibre.Marker({ element: el }).setLngLat(stop.coordinates).addTo(map)
        }
      } catch {
        if (!cancelled) setStatus('unavailable')
      }
    })()

    return () => {
      cancelled = true
      observerRef.current?.disconnect()
      observerRef.current = null
      mapRef.current?.remove()
      mapRef.current = null
    }
    // Rebuilt when the basemap changes — which includes a theme switch, since
    // light and dark are different style documents.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style])

  // Reflect the selection onto the markers without re-rendering the map.
  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    node.querySelectorAll<HTMLElement>('.sb-route-marker').forEach(marker => {
      marker.classList.toggle('is-active', marker.dataset.stop === activeId)
    })
  }, [activeId, status])

  return (
    <div className="sb-route-map" style={{ height }}>
      <div ref={containerRef} className="sb-route-map__canvas" aria-hidden="true" />
      {status !== 'ready' && (
        <div className="sb-route-map__fallback">
          <RouteSchematic stops={stops} activeId={activeId} onSelect={onSelect} />
          <p className="cds-body-sm sb-route-map__note">
            {status === 'loading'
              ? 'Loading map…'
              : 'Map tiles unavailable — showing the stop sequence instead.'}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * What the panel shows when there is no map: the same stops as a sequence.
 *
 * Worth having on its own terms — a driver reading this on a phone in a van
 * mostly needs the order and the next address, and this renders offline.
 */
export function RouteSchematic({
  stops,
  activeId,
  onSelect,
}: {
  stops: Stop[]
  activeId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <ol className="sb-route-schematic">
      {stops.map(stop => (
        <li key={stop.id}>
          <button
            type="button"
            className="sb-route-schematic__stop"
            data-status={stop.status}
            aria-current={stop.id === activeId ? 'step' : undefined}
            onClick={() => onSelect(stop.id)}
          >
            <span className="sb-route-schematic__dot">{stop.sequence}</span>
            <span className="sb-route-schematic__label">
              <span>{stop.name}</span>
              <span className="cds-numeric">{stop.eta}</span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}
