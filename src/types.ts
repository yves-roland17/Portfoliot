export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: 'Frontend' | 'Backend' | 'Fullstack' | 'Web3';
  tags: string[];
  image: string;
  demoUrl?: string;
  githubUrl?: string;
  featured: boolean;
  role?: string;
}

export interface Skill {
  name: string;
  level: number; // 0-100 indicating percentage
  category: 'Frontend' | 'Backend' | 'DevOps & Tools' | 'Web Design' | 'Languages';
  icon: string; // lucide icon name
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string[];
  skills: string[];
}
