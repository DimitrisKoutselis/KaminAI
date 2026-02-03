
import { useEffect, useState } from 'react';
import { portfolioService } from '../services/portfolioService';
import { Project } from '../types/portfolio';
import { ProjectCard } from '../components/portfolio/ProjectCard';
import { Card } from '../components/common';

export const PortfolioPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const fetchedProjects = await portfolioService.getProjects();
        setProjects(fetchedProjects);
        setError(null);
      } catch (err) {
        setError('Failed to fetch projects.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Portfolio</h1>
        <p className="text-zinc-600">A showcase of my projects and work.</p>
      </div>

      {loading && (
        <Card>
          <p className="text-center text-zinc-500">Loading projects...</p>
        </Card>
      )}

      {error && (
        <Card>
          <p className="text-center text-zinc-600">{error}</p>
        </Card>
      )}

      {!loading && !error && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      ) : (
        !loading &&
        !error && (
          <Card>
            <p className="text-center text-zinc-500">No projects yet.</p>
          </Card>
        )
      )}
    </div>
  );
};
