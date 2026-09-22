import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, ArrowRight, Home, FolderKanban } from "lucide-react";

export const metadata: Metadata = {
  title: "Inquiry Received",
  description: "Your project inquiry has been successfully received.",
};

interface SuccessPageProps {
  searchParams: {
    leadId?: string;
  };
}

export default function ContactSuccessPage({ searchParams }: SuccessPageProps) {
  const leadId = searchParams.leadId || "LEAD-ACKNOWLEDGED";

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <Card className="max-w-2xl mx-auto p-8 sm:p-12 text-center space-y-8 border-border shadow-card">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-text tracking-tight">
            Inquiry Successfully Received
          </h1>
          <p className="text-text-muted text-base max-w-md mx-auto leading-relaxed">
            Thank you for reaching out. I have received your project details and will review them thoroughly.
          </p>
        </div>

        {/* Lead Reference Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4 max-w-xs mx-auto space-y-1">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Inquiry Reference ID
          </span>
          <div className="text-sm font-mono font-bold text-text">{leadId}</div>
        </div>

        <div className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed border-t border-slate-100 pt-6">
          A confirmation record has been logged in our lead queue. For confidential security reasons, your personal information is not redisplayed here.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button href="/" variant="primary" size="md">
            <Home className="w-4 h-4 mr-2" />
            Return to Home
          </Button>

          <Button href="/projects" variant="outline" size="md">
            <FolderKanban className="w-4 h-4 mr-2" />
            Browse Other Case Studies
          </Button>
        </div>
      </Card>
    </div>
  );
}
