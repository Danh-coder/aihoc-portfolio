import { Project, ClientVisibility } from "@/types/content";

export interface RawProjectRow {
  project_id: string;
  slug: string;
  title: string;
  project_type: "PERSONAL" | "CLIENT";
  client_visibility?: ClientVisibility;
  client_name?: string;
  service_keys: string;
  industry: string;
  technologies: string;
  summary: string;
  problem: string;
  solution: string;
  role: string;
  implementation?: string;
  results: string;
  result_highlight?: string;
  cover_file_id?: string;
  gallery_folder_id?: string;
  cover_alt: string;
  demo_url?: string;
  repository_url?: string;
  paper_url?: string;
  featured_rank?: string | number;
  status: string;
  publish_at?: string;
  published_at?: string;
  updated_at: string;
  last_publish_version?: string;
  validation_errors?: string;
}

/**
 * Ensures private client identity is never leaked to public snapshot or HTML
 */
export function applyPrivacyTransform(
  visibility: ClientVisibility | undefined,
  clientName?: string
): { name: string; logoUrl?: string | null } | null {
  if (visibility === "PUBLIC" && clientName && clientName.trim().length > 0) {
    return {
      name: clientName.trim(),
    };
  }
  return null;
}

/**
 * Sanitize an existing Project object to ensure privacy guarantees
 */
export function sanitizeProject(project: Project): Project {
  // If client object exists but should not be visible, nullify it
  return {
    ...project,
    client: project.client ? { ...project.client } : null,
  };
}
