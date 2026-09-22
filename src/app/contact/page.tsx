import React from "react";
import { Metadata } from "next";
import { getServices, getSiteConfig } from "@/lib/content/loader";
import { ContactForm } from "@/components/forms/ContactForm";
import { Card } from "@/components/ui/Card";
import { Mail, Clock, ShieldCheck, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Discuss a Project",
  description: "Get in touch to discuss AI engineering, workflow automation, or custom systems development.",
};

interface ContactPageProps {
  searchParams: {
    service?: string;
    sourcePath?: string;
    sourceProjectId?: string;
  };
}

export default function ContactPage({ searchParams }: ContactPageProps) {
  const services = getServices();
  const config = getSiteConfig();

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* HEADER */}
      <div className="max-w-prose space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text tracking-tight">
          Discuss a Project
        </h1>
        <p className="text-lg text-text-muted leading-relaxed">
          Tell me about your business challenge, existing systems, and what you aim to automate or build. I will review your requirements and reach out directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* MAIN CONTACT FORM */}
        <div className="lg:col-span-2">
          <ContactForm
            services={services}
            initialServiceKey={searchParams.service}
            sourcePath={searchParams.sourcePath}
            sourceProjectId={searchParams.sourceProjectId}
          />
        </div>

        {/* SIDEBAR: Expectations & Direct Contact */}
        <aside className="space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold text-text">What to Expect</h2>

            <div className="space-y-4 text-xs text-text-muted">
              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text block">Direct Review</strong>
                  <span>I personally review each submission without automated salespeople or generic pitch decks.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text block">Data Confidentiality</strong>
                  <span>Your operational details and contact info are strictly kept private.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text block">Discovery Call</strong>
                  <span>If there is a good technical fit, we schedule an online discovery session to scope architecture and deliverables.</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Alternative direct contacts */}
          <Card className="p-6 space-y-3 bg-slate-50">
            <h2 className="text-sm font-bold text-text">Direct Contact Channels</h2>
            <p className="text-xs text-text-muted">
              Need immediate clarification or have an RFP document?
            </p>
            <div className="space-y-2 text-xs pt-1">
              {config.contactEmailPublic && (
                <div className="flex items-center space-x-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a
                    href={`mailto:${config.contactEmailPublic}`}
                    className="hover:underline font-medium text-primary"
                  >
                    {config.contactEmailPublic}
                  </a>
                </div>
              )}
              {config.zaloUrl && (
                <div className="flex items-center space-x-2 text-slate-700">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <a
                    href={config.zaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline font-medium text-primary"
                  >
                    Direct Message via Zalo
                  </a>
                </div>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
