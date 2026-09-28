import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProjects, getProjectBySlug } from "@/lib/content/loader";
import { getRelatedProjects } from "@/lib/content/projects";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ChevronRight,
  ArrowRight,
  Calendar,
  Layers,
  Wrench,
  ExternalLink,
  Github,
  FileText,
  TrendingUp,
  CheckCircle,
  Play,
} from "lucide-react";

interface ProjectDetailProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const projects = getProjects();
  return projects.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: ProjectDetailProps): Promise<Metadata> {
  const project = getProjectBySlug(params.slug);
  if (!project) {
    return { title: "Project Not Found" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      url: `${siteUrl}/projects/${project.slug}`,
      images: project.cover?.src ? [{ url: project.cover.src, alt: project.cover.alt }] : [],
    },
  };
}

export default function ProjectDetailPage({ params }: ProjectDetailProps) {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const allProjects = getProjects();
  const relatedProjects = getRelatedProjects(project, allProjects, 3);
  const publishYear = new Date(project.publishedAt).getFullYear();

  return (
    <article className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* 1. BREADCRUMBS */}
      <nav aria-label="Breadcrumb" className="text-xs text-text-muted">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="hover:text-text transition-colors">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </li>
          <li>
            <Link href="/projects" className="hover:text-text transition-colors">
              Projects
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </li>
          <li className="font-semibold text-text truncate max-w-[200px] sm:max-w-none">
            {project.title}
          </li>
        </ol>
      </nav>

      {/* 2. HEADER: Title, Type, Services, Industry, Summary */}
      <header className="space-y-6 max-w-4xl">
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant={project.projectType === "CLIENT" ? "primary" : "secondary"}>
            {project.projectType}
          </Badge>
          {project.client?.name && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              Client: {project.client.name}
            </span>
          )}
          {project.serviceKeys.map((key) => (
            <span
              key={key}
              className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 uppercase tracking-wider"
            >
              {key.replace(/_/g, " ")}
            </span>
          ))}
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-medium text-slate-600">{project.industry}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-text tracking-tight leading-tight">
          {project.title}
        </h1>

        <p className="text-lg sm:text-xl text-text-muted leading-relaxed">
          {project.summary}
        </p>

        {project.resultHighlight && (
          <div className="inline-flex items-center text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-sm">
            <TrendingUp className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
            <span>Key Outcome: {project.resultHighlight}</span>
          </div>
        )}
      </header>

      {/* 3. COVER MEDIA */}
      <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border bg-slate-100 shadow-card">
        {project.cover?.src ? (
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            width={project.cover.width || 1600}
            height={project.cover.height || 900}
            className="w-full h-full object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            No cover image available
          </div>
        )}
      </div>

      {/* 3.1 DEMO VIDEO PLAYER (IF AVAILABLE) */}
      {project.videoUrl && (
        <section className="space-y-4" aria-labelledby="video-walkthrough-heading">
          <div className="flex items-center justify-between">
            <h2 id="video-walkthrough-heading" className="text-xl sm:text-2xl font-bold text-text flex items-center">
              <Play className="w-5 h-5 mr-2 text-primary fill-primary" />
              Project Demo &amp; Production Walkthrough
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Live Video Recording
            </span>
          </div>

          <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shadow-xl">
            {project.videoUrl.includes("drive.google.com") ||
            project.videoUrl.includes("youtube.com") ||
            project.videoUrl.includes("youtu.be") ? (
              <iframe
                src={project.videoUrl}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                title={`${project.title} Video Demonstration`}
              />
            ) : (
              <video
                src={project.videoUrl}
                controls
                className="w-full h-full object-contain"
                poster={project.cover?.src}
              >
                Your browser does not support HTML5 video playback.
              </video>
            )}
          </div>
        </section>
      )}

      {/* 4. QUICK FACTS GRID */}
      <section className="bg-surface rounded-md border border-border p-6 shadow-sm" aria-labelledby="quick-facts-heading">
        <h2 id="quick-facts-heading" className="sr-only">Quick Facts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Timeline / Year
            </span>
            <div className="flex items-center text-text font-semibold">
              <Calendar className="w-4 h-4 mr-1.5 text-primary" />
              <span>{publishYear}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              My Role
            </span>
            <div className="flex items-center text-text font-semibold">
              <Layers className="w-4 h-4 mr-1.5 text-primary" />
              <span className="truncate">Lead Engineer</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Industry
            </span>
            <div className="text-text font-semibold truncate">{project.industry}</div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Core Stack
            </span>
            <div className="flex items-center text-text font-semibold truncate">
              <Wrench className="w-4 h-4 mr-1.5 text-primary shrink-0" />
              <span className="truncate">{project.technologies.slice(0, 3).join(", ")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5-8. CASE STUDY NARRATIVE (Problem, Solution, Role, Implementation, Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Problem */}
          <section className="space-y-4" aria-labelledby="problem-heading">
            <h2 id="problem-heading" className="text-2xl font-bold text-text">
              The Business Problem
            </h2>
            <div className="prose text-text-muted text-base sm:text-lg leading-relaxed whitespace-pre-line">
              {project.problemMarkdown}
            </div>
          </section>

          {/* Solution */}
          <section className="space-y-4" aria-labelledby="solution-heading">
            <h2 id="solution-heading" className="text-2xl font-bold text-text">
              Implemented Solution
            </h2>
            <div className="prose text-text-muted text-base sm:text-lg leading-relaxed whitespace-pre-line">
              {project.solutionMarkdown}
            </div>
          </section>

          {/* My Role */}
          <section className="space-y-4" aria-labelledby="role-heading">
            <h2 id="role-heading" className="text-2xl font-bold text-text">
              Role & Responsibilities
            </h2>
            <div className="prose text-text-muted text-base sm:text-lg leading-relaxed whitespace-pre-line">
              {project.roleMarkdown}
            </div>
          </section>

          {/* Implementation & Architecture */}
          {project.implementationMarkdown && (
            <section className="space-y-4" aria-labelledby="implementation-heading">
              <h2 id="implementation-heading" className="text-2xl font-bold text-text">
                Architecture & Implementation Details
              </h2>
              <div className="prose text-text-muted text-base sm:text-lg leading-relaxed whitespace-pre-line">
                {project.implementationMarkdown}
              </div>
            </section>
          )}

          {/* Results & Verification */}
          <section className="space-y-4" aria-labelledby="results-heading">
            <h2 id="results-heading" className="text-2xl font-bold text-text">
              Verified Outcomes & Business Impact
            </h2>
            <div className="p-6 rounded-md bg-emerald-50/50 border border-emerald-200 prose text-slate-800 text-base sm:text-lg leading-relaxed whitespace-pre-line">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 shrink-0" />
                <div>{project.resultsMarkdown}</div>
              </div>
            </div>
          </section>

          {/* 9. GALLERY ARTIFACTS */}
          {project.gallery && project.gallery.length > 0 && (
            <ProjectGallery media={project.gallery} title={project.title} />
          )}
        </div>

        {/* SIDEBAR: Tech Stack, Links, Contextual CTA */}
        <aside className="space-y-8">
          {/* Technologies used */}
          <div className="bg-surface rounded-md border border-border p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text">
              Technologies & Tools
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 text-xs font-medium rounded-sm bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Approved external links */}
          {(project.links.demo || project.links.repository || project.links.paper) && (
            <div className="bg-surface rounded-md border border-border p-6 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text">
                Project Links
              </h3>
              <div className="space-y-2 text-sm">
                {project.links.demo && (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-primary hover:underline font-semibold"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Live Demo / Product
                  </a>
                )}
                {project.links.repository && (
                  <a
                    href={project.links.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-slate-700 hover:text-black font-semibold"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Source Repository
                  </a>
                )}
                {project.links.paper && (
                  <a
                    href={project.links.paper}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-slate-700 hover:text-black font-semibold"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Publication / Paper
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Contextual CTA */}
          <div className="bg-blue-50/60 rounded-md border border-blue-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-text">
              Need a similar solution?
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              If your organization has challenges similar to this case study, let&apos;s discuss your requirements.
            </p>
            <Button
              href={`/contact?service=${encodeURIComponent(
                project.serviceKeys[0] || ""
              )}&sourceProjectId=${encodeURIComponent(project.id)}&sourcePath=${encodeURIComponent(
                `/projects/${project.slug}`
              )}`}
              size="md"
              variant="primary"
              className="w-full justify-center"
            >
              Discuss a Similar Project
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </aside>
      </div>

      {/* 11. RELATED PROJECTS */}
      {relatedProjects.length > 0 && (
        <section className="pt-12 border-t border-border space-y-8" aria-labelledby="related-heading">
          <div className="space-y-1">
            <h2 id="related-heading" className="text-2xl font-bold text-text">
              Related Case Studies
            </h2>
            <p className="text-sm text-text-muted">
              Other projects sharing similar service domains or technology stacks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProjects.map((rel) => (
              <ProjectCard key={rel.id} project={rel} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
