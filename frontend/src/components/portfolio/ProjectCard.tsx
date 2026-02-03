
import { Card } from '../common';
import { Project } from '../../types/portfolio';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Card>
      <h3 className="text-xl font-semibold text-zinc-900 mb-2">{project.name}</h3>
      <p className="text-zinc-600 mb-4">{project.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {project.topics.map((topic) => (
          <span
            key={topic}
            className="px-2 py-1 bg-zinc-100 text-zinc-700 text-xs rounded-full"
          >
            {topic}
          </span>
        ))}
        {project.language && (
          <span
            className="px-2 py-1 bg-zinc-200 text-zinc-800 text-xs rounded-full font-medium"
          >
            {project.language}
          </span>
        )}
      </div>
      <div className="flex justify-between items-center">
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-900 hover:text-zinc-600 text-sm font-medium"
        >
          View on GitHub &rarr;
        </a>
        <div className="flex space-x-4 text-sm text-zinc-500">
          <span>Stars: {project.stars}</span>
          <span>Forks: {project.forks}</span>
        </div>
      </div>
    </Card>
  );
};
