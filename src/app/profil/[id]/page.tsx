import { Suspense } from 'react'
import ProfilClient from './ProfilClient'

export default function ProfilPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>}>
      <ProfilClient />
    </Suspense>
  )
}