import React, { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getProjects, getServices } from "@/lib/content/loader";
import { filterProjects, paginateProjects } from "@/lib/content/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectFilters } from "@/components/projects/ProjectFilters";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";

export const metadata: Metadata = {
  title: "Projects & Case Studies",
  description: "Explore practical AI, document automation, and custom management systems case studies.",
};

interface ProjectsPageProps {
  searchParams: {
    search?: string;
    type?: string | string[];
    service?: string | string[];
    industry?: string | string[];
    tech?: string | string[];
    sort?: "newest" | "featured" | "oldest";
    page?: string;
  };
}

export default function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const allProjects = getProjects();
  const services = getServices();

  // Normalize search params arrays
  const toArray = (val?: string | string[]): string[] => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  };

  const projectTypes = toArray(searchParams.type);
  const serviceKeys = toArray(searchParams.service);
  const industries = toArray(searchParams.industry);
  const technologies = toArray(searchParams.tech);
  const search = searchParams.search || "";
  const sortBy = searchParams.sort || "newest";
  const currentPage = parseInt(searchParams.page || "1", 10);

  // Filter projects
  const filtered = filterProjects(allProjects, {
    projectTypes,
    serviceKeys,
    industries,
    technologies,
    search,
    sortBy,
  });

  // Paginate projects (12 per page)
  const pagination = paginateProjects(filtered, currentPage, 12);

  // Extract unique industries across all projects for filter menus (excluding raw service keys to prevent duplicate filters)
  const allIndustries = Array.from(
    new Set(
      allProjects
        .map((p) => p.industry)
        .filter(
          (ind) =>
            ind &&
            !services.some(
              (s) =>
                s.serviceKey.toLowerCase() === ind.toLowerCase() ||
                s.serviceKey.replace(/_/g, " ").toLowerCase() ===
                  ind.replace(/_/g, " ").toLowerCase()
            )
        )
    )
  ).sort();
  const allTechnologies = Array.from(
    new Set(allProjects.flatMap((p) => p.technologies))
  ).sort();

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* HEADER */}
      <div className="max-w-prose space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text tracking-tight">
          Projects & Case Studies
        </h1>
        <p className="text-lg text-text-muted leading-relaxed">
          Detailed case studies showcasing engineering implementations, automation architectures, and measurable production outcomes.
        </p>
      </div>

      {/* FILTERS & SEARCH (Wrapped in Suspense for useSearchParams) */}
      <Suspense fallback={<div className="h-24 bg-slate-100 rounded-md animate-pulse" />}>
        <ProjectFilters
          availableServices={services.map((s) => ({ key: s.serviceKey, title: s.title }))}
          availableIndustries={allIndustries}
          availableTechnologies={allTechnologies}
          totalResults={filtered.length}
        />
      </Suspense>

      {/* PROJECTS GRID OR EMPTY STATE */}
      {pagination.items.length > 0 ? (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagination.items.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* PAGINATION CONTROLS */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-6">
              <span className="text-sm text-text-muted">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <div className="flex items-center space-x-2">
                {pagination.hasPrevPage && (
                  <Button
                    variant="outline"
                    size="sm"
                    href={`/projects?page=${pagination.currentPage - 1}`}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                )}

                {pagination.hasNextPage && (
                  <Button
                    variant="outline"
                    size="sm"
                    href={`/projects?page=${pagination.currentPage + 1}`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="py-20 text-center space-y-4 bg-surface rounded-md border border-border p-8">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Inbox className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-text">No matching case studies found</h2>
          <p className="text-sm text-text-muted max-w-sm mx-auto">
            Try adjusting your search keywords or clearing some filters to see more results.
          </p>
          <div className="pt-2">
            <Button variant="outline" href="/projects">
              Reset all filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
