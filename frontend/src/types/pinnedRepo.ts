export interface PinnedRepo {
  id: string;
  repo_name: string;
  display_name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  order: number;
  pinned_at: string;
}

export interface AvailableRepo {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  updated_at: string;
  topics: string[];
  is_pinned: boolean;
}
