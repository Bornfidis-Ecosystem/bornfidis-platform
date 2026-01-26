import PortlandClient from './PortlandClient'
import { PatoisProvider } from './PatoisProvider'
import { OfflineStorageProvider } from './OfflineStorage'

export default function PortlandPage() {
  return (
    <PatoisProvider>
      <OfflineStorageProvider>
        <div className="bg-white min-h-screen">
          <PortlandClient />
        </div>
      </OfflineStorageProvider>
    </PatoisProvider>
  )
}
