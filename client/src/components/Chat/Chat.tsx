import { FormEvent, useState } from 'react'
import './chat.css'

type MessageProps = {id: string, text: string, callback?: () => void}

const Message = ({ id, text, callback }: MessageProps) => (callback
  ? (
    <button
      style={{ width: '100%' }}
      type="button"
      onClick={callback}
      key={id}
      className="message"
    >
      {text}
    </button>
  )
  : (
    <div key={id} className="message">
      {text}
    </div>
  ))

interface ChatProps {
  initialMessages: MessageProps[]
  messages: MessageProps[]
  onRequest: (msg: string) => void
}

const Chat = ({
  initialMessages,
  messages,
  onRequest,
}: ChatProps) => {
  const [input, setInput] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() !== '') {
      setInput('')
      onRequest(input)
    }
  }

  return (
    <div className="chat-container">
      <div className="messages">
        {
          messages.length === 0 ? (
            initialMessages.map((msg) => (
              <Message id={msg.id} text={msg.text} callback={msg.callback} />
            )))
            : messages.map((msg) => (
              <Message id={msg.id} text={msg.text} callback={msg.callback} />
            ))
        }
      </div>
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}

export { Chat }
