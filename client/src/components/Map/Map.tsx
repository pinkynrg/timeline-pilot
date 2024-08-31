import { MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet'
import './Map.css'

function ChangeView({ center }: {center: [number, number]}) {
  const map = useMap()
  map.setView(center)
  return null
}

interface MapProps {
  points: [number, number][]
  path: [number, number][]
}

const Map = ({ points, path }: MapProps) => (
  <MapContainer
    center={[0, 0]}
    zoom={13}
    style={{ margin: 0, height: '100vh', width: '100%' }}
    zoomControl={false}
  >
    <ChangeView center={path.length > 0 ? path[0] : points[0] || [0, 0]} />
    <TileLayer
      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />
    { path.length > 0
      ? (
        <Polyline
          pathOptions={{ color: '#ab1919' }}
          positions={path}
        />
      )
      : points.map((point) => (
        <Polyline
          key={point.toString()}
          pathOptions={{ color: '#ab1919' }}
          positions={[point, point]}
        />
      ))}
  </MapContainer>
)

export { Map }
