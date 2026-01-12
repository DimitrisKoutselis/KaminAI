import { Link } from 'react-router-dom'
import { Button, Card } from '../components/common'

export const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </Card>
    </div>
  )
}
