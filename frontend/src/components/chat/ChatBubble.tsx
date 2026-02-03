import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { ChatWindow } from './ChatWindow'

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = () => {
    if (!isAuthenticated) {
      // Redirect to login with current location as return URL
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    setIsOpen(!isOpen)
  }

  return (
    <>
      {isOpen && isAuthenticated && <ChatWindow onClose={() => setIsOpen(false)} />}

      <button
        onClick={handleClick}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg
                    flex items-center justify-center transition-all duration-300
                    z-50 ${
                      isOpen && isAuthenticated
                        ? 'bg-zinc-700 dark:bg-zinc-600 hover:bg-zinc-800 dark:hover:bg-zinc-700 rotate-0'
                        : 'bg-zinc-900 dark:bg-zinc-700 hover:bg-zinc-800 dark:hover:bg-zinc-600 hover:scale-110'
                    }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        title={!isAuthenticated ? 'Login to chat' : undefined}
      >
        {isOpen && isAuthenticated ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
    </>
  )
}
