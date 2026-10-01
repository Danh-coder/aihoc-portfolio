import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getServices, getProjects } from "@/lib/content/loader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Bot,
  Workflow,
  FileScan,
  MessageSquare,
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Package,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services & Deliverables",
  description: "Specialized AI engineering, document AI, n8n workflow automation, and custom management systems.",
};

export default function ServicesPage() {
  const services = getServices();
  const allProjects = getProjects();

  const iconMap: Record<string, React.ReactNode> = {
    bot: <Bot className="w-8 h-8 text-primary" />,
    workflow: <Workflow className="w-8 h-8 text-primary" />,
    "file-scan": <FileScan className="w-8 h-8 text-primary" />,
    filetext: <FileScan className="w-8 h-8 text-primary" />,
    "file-text": <FileScan className="w-8 h-8 text-primary" />,
    "message-square": <MessageSquare className="w-8 h-8 text-primary" />,
    messagesquare: <MessageSquare className="w-8 h-8 text-primary" />,
    "layout-dashboard": <LayoutDashboard className="w-8 h-8 text-primary" />,
    layoutdashboard: <LayoutDashboard className="w-8 h-8 text-primary" />,
    layoutgrid: <LayoutDashboard className="w-8 h-8 text-primary" />,
    "layout-grid": <LayoutDashboard className="w-8 h-8 text-primary" />,
    "graduation-cap": <GraduationCap className="w-8 h-8 text-primary" />,
    graduationcap: <GraduationCap className="w-8 h-8 text-primary" />,
    sparkles: <Sparkles className="w-8 h-8 text-primary" />,
  };

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* HEADER */}
      <div className="max-w-prose space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text tracking-tight">
          Services & Solutions
        </h1>
        <p className="text-lg sm:text-xl text-text-muted leading-relaxed">
          Focused engineering services delivering production-ready AI agents, document processing pipelines, workflow orchestration, and custom web applications.
        </p>
      </div>

      {/* SERVICE CARDS */}
      <div className="space-y-12">
        {services.map((svc) => {
          // Find related case studies for this service
          const relatedProjects = allProjects
            .filter((p) => p.serviceKeys.includes(svc.serviceKey))
            .slice(0, 2);

          return (
            <Card
              key={svc.serviceKey}
              id={svc.slug}
              className="p-8 sm:p-10 space-y-8 scroll-mt-24 border border-border"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-start space-x-5">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg shrink-0">
                    {iconMap[svc.iconKey] || <Bot className="w-8 h-8 text-primary" />}
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-text">{svc.title}</h2>
                    <p className="text-text-muted max-w-2xl text-base leading-relaxed">
                      {svc.summary}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <Button
                    href={`/contact?service=${encodeURIComponent(svc.serviceKey)}`}
                    size="md"
                    variant="primary"
                  >
                    Discuss {svc.title}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Capabilities & Deliverables Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Capabilities */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm font-semibold text-text uppercase tracking-wider">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Technical Capabilities</span>
                  </div>
                  <ul className="space-y-2 text-sm text-text-muted">
                    {svc.capabilities.map((cap, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-primary mr-2 font-bold">•</span>
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Deliverables */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm font-semibold text-text uppercase tracking-wider">
                    <Package className="w-4 h-4 text-emerald-600" />
                    <span>What You Receive</span>
                  </div>
                  <ul className="space-y-2 text-sm text-text-muted">
                    {svc.deliverables.map((del, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-emerald-600 mr-2 font-bold">•</span>
                        <span>{del}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Related Case Studies */}
              {relatedProjects.length > 0 && (
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <span className="text-slate-400 font-medium">Related Case Studies:</span>
                  <div className="flex flex-wrap items-center gap-3">
                    {relatedProjects.map((p) => (
                      <Link
                        key={p.id}
                        href={`/projects/${p.slug}`}
                        className="font-semibold text-primary hover:underline bg-blue-50/70 border border-blue-100 px-3 py-1.5 rounded-sm inline-flex items-center"
                      >
                        <span>{p.title}</span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
