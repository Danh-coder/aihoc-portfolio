import React from "react";
import { Metadata } from "next";
import { getSiteConfig } from "@/lib/content/loader";
import { ShieldCheck, Lock, FileText, Trash2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy and data governance practices for Danh Phan's portfolio website.",
};

export default function PrivacyPage() {
  const config = getSiteConfig();

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="max-w-prose space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-400">
          Last updated: September 22, 2026 • Policy Version 1.0.0
        </p>
      </div>

      <div className="max-w-3xl space-y-10 text-text-muted leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2 text-text font-bold text-xl">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2>1. Purpose of Data Collection</h2>
          </div>
          <p>
            This website collects information provided by visitors solely to evaluate, respond to, and communicate about project and engineering inquiries submitted through the contact form. No personal data is sold, rented, or shared with third-party advertisers.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2 text-text font-bold text-xl">
            <FileText className="w-5 h-5 text-primary" />
            <h2>2. Collected Information</h2>
          </div>
          <p>
            When submitting an inquiry, we collect:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Full name</li>
            <li>Work email address</li>
            <li>Organization / company name (optional)</li>
            <li>Phone number or Zalo handle (optional)</li>
            <li>Project requirements description and timeline preferences</li>
            <li>Originating case study or service page reference</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2 text-text font-bold text-xl">
            <Lock className="w-5 h-5 text-primary" />
            <h2>3. Storage, Security & Retention</h2>
          </div>
          <p>
            All submitted inquiry payloads are transmitted securely via encrypted HTTPS and processed through server-side authenticated automation (n8n) into a private, restricted Google Sheet accessible solely by {config.siteName}.
          </p>
          <p>
            <strong>Retention Period:</strong> Inquiries are retained for a maximum of 24 months after the last business interaction, after which records are archived and reviewed for scheduled permanent deletion.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2 text-text font-bold text-xl">
            <Trash2 className="w-5 h-5 text-primary" />
            <h2>4. Your Rights & Data Deletion Requests</h2>
          </div>
          <p>
            You have the right to request a copy of the information we hold about you or request the immediate deletion of your submitted inquiry data.
          </p>
          <p>
            To request deletion, please contact directly at{" "}
            {config.contactEmailPublic ? (
              <a href={`mailto:${config.contactEmailPublic}`} className="text-primary font-semibold hover:underline">
                {config.contactEmailPublic}
              </a>
            ) : (
              "our designated contact email"
            )}{" "}
            with the subject line <em>Data Deletion Request</em> and your Lead Reference ID.
          </p>
        </section>
      </div>
    </div>
  );
}
