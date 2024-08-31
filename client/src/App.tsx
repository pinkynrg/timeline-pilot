import axios, { AxiosResponse } from 'axios'
import './App.css'
import { ComponentProps, useCallback, useEffect, useState } from 'react'
import moment from 'moment'
import { Chat } from './components/Chat/Chat'
import { Map } from './components/Map/Map'
import 'leaflet/dist/leaflet.css'

interface Point {
    coordinates: {
      lat: number,
      lon: number
    },
    timestamp: string
}

const App = () => {
  const [messages, setMessages] = useState<ComponentProps<typeof Chat>['messages']>([])
  const [data, setData] = useState<ComponentProps<typeof Map>['points']>([])
  const [path, setPath] = useState<ComponentProps<typeof Map>['points']>([])

  const responseToData = (
    result: AxiosResponse<Point[], unknown>,
  ): [number, number][] => result.data.map((e) => ([e.coordinates.lat, e.coordinates.lon]))

  const fetchData = useCallback(async () => {
    if (data.length > 0) return
    const result = await axios.get<Point[]>('/api/points')
    setData(responseToData(result))
  }, [data.length])

  const handleDateClick = useCallback(async (timestamp: string) => {
    const result = await axios.get<Point[]>(`/api/points?timestamp=${timestamp}`)
    setPath(responseToData(result))
  }, [])

  useEffect(() => {
    console.log(messages)
  }, [messages])

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
        points={data}
        path={path}
      />
    </>
  )
}

export { App }
