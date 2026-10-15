import { Suspense } from 'react'
import EditServiceClient from './EditServiceClient'

export default function EditServicePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#FAF7F2', padding: '48px 24px', textAlign: 'center', color: '#888' }}>Chargement...</div>}>
      <EditServiceClient />
    </Suspense>
  )
}
