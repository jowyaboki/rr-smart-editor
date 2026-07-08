import { Project } from '../types';

export interface ProjectRepository {
  getAll(): Promise<Project[]>;
  getById(id: string): Promise<Project | null>;
  create(project: Project): Promise<Project>;
  update(id: string, updates: Partial<Project>): Promise<Project>;
  delete(id: string): Promise<void>;
  duplicate(id: string): Promise<Project>;
}

export class LocalStorageRepository implements ProjectRepository {
  private STORAGE_KEY = 'rr_editor_projects';

  private getProjects(): Project[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveProjects(projects: Project[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
  }

  async getAll(): Promise<Project[]> {
    return this.getProjects();
  }

  async getById(id: string): Promise<Project | null> {
    const projects = this.getProjects();
    return projects.find((p) => p.id === id) || null;
  }

  async create(project: Project): Promise<Project> {
    const projects = this.getProjects();
    projects.push(project);
    this.saveProjects(projects);
    return project;
  }

  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Project not found');

    projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveProjects(projects);
    return projects[index];
  }

  async delete(id: string): Promise<void> {
    const projects = this.getProjects().filter((p) => p.id !== id);
    this.saveProjects(projects);
  }

  async duplicate(id: string): Promise<Project> {
    const project = await this.getById(id);
    if (!project) throw new Error('Project not found');

    const newProject: Project = {
      ...project,
      id: Math.random().toString(36).substr(2, 9),
      name: `${project.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorite: false,
    };

    return this.create(newProject);
  }
}
