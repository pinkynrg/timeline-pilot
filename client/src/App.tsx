import axios, { AxiosResponse } from 'axios'
import './App.css'
import { ComponentProps, useCallback, useEffect, useState } from 'react'
import moment from 'moment'
import { Chat } from './components/Chat/Chat'
import { Map } from './components/Map/Map'
import 'leaflet/dist/leaflet.css'

interface PointFromServer {
  coordinates: {
    id: number,
    lat: number,
    lon: number
  },
  timestamp: string
}

const pointZeroZero: ComponentProps<typeof Map>['position'] = { latitude: 0, longitude: 0, altitude: 2.5 }

const App = () => {
  const [messages, setMessages] = useState<ComponentProps<typeof Chat>['messages']>([])
  const [position, setPosition] = useState<ComponentProps<typeof Map>['position']>(pointZeroZero)
  const [data, setData] = useState<ComponentProps<typeof Map>['points']>([])
  const [path, setPath] = useState<ComponentProps<typeof Map>['path']>([])

  useEffect(() => {
    if (path.length > 0) {
      setPosition({ ...path[0], altitude: 2.5 })
    } else if (data.length > 0) {
      setPosition({ ...data[0], altitude: 2.5 })
    }
  }, [path, data])

  const responseToData = (
    result: AxiosResponse<PointFromServer[], unknown>,
  ) => result.data.map((e) => ({
    id: e.coordinates.id,
    latitude: e.coordinates.lat,
    longitude: e.coordinates.lon,
  }))

  const fetchData = useCallback(async () => {
    if (data.length > 0) return
    const result = await axios.get<PointFromServer[]>('/api/points')
    setData(responseToData(result))
  }, [data.length])

  const handleDateClick = useCallback(async (timestamp: string) => {
    const result = await axios.get<PointFromServer[]>(`/api/points?timestamp=${timestamp}`)
    setPath(responseToData(result))
  }, [])

  const onRequest = useCallback(async (msg: string) => {
    try {
      setMessages([{
        id: new Date().toISOString(),
        text: `Requesting: ${msg}`,
      }])
      const response = await axios.get<Point[]>(`/api/ask?question=${encodeURIComponent(msg)}`)

      // Use Moment.js to format and sort dates
      const dates = response.data.map((e) => moment(e.timestamp))
      const sorted = dates.sort((a, b) => (moment(a).isBefore(moment(b)) ? 1 : -1))
      setMessages([
        ...sorted.map((e) => (
          {
            id: new Date().toISOString(),
            text: e.format('LL'),
            callback: () => handleDateClick(e.format('YYYY-MM-DD HH:mm:ss')),
          }
        ))])
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: new Date().toISOString(),
        text: 'An error occurred while fetching data.',
      }])
      console.error(err)
    }
  }, [handleDateClick])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <>
      <Chat
        initialMessages={[
          {
            id: 'initial_1',
            text: 'Example questions:',
          },
          {
            id: 'initial_2',
            text: 'When did I go to Bologna?',
            callback: () => onRequest('When did I go to Bologna?'),
          },
          {
            id: 'initial_3',
            text: 'Did i go to Chicago?',
            callback: () => onRequest('Did i go to Chicago?'),
          },
        ]}
        messages={messages}
        onRequest={onRequest}
      />
      <Map
        positionChange={setPosition}
        position={position}
        points={data}
        path={path}
      />
    </>
  )
}

export { App }
