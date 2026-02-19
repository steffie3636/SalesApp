import { createContext, useContext, useState, useCallback } from 'react'
import Toast from '../components/Toast'

const ToastContext = createContext({})

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('')
  const [key, setKey] = useState(0)

  const showToast = useCallback((msg) => {
    setMessage(msg)
    setKey(k => k + 1)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast key={key} message={message} onDone={() => setMessage('')} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
