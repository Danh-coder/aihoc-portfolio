import { Project } from "@/types/content";

export interface ProjectFilterOptions {
  projectTypes?: string[];
  serviceKeys?: string[];
  industries?: string[];
  technologies?: string[];
  search?: string;
  sortBy?: "newest" | "featured" | "oldest";
}

/**
 * Filter projects using:
 * - AND across filter groups
 * - OR within a filter group
 * - Case-insensitive text search across title, summary, services, industry, technologies
 */
export function filterProjects(
  projects: Project[],
  options: ProjectFilterOptions
): Project[] {
  return projects.filter((project) => {
    // Project Type filter (OR within group)
    if (options.projectTypes && options.projectTypes.length > 0) {
      if (!options.projectTypes.includes(project.projectType)) {
        return false;
      }
    }

    // Service Keys filter (OR within group)
    if (options.serviceKeys && options.serviceKeys.length > 0) {
      const hasService = project.serviceKeys.some((k) =>
        options.serviceKeys!.includes(k)
      );
      if (!hasService) return false;
    }

    // Industry filter (OR within group)
    if (options.industries && options.industries.length > 0) {
      if (!options.industries.includes(project.industry)) {
        return false;
      }
    }

    // Technologies filter (OR within group)
    if (options.technologies && options.technologies.length > 0) {
      const hasTech = project.technologies.some((t) =>
        options.technologies!.map((x) => x.toLowerCase()).includes(t.toLowerCase())
      );
      if (!hasTech) return false;
    }

    // Search query filter
    if (options.search && options.search.trim().length > 0) {
      const q = options.search.trim().toLowerCase();
      const matchTitle = project.title.toLowerCase().includes(q);
      const matchSummary = project.summary.toLowerCase().includes(q);
      const matchIndustry = project.industry.toLowerCase().includes(q);
      const matchTech = project.technologies.some((t) => t.toLowerCase().includes(q));
      const matchServices = project.serviceKeys.some((s) => s.toLowerCase().includes(q));

      if (!matchTitle && !matchSummary && !matchIndustry && !matchTech && !matchServices) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (options.sortBy === "featured") {
      const rankA = a.featuredRank ?? 999;
      const rankB = b.featuredRank ?? 999;
      if (rankA !== rankB) return rankA - rankB;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
    if (options.sortBy === "oldest") {
      return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
    }
    // Default: newest first
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

/**
 * Paginate projects (default 12 per page)
 */
export function paginateProjects(
  projects: Project[],
  page: number = 1,
  pageSize: number = 12
): {
  items: Project[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} {
  const safePage = Math.max(1, page);
  const totalItems = projects.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (safePage - 1) * pageSize;
  const items = projects.slice(startIndex, startIndex + pageSize);

  return {
    items,
    totalItems,
    totalPages,
    currentPage: safePage,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
}

/**
 * Get featured projects sorted by featuredRank
 */
export function getFeaturedProjects(projects: Project[], limit: number = 6): Project[] {
  return projects
    .filter((p) => typeof p.featuredRank === "number" && p.featuredRank > 0)
    .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99))
    .slice(0, limit);
}

/**
 * Compute related projects based on shared service, industry, and technologies
 * Excludes current project; returns up to maxCount (default 3)
 */
export function getRelatedProjects(
  currentProject: Project,
  allProjects: Project[],
  maxCount: number = 3
): Project[] {
  const candidates = allProjects.filter((p) => p.id !== currentProject.id);

  const scored = candidates.map((candidate) => {
    let score = 0;
    // Shared service: +3 per match
    for (const service of candidate.serviceKeys) {
      if (currentProject.serviceKeys.includes(service)) {
        score += 3;
      }
    }
    // Shared industry: +2
    if (candidate.industry === currentProject.industry) {
      score += 2;
    }
    // Shared technology: +1 per match
    for (const tech of candidate.technologies) {
      if (
        currentProject.technologies
          .map((t) => t.toLowerCase())
          .includes(tech.toLowerCase())
      ) {
        score += 1;
      }
    }
    return { candidate, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.candidate.publishedAt).getTime() - new Date(a.candidate.publishedAt).getTime();
    })
    .slice(0, maxCount)
    .map((item) => item.candidate);
}
