
import { Card } from '../common';
import { Project } from '../../types/portfolio';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Card>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h3>
      <p className="text-gray-600 mb-4">{project.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {project.topics.map((topic) => (
          <span
            key={topic}
            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
          >
            {topic}
          </span>
        ))}
        {project.language && (
          <span
            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
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
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          View on GitHub &rarr;
        </a>
        <div className="flex space-x-4 text-sm text-gray-500">
          <span>Stars: {project.stars}</span>
          <span>Forks: {project.forks}</span>
        </div>
      </div>
    </Card>
  );
};
