'use client'

import { createContext, useContext, ReactNode } from 'react'

interface OfflineStorageContextType {
  saveFormData: (key: string, data: any) => Promise<void>
  loadFormData: (key: string) => any | null
  clearFormData: (key: string) => Promise<void>
}

const OfflineStorageContext = createContext<OfflineStorageContextType | undefined>(undefined)

// IndexedDB helper
const DB_NAME = 'bornfidis_portland'
const DB_VERSION = 1
const STORE_NAME = 'forms'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

export function OfflineStorageProvider({ children }: { children: ReactNode }) {
  const saveFormData = async (key: string, data: any): Promise<void> => {
    // Use localStorage for immediate persistence
    // IndexedDB can be used for larger data, but localStorage is simpler for forms
    try {
      localStorage.setItem(`bornfidis_${key}`, JSON.stringify(data))
      
      // Also save to IndexedDB for backup and larger storage capacity
      try {
        const db = await openDB()
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        await store.put(data, key)
      } catch (dbError) {
        // IndexedDB is optional, localStorage is primary
        console.warn('IndexedDB save failed, using localStorage only:', dbError)
      }
    } catch (error) {
      console.error('Error saving form data:', error)
    }
  }

  const loadFormData = (key: string): any | null => {
    try {
      // Try IndexedDB first (async, but we'll use sync localStorage as fallback)
      // For simplicity, we'll use localStorage for synchronous access
      const stored = localStorage.getItem(`bornfidis_${key}`)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }
    return null
  }

  const clearFormData = async (key: string): Promise<void> => {
    // Clear from localStorage (primary)
    try {
      localStorage.removeItem(`bornfidis_${key}`)
    } catch (e) {
      console.error('Error clearing from localStorage:', e)
    }
    // Also clear from IndexedDB
    try {
      const db = await openDB()
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      await store.delete(key)
    } catch (error) {
      console.error('Error clearing from IndexedDB:', error)
    }
  }

  return (
    <OfflineStorageContext.Provider value={{ saveFormData, loadFormData, clearFormData }}>
      {children}
    </OfflineStorageContext.Provider>
  )
}

export function useOfflineStorage() {
  const context = useContext(OfflineStorageContext)
  if (!context) {
    throw new Error('useOfflineStorage must be used within OfflineStorageProvider')
  }
  return context
}
