import React from "react";
import Link from "next/link";
import { getProjects, getServices, getSiteConfig } from "@/lib/content/loader";
import { getFeaturedProjects } from "@/lib/content/projects";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Card } from "@/components/ui/Card";
import {
  ArrowRight,
  CheckCircle2,
  Bot,
  Workflow,
  FileScan,
  MessageSquare,
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  const config = getSiteConfig();
  const allProjects = getProjects();
  const services = getServices();
  const featuredProjects = getFeaturedProjects(allProjects, 6);

  // Map icon keys to Lucide icons
  const iconMap: Record<string, React.ReactNode> = {
    bot: <Bot className="w-6 h-6 text-primary" />,
    workflow: <Workflow className="w-6 h-6 text-primary" />,
    "file-scan": <FileScan className="w-6 h-6 text-primary" />,
    filetext: <FileScan className="w-6 h-6 text-primary" />,
    "file-text": <FileScan className="w-6 h-6 text-primary" />,
    "message-square": <MessageSquare className="w-6 h-6 text-primary" />,
    messagesquare: <MessageSquare className="w-6 h-6 text-primary" />,
    "layout-dashboard": <LayoutDashboard className="w-6 h-6 text-primary" />,
    layoutdashboard: <LayoutDashboard className="w-6 h-6 text-primary" />,
    layoutgrid: <LayoutDashboard className="w-6 h-6 text-primary" />,
    "layout-grid": <LayoutDashboard className="w-6 h-6 text-primary" />,
    "graduation-cap": <GraduationCap className="w-6 h-6 text-primary" />,
    graduationcap: <GraduationCap className="w-6 h-6 text-primary" />,
    sparkles: <Sparkles className="w-6 h-6 text-primary" />,
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 bg-gradient-to-b from-blue-50/40 via-background to-background border-b border-border/50">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-prose space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pragmatic AI & Operational Automation</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text tracking-tight leading-tight">
              {config.siteName}
            </h1>

            <p className="text-xl sm:text-2xl font-semibold text-text-muted">
              {config.headline}
            </p>

            <p className="text-base sm:text-lg text-text-muted leading-relaxed">
              {config.valueProposition}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Button href="/contact" size="lg" variant="primary">
                {config.contactCta}
                <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
              </Button>

              <Button href="/projects" size="lg" variant="outline">
                View Case Studies
              </Button>

              {config.cvUrl && (
                <Button href={config.cvUrl} target="_blank" rel="noopener noreferrer" size="lg" variant="ghost">
                  View CV / Resume
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST INDICATORS & VERIFIED OUTCOMES */}
      <section className="max-w-content mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="outcomes-heading">
        <h2 id="outcomes-heading" className="sr-only">
          Verified Outcomes & Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex items-start space-x-4">
            <div className="p-3 bg-blue-50 text-primary rounded-md">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-text">90%+</div>
              <div className="text-sm font-semibold text-text mt-0.5">Manual Process Reduction</div>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Replaced manual data transcriptions and CSV reconciliation with automated n8n pipelines.
              </p>
            </div>
          </Card>

          <Card className="p-6 flex items-start space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-text">Sub-350ms</div>
              <div className="text-sm font-semibold text-text mt-0.5">AI Inference & Streaming</div>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Optimized local speech and vision models with GPU INT8 quantization and WebRTC telemetry.
              </p>
            </div>
          </Card>

          <Card className="p-6 flex items-start space-x-4">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-text">100%</div>
              <div className="text-sm font-semibold text-text mt-0.5">Production Ownership</div>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Full handover with clean documentation, self-hosted Docker containers, and zero platform lock-in.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* 3. SERVICES OVERVIEW */}
      <section className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 space-y-8" aria-labelledby="services-overview-heading">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-prose space-y-2">
            <h2 id="services-overview-heading" className="text-2xl sm:text-3xl font-bold text-text">
              What I Build
            </h2>
            <p className="text-text-muted text-sm sm:text-base">
              Specialized engineering services tailored for operations teams, startups, and academic institutions.
            </p>
          </div>
          <Link
            href="/services"
            className="text-sm font-semibold text-primary hover:underline inline-flex items-center"
          >
            Explore all services & deliverables
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <Card key={svc.serviceKey} hoverable className="p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-2.5 w-fit rounded-md bg-slate-50 border border-slate-200">
                  {iconMap[svc.iconKey] || <Bot className="w-6 h-6 text-primary" />}
                </div>
                <h3 className="text-lg font-bold text-text">
                  <Link href={`/services#${svc.slug}`} className="hover:text-primary transition-colors">
                    {svc.title}
                  </Link>
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">{svc.summary}</p>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">
                  {svc.capabilities.length} Capabilities
                </span>
                <Link
                  href={`/contact?service=${svc.serviceKey}`}
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center"
                >
                  Discuss this
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PROJECTS */}
      <section className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 space-y-8" aria-labelledby="featured-projects-heading">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-prose space-y-2">
            <h2 id="featured-projects-heading" className="text-2xl sm:text-3xl font-bold text-text">
              Selected Case Studies
            </h2>
            <p className="text-text-muted text-sm sm:text-base">
              Real business problems, implemented architectures, and measurable delivery outcomes.
            </p>
          </div>
          <Link
            href="/projects"
            className="text-sm font-semibold text-primary hover:underline inline-flex items-center"
          >
            Browse all {allProjects.length} projects
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* 5. WORKING PROCESS */}
      <section className="bg-slate-50 py-16 border-y border-border" aria-labelledby="process-heading">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-prose text-center mx-auto space-y-2">
            <h2 id="process-heading" className="text-2xl sm:text-3xl font-bold text-text">
              Working Principles & Process
            </h2>
            <p className="text-text-muted text-sm sm:text-base">
              Structured engineering designed to de-risk AI projects and ensure predictable production value.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                step: "01",
                title: "Discover",
                desc: "Map the real operational bottleneck, existing data schemas, and verify whether AI is the right tool.",
              },
              {
                step: "02",
                title: "Design",
                desc: "Architect data pipelines, guardrails, fallback paths, and clear schema contracts before coding.",
              },
              {
                step: "03",
                title: "Build",
                desc: "Implement lightweight, high-performance services with Next.js, FastAPI, and robust n8n orchestration.",
              },
              {
                step: "04",
                title: "Validate",
                desc: "Test against real-world edge cases, benchmark latency, and verify zero false-positive hallucination risk.",
              },
              {
                step: "05",
                title: "Handover",
                desc: "Deliver containerized deployments, automated health checks, runbooks, and thorough team training.",
              },
            ].map((item) => (
              <div key={item.step} className="bg-surface p-6 rounded-md border border-border space-y-3">
                <span className="text-xs font-extrabold text-primary px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                  {item.step}
                </span>
                <h3 className="text-base font-bold text-text">{item.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-lg p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6 shadow-xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Have a project or workflow in mind?
          </h2>
          <p className="text-blue-100 max-w-prose mx-auto text-sm sm:text-base leading-relaxed">
            Whether you need to automate document processing, build an intelligent Zalo customer bot, or develop a custom management portal, let&apos;s explore practical solutions.
          </p>
          <div className="pt-2">
            <Button
              href="/contact"
              size="lg"
              variant="secondary"
              className="bg-white text-blue-900 hover:bg-blue-50 font-bold"
            >
              {config.contactCta}
              <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
