'use client'

import { useState } from 'react'
import { PrivateChatV2 } from './PrivateChatV2'
import { ChevronIcon } from './assets/ChevronIcon'
import { PrivateChatIcon } from './assets/PrivateChatIcon'

const PrivateChatPage = () => {
  const [messages, setMessages] = useState<
    { sender: string; content: string }[]
  >([])
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (inputValue.trim()) {
      setMessages([...messages, { sender: 'Mikk', content: inputValue.trim() }])
      setInputValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const typingUsers = inputValue.length > 0 ? ['Mikk'] : []

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20%',
        minWidth: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <PrivateChatV2 typingUsers={typingUsers} messages={messages} />
      <form
        onSubmit={handleSubmit}
        style={{
          width: '300px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100px',
        }}
      >
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #d1d5db',
            borderTopLeftRadius: '4px',
            borderBottomLeftRadius: '4px',
            outline: 'none',
            resize: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            backgroundColor: '#eaeaea',
            color: '#000',
            borderTopRightRadius: '4px',
            borderBottomRightRadius: '4px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
      </form>
    </div>
  )
}

export default PrivateChatPage
