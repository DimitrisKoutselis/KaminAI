import { Card } from '../components/common'

export const AboutPage = () => {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10 animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">About Me</h1>
        <p className="text-lg text-gray-500">
          The person behind the code
        </p>
      </div>

      {/* Introduction */}
      <Card className="mb-8 animate-slide-up">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Hey there!
        </h2>
        <p className="text-gray-600 mb-4">
          I&apos;m Dimitris Koutselis, an AI Engineer based in Thessaloniki, Greece.
          I spend most of my days building intelligent systems, experimenting with
          LLMs, and trying to figure out how to push the boundaries of what AI can do.
        </p>
        <p className="text-gray-600">
          This website is my little digital space &mdash; a place where I share what I&apos;m
          learning, showcase projects I&apos;m proud of, and occasionally ramble about
          things that interest me.
        </p>
      </Card>

      {/* Journey */}
      <Card className="mb-8 animate-slide-up-delay-1">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          The Journey So Far
        </h2>
        <p className="text-gray-600 mb-4">
          I graduated from the Information and Electronics Engineering department
          at International Hellenic University. After that, I dove headfirst into
          machine learning during my internship at Msensis S.A., where I ended up
          staying for over a year working on GenAI projects, Azure AI services, and
          Python backend development.
        </p>
        <p className="text-gray-600">
          These days, I&apos;m part of the team at Netcompany, where I focus on RAG systems,
          MCP servers, and Azure AI services. Every day brings something new to learn,
          which is exactly how I like it.
        </p>
      </Card>

      {/* What I Do */}
      <Card className="mb-8 animate-slide-up-delay-2">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          What I Work With
        </h2>
        <p className="text-gray-600 mb-4">
          My toolkit revolves around Python and the modern AI stack. I work a lot with
          FastAPI for backends, LangGraph and LangChain for building agent systems,
          and various vector databases for RAG implementations. Docker is my friend
          for keeping things reproducible.
        </p>
        <div className="flex flex-wrap gap-2">
          {['Python', 'FastAPI', 'LangGraph', 'LangChain', 'RAG', 'Docker', 'Azure AI', 'MCP Servers'].map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </Card>

      {/* How I Think */}
      <Card className="mb-8 animate-slide-up-delay-3">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          How I Think
        </h2>
        <p className="text-gray-600 mb-4">
          I believe details matter. Small things compound into big outcomes, and
          getting the little stuff right is often what separates good work from great work.
        </p>
        <p className="text-gray-600 mb-4">
          I try to base my opinions on facts and data rather than ideology. In fact,
          I prefer not to have strong opinions on things I don&apos;t deeply understand &mdash;
          there&apos;s too much noise in the world already. When I do form an opinion,
          it&apos;s usually because I&apos;ve spent time digging into the subject.
        </p>
        <p className="text-gray-600">
          Technology genuinely excites me. I see it as one of the most powerful tools
          for progress we have, and I want to be part of pushing it forward responsibly.
        </p>
      </Card>

      {/* Beyond Work */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Beyond the Code
        </h2>
        <p className="text-gray-600 mb-4">
          When I&apos;m not coding, you&apos;ll probably find me consuming stories in every
          format possible &mdash; movies, series, books, video games, documentaries, podcasts.
          I&apos;m a sucker for a good narrative, regardless of the medium.
        </p>
        <p className="text-gray-600">
          I also spend a fair amount of time exploring AI tools and trying to figure
          out how to maximize their potential. It&apos;s equal parts hobby and professional
          development at this point.
        </p>
      </Card>

      {/* Story Analysis */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          A Question I Always Ask
        </h2>
        <p className="text-gray-600 mb-4">
          Whenever I watch a movie, read a book, or play a game, one question always
          comes to mind: <em>&ldquo;Why should I root for the protagonist and not the antagonist?&rdquo;</em>
        </p>
        <p className="text-gray-600 mb-4">
          Think about it &mdash; how often do we support the hero simply because the story
          tells us to? Are Vito Corleone&apos;s motives really nobler than his rivals&apos;?
          Is Daenerys truly more fit to rule than Cersei? Why is Darth Vader the villain
          when both sides are willing to kill for their cause?
        </p>
        <p className="text-gray-600">
          Of course, some stories have clear moral lines &mdash; <em>American History X</em> or{' '}
          <em>Snowpiercer</em> come to mind. And the best ones, like <em>Parasite</em>,
          deliberately blur those boundaries until you understand the characters without
          necessarily endorsing them. Those are the narratives that stay with me.
        </p>
      </Card>

      {/* Connect */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Let&apos;s Connect
        </h2>
        <p className="text-gray-600 mb-6">
          Feel free to reach out if you want to chat about AI, collaborate on something
          interesting, or just say hi.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="https://github.com/DimitrisKoutselis"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
              />
            </svg>
            GitHub
          </a>
          <a
            href="mailto:dimitriskoytselis@gmail.com"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Email Me
          </a>
        </div>
      </Card>
    </div>
  )
}
