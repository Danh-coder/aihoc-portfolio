import React from "react";
import { Metadata } from "next";
import { getSiteConfig } from "@/lib/content/loader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  GraduationCap,
  Layers,
  Award,
  Terminal,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About & Background",
  description: "Background, professional philosophy, capability groups, and working principles of Danh Phan.",
};

export default function AboutPage() {
  const config = getSiteConfig();

  const capabilities = [
    {
      title: "AI & Machine Learning",
      icon: <Cpu className="w-5 h-5 text-primary" />,
      items: [
        "LLM Application Engineering (LangChain, LangGraph, Prompt Optimization)",
        "Retrieval-Augmented Generation (RAG) & Vector Databases",
        "Document AI, Multi-engine OCR (PaddleOCR, Surya), and Schema Normalization",
        "Speech Inference Pipelines (Faster-Whisper, VITS streaming)",
      ],
    },
    {
      title: "Workflow & Cloud Automation",
      icon: <Layers className="w-5 h-5 text-primary" />,
      items: [
        "n8n Self-Hosted Orchestration & Webhook Security",
        "Cross-System Data Sync (Google Workspace, Zalo OA, Telegram, CRM)",
        "Scheduled Batch Pipelines & Audit Logs",
        "Headless Browser Automation & Scraping (Playwright)",
      ],
    },
    {
      title: "Full-Stack & Systems Engineering",
      icon: <Terminal className="w-5 h-5 text-primary" />,
      items: [
        "TypeScript, Next.js (App Router), Tailwind CSS",
        "Python, FastAPI, Node.js REST & WebSocket Backends",
        "PostgreSQL Relational Modeling & Index Tuning",
        "Docker Containerization, Nginx/Caddy Proxies, Linux VPS Administration",
      ],
    },
  ];

  const workingPrinciples = [
    {
      title: "Pragmatic Scope",
      desc: "Solve the core business bottleneck first. Avoid over-engineering systems that can be accomplished with reliable, deterministic logic.",
    },
    {
      title: "Right Level of AI",
      desc: "Do not insert generative AI where simple rule-based validation or deterministic scripts are faster, cheaper, and 100% accurate.",
    },
    {
      title: "Human-in-the-Loop for High-Risk Output",
      desc: "Whenever AI parses sensitive financial, medical, or legal documents, flag low-confidence predictions for fast human review.",
    },
    {
      title: "Data Sovereignty & Privacy",
      desc: "Private customer data and internal records should never leave your controlled cloud or VPS without explicit consent.",
    },
    {
      title: "Complete Documentation & Handover",
      desc: "Every project includes clear architectural diagrams, operations runbooks, and team handover sessions.",
    },
  ];

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* 1. HEADER & BIOGRAPHY */}
      <section className="max-w-prose space-y-6">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text tracking-tight">
          About Danh Phan
        </h1>
        <p className="text-xl font-medium text-primary">
          {config.headline}
        </p>
        <div className="prose text-text-muted space-y-4 text-base sm:text-lg leading-relaxed">
          <p>
            {config.aboutShort}
          </p>
          <p>
            {config.aboutLong}
          </p>
        </div>
        {config.cvUrl && (
          <div className="pt-2">
            <Button href={config.cvUrl} target="_blank" rel="noopener noreferrer" variant="outline">
              View Full CV / Resume (Google Drive)
            </Button>
          </div>
        )}
      </section>

      {/* 2. CAPABILITIES */}
      <section className="space-y-8" aria-labelledby="capabilities-heading">
        <div className="space-y-2">
          <h2 id="capabilities-heading" className="text-2xl font-bold text-text">
            Core Capability Groups
          </h2>
          <p className="text-sm text-text-muted">
            Focused disciplines where I bring end-to-end delivery capability from architecture to production.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {capabilities.map((group) => (
            <Card key={group.title} className="p-6 space-y-4">
              <div className="p-2.5 w-fit rounded-md bg-blue-50 border border-blue-100">
                {group.icon}
              </div>
              <h3 className="text-lg font-bold text-text">{group.title}</h3>
              <ul className="space-y-2 text-sm text-text-muted">
                {group.items.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. WORKING PRINCIPLES */}
      <section className="space-y-8" aria-labelledby="principles-heading">
        <div className="space-y-2">
          <h2 id="principles-heading" className="text-2xl font-bold text-text">
            Guiding Principles
          </h2>
          <p className="text-sm text-text-muted">
            The engineering standards and ethical commitments behind every deployed solution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workingPrinciples.map((item) => (
            <div key={item.title} className="p-6 bg-surface rounded-md border border-border space-y-2">
              <div className="flex items-center space-x-2 text-primary font-bold">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <h3 className="text-base text-text">{item.title}</h3>
              </div>
              <p className="text-sm text-text-muted leading-relaxed pl-7">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. EDUCATION & ACHIEVEMENTS */}
      <section className="space-y-8" aria-labelledby="achievements-heading">
        <div className="space-y-2">
          <h2 id="achievements-heading" className="text-2xl font-bold text-text">
            Education & Background
          </h2>
          <p className="text-sm text-text-muted">Academic foundations and practical research milestones.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 flex items-start space-x-4">
            <div className="p-3 bg-slate-100 rounded-md text-slate-700">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text">Engineering Degree / Applied Computing</h3>
              <p className="text-sm text-primary font-medium">Computer Science & Automation Systems</p>
              <p className="text-xs text-text-muted leading-relaxed pt-1">
                Rigorous training in algorithm design, software architecture, mathematical modeling, and distributed computing.
              </p>
            </div>
          </Card>

          <Card className="p-6 flex items-start space-x-4">
            <div className="p-3 bg-amber-50 rounded-md text-amber-700">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text">Production Automation Delivery</h3>
              <p className="text-sm text-amber-700 font-medium">Enterprise & Academic Systems</p>
              <p className="text-xs text-text-muted leading-relaxed pt-1">
                Successfully delivered document AI pipelines, Zalo conversational bots, and management systems saving thousands of operational hours.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* 5. CTA */}
      <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-bold text-text">Interested in collaborating?</h3>
          <p className="text-sm text-text-muted">
            Let&apos;s discuss how practical AI automation can streamline your team&apos;s workflow.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {config.cvUrl && (
            <Button href={config.cvUrl} target="_blank" rel="noopener noreferrer" size="lg" variant="outline">
              View CV / Resume
            </Button>
          )}
          <Button href="/contact" size="lg" variant="primary">
            {config.contactCta}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
