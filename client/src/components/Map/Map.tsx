import { MapContainer, Polyline, TileLayer, useMap, useMapEvent } from 'react-leaflet'
import './Map.css'
import Globe, { GlobeMethods } from 'react-globe.gl'
import { useEffect, useRef } from 'react'
import debounce from 'debounce'

interface Position {
  latitude: number,
  longitude: number,
  altitude: number
}

interface Point {
  id: number
  latitude: number,
  longitude: number,
}

interface MapHelperProps {
  center: Position
  onCenterChange: (point: Position) => void
}

const MapHelper = ({ center, onCenterChange }: MapHelperProps) => {
  const zoomToAltitude = (zoom: number) => {
    switch (zoom) {
      case 0: return 28
      case 1: return 11
      case 2: return 6
      case 3: return 3
      case 4: return 1
      case 5: return 0.5
      case 6: return 0.3
      case 7: return 0.15
      case 8: return 0.08
      case 9: return 0.04
      case 10: return 0.02
      case 11: return 0.01
      case 12: return 0.005
      case 13: return 0.0025
      case 14: return 0.0012
      case 15: return 0.0006
      case 16: return 0.0003
      case 17: return 0.00015
      case 18: return 0.00008
      default: return 0.00008
    }
  }

  const altitudeToZoom = (altitude: number) => {
    if (altitude >= 28) return 0
    if (altitude >= 11) return 1
    if (altitude >= 6) return 2
    if (altitude >= 3) return 3
    if (altitude >= 1) return 4
    if (altitude >= 0.5) return 5
    if (altitude >= 0.3) return 6
    if (altitude >= 0.15) return 7
    if (altitude >= 0.08) return 8
    if (altitude >= 0.04) return 9
    if (altitude >= 0.02) return 10
    if (altitude >= 0.01) return 11
    if (altitude >= 0.005) return 12
    if (altitude >= 0.0025) return 13
    if (altitude >= 0.0012) return 14
    if (altitude >= 0.0006) return 15
    if (altitude >= 0.0003) return 16
    if (altitude >= 0.00015) return 17
    return 18
  }

  const map = useMap()

  useEffect(() => {
    map.setView([center.latitude, center.longitude], altitudeToZoom(center.altitude))
  }, [center.latitude, center.longitude, center.altitude, map])

  useMapEvent('moveend', () => {
    const newCenter = map.getCenter()
    const newZoom = map.getZoom()
    onCenterChange({
      latitude: newCenter.lat,
      longitude: newCenter.lng,
      altitude: zoomToAltitude(newZoom),
    })
  })

  return null
}

interface MapProps {
  position: Position
  points: Point[]
  path: Point[]
  positionChange: (position: Position) => void
}

const Map = ({
  position,
  points,
  path,
  positionChange,
}: MapProps) => {
  const globeRef = useRef<GlobeMethods>()
  const isProgrammaticZoom = useRef(false)

  const debouncedPositionChange = debounce(positionChange, 500)

  useEffect(() => {
    isProgrammaticZoom.current = true
    if (
      globeRef.current
      && isProgrammaticZoom
      && position.latitude !== 0
      && position.longitude !== 0
    ) {
      globeRef.current.pointOfView({
        lat: position.latitude,
        lng: position.longitude,
        altitude: position.altitude,
      }, 100)
    }
    setTimeout(() => { isProgrammaticZoom.current = false }, 200)
  }, [position])

  const handleOnZoom = (pos: { lat: number; lng: number; altitude: number }) => {
    if (!isProgrammaticZoom.current) {
      debouncedPositionChange({
        longitude: pos.lng,
        latitude: pos.lat,
        altitude: pos.altitude,
      })
    }
  }

  return (
    position.altitude > 0.4
      ? (
        <Globe
          animateIn={false}
          ref={globeRef}
          onZoom={handleOnZoom}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          pointsData={path.length > 0
            ? path.map((e) => ({ lat: e.latitude, lng: e.longitude }))
            : points.map((e) => ({ lat: e.latitude, lng: e.longitude }))}
          pointAltitude={0}
          pointRadius={0.1}
          pointColor={() => '#ab1919'}

        />
      )
      : (
        <MapContainer
          center={[0, 0]}
          zoom={13}
          style={{
            margin: 0,
            height: '100vh',
            width: '100%',
          }}
          zoomControl={false}
        >
          <MapHelper
            center={position}
            onCenterChange={debouncedPositionChange}
          />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          { path.length > 0
            ? (
              <Polyline
                pathOptions={{ color: '#ab1919' }}
                positions={path.map((e) => [e.latitude, e.longitude])}
              />
            )
            : points.map((point) => (
              <Polyline
                key={point.id}
                pathOptions={{ color: '#ab1919' }}
                positions={[[point.latitude, point.longitude], [point.latitude, point.longitude]]}
              />
            ))}
        </MapContainer>
      )
  )
}

export { Map }
