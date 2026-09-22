import React from "react";
import Link from "next/link";
import { SiteConfig } from "@/types/content";
import { Github, Linkedin, Mail, MessageSquare } from "lucide-react";

interface FooterProps {
  config: SiteConfig;
}

export function Footer({ config }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Bio */}
          <div className="md:col-span-2 space-y-4">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-white hover:text-blue-400 transition-colors inline-block"
            >
              {config.siteName}
              <span className="text-primary ml-1">.</span>
            </Link>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              {config.headline}. Delivering reliable, production-ready AI agents, document AI, and workflow automation.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/projects" className="hover:text-white transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About & Background
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Discuss a Project
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Social & Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Connect
            </h3>
            <ul className="space-y-3 text-sm">
              {config.contactEmailPublic && (
                <li>
                  <a
                    href={`mailto:${config.contactEmailPublic}`}
                    className="inline-flex items-center text-slate-300 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4 mr-2 text-slate-400" aria-hidden="true" />
                    <span>{config.contactEmailPublic}</span>
                  </a>
                </li>
              )}
              {config.githubUrl && (
                <li>
                  <a
                    href={config.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-slate-300 hover:text-white transition-colors"
                  >
                    <Github className="w-4 h-4 mr-2 text-slate-400" aria-hidden="true" />
                    <span>GitHub</span>
                  </a>
                </li>
              )}
              {config.linkedinUrl && (
                <li>
                  <a
                    href={config.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-slate-300 hover:text-white transition-colors"
                  >
                    <Linkedin className="w-4 h-4 mr-2 text-slate-400" aria-hidden="true" />
                    <span>LinkedIn</span>
                  </a>
                </li>
              )}
              {config.zaloUrl && (
                <li>
                  <a
                    href={config.zaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-slate-300 hover:text-white transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 mr-2 text-slate-400" aria-hidden="true" />
                    <span>Zalo</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} {config.siteName}. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Notice
            </Link>
            <span>•</span>
            <Link href="/api/health" className="hover:text-slate-300 transition-colors">
              System Health
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
