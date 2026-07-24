/**
 * ETAPA 7: Community Platform
 */
export interface CommunityProject { id: string; title: string; description: string; author: string; likes: number; comments: number; createdAt: string; }
export interface CommunityUser { id: string; name: string; avatar: string; followers: number; projects: number; }

class CommunityPlatform {
  private projects: CommunityProject[] = [];
  private users: CommunityUser[] = [];

  shareProject(title: string, description: string, author: string): CommunityProject {
    const p: CommunityProject = { id: `cp_${Date.now()}`, title, description, author, likes: 0, comments: 0, createdAt: new Date().toISOString() };
    this.projects.push(p);
    return p;
  }

  getProjects() { return this.projects; }
  likeProject(id: string) { const p = this.projects.find(x => x.id === id); if (p) p.likes++; }
}

export const community = new CommunityPlatform();