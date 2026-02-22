import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './globals.css'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { validateEnvOrThrow } from '@/utils/env-validation'

// Validate environment variables on startup
if (process.env.NODE_ENV === 'production') {
  validateEnvOrThrow();
}

export const metadata = {
  title: 'InsureDesk - Insurance Management System',
  description: 'Manage your insurance policies efficiently',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
