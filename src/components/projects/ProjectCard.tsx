import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Project } from "@/types/content";
import { Badge } from "@/components/ui/Badge";
import { ArrowUpRight, TrendingUp, Play } from "lucide-react";
import { resolveMediaUrl } from "@/lib/content/media";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const coverSrc = resolveMediaUrl(project.cover?.src);

  return (
    <article className="group bg-surface rounded-md border border-border shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col h-full overflow-hidden hover:border-slate-300">
      {/* Cover Image Container */}
      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden border-b border-border">
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={project.cover?.alt || project.title}
            width={project.cover?.width || 800}
            height={project.cover?.height || 450}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-sm">
            No cover media
          </div>
        )}

        {/* Project type badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant={project.projectType === "CLIENT" ? "primary" : "secondary"}
            className="backdrop-blur-sm bg-white/90 text-slate-800"
          >
            {project.projectType}
          </Badge>
        </div>

        {/* Video demo badge if available */}
        {project.videoUrl && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-sm shadow-sm">
              <Play className="w-3 h-3 mr-1 fill-white" />
              Video Demo
            </span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-3">
          {/* Service & Industry Tags */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {project.serviceKeys.map((key) => (
              <span
                key={key}
                className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wider"
              >
                {key.replace(/_/g, " ")}
              </span>
            ))}
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">{project.industry}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors line-clamp-2">
            <Link
              href={`/projects/${project.slug}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm inline-flex items-center"
            >
              {project.title}
              <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-primary inline shrink-0" />
            </Link>
          </h3>

          {/* Summary limited to 3 lines */}
          <p className="text-text-muted text-sm line-clamp-3 leading-relaxed">
            {project.summary}
          </p>
        </div>

        {/* Result highlight & footer info */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          {project.resultHighlight && (
            <div className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{project.resultHighlight}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="truncate max-w-[200px]">
              {project.technologies.slice(0, 3).join(", ")}
              {project.technologies.length > 3 && ` +${project.technologies.length - 3}`}
            </div>
            <Link
              href={`/projects/${project.slug}`}
              className="text-primary font-medium hover:underline inline-flex items-center"
              tabIndex={-1}
              aria-hidden="true"
            >
              Read case study
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
