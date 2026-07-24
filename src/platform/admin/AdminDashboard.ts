/**
 * ETAPA 9: Admin Dashboard
 */
export interface AdminStats {
  totalUsers: number; totalProjects: number; totalExports: number;
  activePlugins: number; activeTemplates: number; activeLicenses: number;
  errorCount: number; feedbackCount: number; marketplaceItems: number;
}

class AdminDashboard {
  getStats(): AdminStats {
    return {
      totalUsers: parseInt(localStorage.getItem('ms_users_count') || '1'),
      totalProjects: parseInt(localStorage.getItem('ms_projects_count') || '1'),
      totalExports: parseInt(localStorage.getItem('ms_exports_count') || '0'),
      activePlugins: 3, activeTemplates: 2, activeLicenses: 1,
      errorCount: 0, feedbackCount: 0, marketplaceItems: 5,
    };
  }

  incrementExports() {
    const c = parseInt(localStorage.getItem('ms_exports_count') || '0');
    localStorage.setItem('ms_exports_count', String(c + 1));
  }
}

export const adminDashboard = new AdminDashboard();