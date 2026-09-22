import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Home, FolderKanban, Mail } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <Card className="max-w-lg mx-auto p-8 sm:p-12 text-center space-y-6 border-border shadow-card">
        <span className="text-6xl font-black text-primary block">404</span>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text">Page or Project Not Found</h1>
          <p className="text-sm text-text-muted leading-relaxed">
            The project or link you requested is either draft, archived, or does not exist.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button href="/" variant="primary" size="sm">
            <Home className="w-4 h-4 mr-1.5" />
            Home
          </Button>

          <Button href="/projects" variant="outline" size="sm">
            <FolderKanban className="w-4 h-4 mr-1.5" />
            Browse Projects
          </Button>

          <Button href="/contact" variant="ghost" size="sm">
            <Mail className="w-4 h-4 mr-1.5" />
            Contact
          </Button>
        </div>
      </Card>
    </div>
  );
}
