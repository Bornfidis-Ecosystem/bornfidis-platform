'use client'

import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

let toastListeners: Array<(toasts: Toast[]) => void> = []
let toastIdCounter = 0
let currentToasts: Toast[] = []

function notifyListeners() {
  toastListeners.forEach(listener => listener([...currentToasts]))
}

export const toast = {
  success: (message: string, duration = 5000) => {
    const id = `toast-${toastIdCounter++}`
    currentToasts.push({ id, message, type: 'success', duration })
    notifyListeners()
    
    if (duration > 0) {
      setTimeout(() => {
        currentToasts = currentToasts.filter(t => t.id !== id)
        notifyListeners()
      }, duration)
    }
  },
  error: (message: string, duration = 7000) => {
    const id = `toast-${toastIdCounter++}`
    currentToasts.push({ id, message, type: 'error', duration })
    notifyListeners()
    
    if (duration > 0) {
      setTimeout(() => {
        currentToasts = currentToasts.filter(t => t.id !== id)
        notifyListeners()
      }, duration)
    }
  },
  info: (message: string, duration = 5000) => {
    const id = `toast-${toastIdCounter++}`
    currentToasts.push({ id, message, type: 'info', duration })
    notifyListeners()
    
    if (duration > 0) {
      setTimeout(() => {
        currentToasts = currentToasts.filter(t => t.id !== id)
        notifyListeners()
      }, duration)
    }
  },
  warning: (message: string, duration = 6000) => {
    const id = `toast-${toastIdCounter++}`
    currentToasts.push({ id, message, type: 'warning', duration })
    notifyListeners()
    
    if (duration > 0) {
      setTimeout(() => {
        currentToasts = currentToasts.filter(t => t.id !== id)
        notifyListeners()
      }, duration)
    }
  },
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const updateToasts = (newToasts: Toast[]) => {
      setToasts(newToasts)
    }
    
    toastListeners.push(updateToasts)
    setToasts([...currentToasts])
    
    return () => {
      toastListeners = toastListeners.filter(listener => listener !== updateToasts)
    }
  }, [])

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getToastStyles(toast.type)} border rounded-lg shadow-lg p-4 flex items-start justify-between gap-4 animate-in slide-in-from-top-5`}
          role="alert"
        >
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button
            onClick={() => {
              currentToasts = currentToasts.filter(t => t.id !== toast.id)
              notifyListeners()
            }}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
