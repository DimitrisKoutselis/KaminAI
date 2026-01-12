import { Card } from '../components/common'

export const AboutPage = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">About Me</h1>
        <p className="text-gray-600">
          Get to know more about who I am and what I do.
        </p>
      </div>

      <Card className="mb-8">
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Hello! I&apos;m Dimitris
          </h2>
          <p className="text-gray-600 mb-4">
            I&apos;m a software developer passionate about building great
            products. This website serves as my digital space where I share my
            thoughts, showcase my work, and experiment with new technologies.
          </p>
          <p className="text-gray-600">
            Feel free to explore the blog and check out my portfolio!
          </p>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Connect With Me
        </h3>
        <div className="space-y-2">
          <a
            href="https://github.com/DimitrisKoutselis"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
              />
            </svg>
            GitHub
          </a>
        </div>
      </Card>
    </div>
  )
}
