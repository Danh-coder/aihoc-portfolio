"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ProjectMedia } from "@/types/content";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface ProjectGalleryProps {
  media: ProjectMedia[];
  title: string;
}

export function ProjectGallery({ media, title }: ProjectGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") {
        setSelectedIndex(null);
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev !== null && prev < media.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : media.length - 1));
      }
    };

    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, media.length]);

  if (!media || media.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4" aria-labelledby="gallery-heading">
      <h2 id="gallery-heading" className="text-xl font-bold text-text">
        Project Artifacts & Visuals
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {media.map((item, index) => (
          <figure
            key={index}
            className="group relative bg-surface border border-border rounded-md overflow-hidden shadow-sm hover:shadow-card transition-all cursor-pointer"
            onClick={() => setSelectedIndex(index)}
          >
            <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
              <Image
                src={item.src}
                alt={item.alt || `${title} artifact ${index + 1}`}
                width={item.width || 800}
                height={item.height || 450}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="bg-surface/90 text-text p-2 rounded-full shadow">
                  <Maximize2 className="w-4 h-4" />
                </span>
              </div>
            </div>
            {item.caption && (
              <figcaption className="p-3 text-xs text-text-muted border-t border-slate-100">
                {item.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {/* Accessible Fullscreen Modal Preview */}
      {selectedIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="absolute -top-12 right-0 tap-target p-2 text-white/80 hover:text-white rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close image preview (Escape)"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Nav */}
            {media.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setSelectedIndex((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : media.length - 1
                  )
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 tap-target p-3 bg-black/50 text-white hover:bg-black/75 rounded-full"
                aria-label="Previous image (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Active Image */}
            <div className="relative w-full max-h-[75vh] flex items-center justify-center">
              <Image
                src={media[selectedIndex].src}
                alt={media[selectedIndex].alt}
                width={media[selectedIndex].width || 1200}
                height={media[selectedIndex].height || 700}
                className="max-h-[75vh] w-auto object-contain rounded"
              />
            </div>

            {/* Right Nav */}
            {media.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setSelectedIndex((prev) =>
                    prev !== null && prev < media.length - 1 ? prev + 1 : 0
                  )
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 tap-target p-3 bg-black/50 text-white hover:bg-black/75 rounded-full"
                aria-label="Next image (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Caption & Counter */}
            <div className="mt-4 text-center text-slate-300 text-sm">
              <p className="font-medium">{media[selectedIndex].caption || media[selectedIndex].alt}</p>
              <p className="text-xs text-slate-400 mt-1">
                {selectedIndex + 1} of {media.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
