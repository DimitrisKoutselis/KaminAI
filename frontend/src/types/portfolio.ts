
export interface Project {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  updated_at: string;
  topics: string[];
}
