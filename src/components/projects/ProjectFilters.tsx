"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProjectFiltersProps {
  availableServices: { key: string; title: string }[];
  availableIndustries: string[];
  availableTechnologies: string[];
  totalResults: number;
}

export function ProjectFilters({
  availableServices,
  availableIndustries,
  availableTechnologies,
  totalResults,
}: ProjectFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";
  const currentTypes = searchParams.getAll("type");
  const currentServices = searchParams.getAll("service");
  const currentIndustries = searchParams.getAll("industry");
  const currentTech = searchParams.getAll("tech");

  const hasActiveFilters =
    Boolean(currentSearch) ||
    currentTypes.length > 0 ||
    currentServices.length > 0 ||
    currentIndustries.length > 0 ||
    currentTech.length > 0;

  // Helper to push updated query parameters
  const updateQuery = (key: string, values: string[] | string) => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete(key);
    if (Array.isArray(values)) {
      values.forEach((val) => {
        if (val) params.append(key, val);
      });
    } else if (values) {
      params.set(key, values);
    }

    // Reset pagination to 1 whenever filters change
    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const toggleFilter = (key: string, value: string) => {
    const existing = searchParams.getAll(key);
    const updated = existing.includes(value)
      ? existing.filter((v) => v !== value)
      : [...existing, value];
    updateQuery(key, updated);
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  return (
    <div className="space-y-6 bg-surface p-6 rounded-md border border-border shadow-sm">
      {/* Search and Results Counter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search projects, technologies, or keywords..."
            value={currentSearch}
            onChange={(e) => updateQuery("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-border rounded-sm text-text placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
            aria-label="Search projects"
          />
          {currentSearch && (
            <button
              type="button"
              onClick={() => updateQuery("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-text rounded"
              aria-label="Clear search text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-sm font-medium text-text-muted" aria-live="polite">
            Showing <strong className="text-text">{totalResults}</strong> {totalResults === 1 ? "project" : "projects"}
          </span>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs h-8 text-slate-600 hover:text-text"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-sm">
        {/* Project Type */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Project Type
          </label>
          <div className="flex flex-wrap gap-1.5">
            {["PERSONAL", "CLIENT"].map((type) => {
              const active = currentTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleFilter("type", type)}
                  className={`px-3 py-1 text-xs font-medium rounded-sm border transition-colors tap-target ${
                    active
                      ? "bg-primary text-white border-primary"
                      : "bg-slate-50 text-slate-600 border-border hover:bg-slate-100"
                  }`}
                  aria-pressed={active}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Services */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Service
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableServices.map((svc) => {
              const active = currentServices.includes(svc.key);
              return (
                <button
                  key={svc.key}
                  type="button"
                  onClick={() => toggleFilter("service", svc.key)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-sm border transition-colors tap-target ${
                    active
                      ? "bg-primary text-white border-primary"
                      : "bg-slate-50 text-slate-600 border-border hover:bg-slate-100"
                  }`}
                  aria-pressed={active}
                >
                  {svc.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Industry
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
            {availableIndustries.map((ind) => {
              const active = currentIndustries.includes(ind);
              return (
                <button
                  key={ind}
                  type="button"
                  onClick={() => toggleFilter("industry", ind)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-sm border transition-colors tap-target ${
                    active
                      ? "bg-primary text-white border-primary"
                      : "bg-slate-50 text-slate-600 border-border hover:bg-slate-100"
                  }`}
                  aria-pressed={active}
                >
                  {ind}
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Technologies */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Technology
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
            {availableTechnologies.slice(0, 10).map((tech) => {
              const active = currentTech.includes(tech);
              return (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleFilter("tech", tech)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-sm border transition-colors tap-target ${
                    active
                      ? "bg-primary text-white border-primary"
                      : "bg-slate-50 text-slate-600 border-border hover:bg-slate-100"
                  }`}
                  aria-pressed={active}
                >
                  {tech}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
