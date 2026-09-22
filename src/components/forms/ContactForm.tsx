"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Service } from "@/types/content";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";

interface ContactFormProps {
  services: Service[];
  initialServiceKey?: string;
  sourcePath?: string;
  sourceProjectId?: string;
}

export function ContactForm({
  services,
  initialServiceKey = "",
  sourcePath = "/contact",
  sourceProjectId,
}: ContactFormProps) {
  const router = useRouter();

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceKey, setServiceKey] = useState(initialServiceKey || (services[0]?.serviceKey || ""));
  const [requirement, setRequirement] = useState("");
  const [timeline, setTimeline] = useState("1_3_MONTHS");
  const [budgetRange, setBudgetRange] = useState("NOT_SURE");
  const [preferredChannel, setPreferredChannel] = useState("EMAIL");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // Honeypot

  // Submission State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent double submission

    setErrorMessage(null);
    setValidationErrors({});

    // Client-side quick checks
    const errors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = "Please enter your full name (minimum 2 characters).";
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      errors.email = "Please enter a valid work email address.";
    }
    if (!serviceKey) {
      errors.serviceKey = "Please select a service.";
    }
    if (!requirement.trim() || requirement.trim().length < 30) {
      errors.requirement = `Please describe your requirement in at least 30 characters (currently ${requirement.trim().length}).`;
    }
    if (!consent) {
      errors.consent = "You must give consent to be contacted about this project inquiry.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          organization,
          phone,
          serviceKey,
          requirement,
          timeline,
          budgetRange,
          preferredChannel,
          sourcePath,
          sourceProjectId: sourceProjectId || null,
          consent,
          website, // Honeypot
        }),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        // Form submitted successfully, redirect to success view with Lead ID
        const leadId = data.leadId || "LEAD-RECEIVED";
        router.push(`/contact/success?leadId=${encodeURIComponent(leadId)}`);
      } else {
        setErrorMessage(
          data.message || "We could not submit your request at this moment. Your entered information has been preserved. Please try again."
        );
      }
    } catch {
      setErrorMessage(
        "Network connection error. Your entered information has been preserved. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 bg-surface p-6 sm:p-8 rounded-lg border border-border shadow-card"
      aria-labelledby="contact-form-heading"
    >
      <h2 id="contact-form-heading" className="text-xl font-bold text-text mb-4">
        Project Discussion Inquiry
      </h2>

      {/* Global Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-md bg-red-50 border border-red-200 text-error flex items-start space-x-3 text-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-error" aria-hidden="true" />
          <div>
            <p className="font-semibold">Submission problem</p>
            <p className="mt-1 text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Row 1: Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold text-text mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-sm border text-text text-sm bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              validationErrors.fullName ? "border-error bg-red-50/30" : "border-border"
            }`}
            placeholder="Nguyen Van A"
            aria-invalid={Boolean(validationErrors.fullName)}
            aria-describedby={validationErrors.fullName ? "fullName-error" : undefined}
          />
          {validationErrors.fullName && (
            <p id="fullName-error" className="mt-1 text-xs text-error font-medium">
              {validationErrors.fullName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-text mb-1.5">
            Work Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-sm border text-text text-sm bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              validationErrors.email ? "border-error bg-red-50/30" : "border-border"
            }`}
            placeholder="name@company.com"
            aria-invalid={Boolean(validationErrors.email)}
            aria-describedby={validationErrors.email ? "email-error" : undefined}
          />
          {validationErrors.email && (
            <p id="email-error" className="mt-1 text-xs text-error font-medium">
              {validationErrors.email}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Organization & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="organization" className="block text-sm font-semibold text-text mb-1.5">
            Organization / Company <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            id="organization"
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-sm border border-border text-text text-sm bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="Acme Corp, University, or Startup"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-text mb-1.5">
            Phone / Zalo Number <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-sm border border-border text-text text-sm bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="+84 90 123 4567"
          />
        </div>
      </div>

      {/* Row 3: Service Selection */}
      <div>
        <label htmlFor="serviceKey" className="block text-sm font-semibold text-text mb-1.5">
          Service Area of Interest <span className="text-red-500">*</span>
        </label>
        <select
          id="serviceKey"
          required
          value={serviceKey}
          onChange={(e) => setServiceKey(e.target.value)}
          className={`w-full px-3.5 py-2.5 rounded-sm border text-text text-sm bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            validationErrors.serviceKey ? "border-error" : "border-border"
          }`}
          aria-invalid={Boolean(validationErrors.serviceKey)}
        >
          {services.map((svc) => (
            <option key={svc.serviceKey} value={svc.serviceKey}>
              {svc.title}
            </option>
          ))}
          <option value="OTHER">Other / Custom AI Problem</option>
        </select>
        {validationErrors.serviceKey && (
          <p className="mt-1 text-xs text-error font-medium">{validationErrors.serviceKey}</p>
        )}
      </div>

      {/* Row 4: Requirement Description */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="requirement" className="block text-sm font-semibold text-text">
            Project Description & Requirements <span className="text-red-500">*</span>
          </label>
          <span
            className={`text-xs ${
              requirement.trim().length >= 30 ? "text-slate-400" : "text-amber-600 font-medium"
            }`}
          >
            {requirement.trim().length} / 5000 characters (min 30)
          </span>
        </div>
        <textarea
          id="requirement"
          required
          rows={5}
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          className={`w-full px-3.5 py-2.5 rounded-sm border text-text text-sm bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary leading-relaxed ${
            validationErrors.requirement ? "border-error bg-red-50/30" : "border-border"
          }`}
          placeholder="Briefly describe your business process, the manual bottleneck or data source, and what outcome you want the system to achieve..."
          aria-invalid={Boolean(validationErrors.requirement)}
          aria-describedby={validationErrors.requirement ? "requirement-error" : undefined}
        />
        {validationErrors.requirement && (
          <p id="requirement-error" className="mt-1 text-xs text-error font-medium">
            {validationErrors.requirement}
          </p>
        )}
        <p className="text-xs text-slate-400 mt-1">
          Note: If you have specification documents or diagrams, please include a shareable cloud link here.
        </p>
      </div>

      {/* Row 5: Timeline, Budget, Preferred Channel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label htmlFor="timeline" className="block text-sm font-semibold text-text mb-1.5">
            Expected Timeline
          </label>
          <select
            id="timeline"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="w-full px-3 py-2 rounded-sm border border-border text-text text-sm bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="ASAP">As soon as possible</option>
            <option value="1_3_MONTHS">1 to 3 months</option>
            <option value="3_6_MONTHS">3 to 6 months</option>
            <option value="FLEXIBLE">Flexible</option>
            <option value="UNKNOWN">Not sure yet</option>
          </select>
        </div>

        <div>
          <label htmlFor="budgetRange" className="block text-sm font-semibold text-text mb-1.5">
            Budget Range <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <select
            id="budgetRange"
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
            className="w-full px-3 py-2 rounded-sm border border-border text-text text-sm bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="NOT_SURE">Not sure / To be estimated</option>
            <option value="UNDER_10M">&lt; 10M VND</option>
            <option value="10M_30M">10M - 30M VND</option>
            <option value="30M_100M">30M - 100M VND</option>
            <option value="OVER_100M">&gt; 100M VND</option>
          </select>
        </div>

        <div>
          <label htmlFor="preferredChannel" className="block text-sm font-semibold text-text mb-1.5">
            Preferred Channel
          </label>
          <select
            id="preferredChannel"
            value={preferredChannel}
            onChange={(e) => setPreferredChannel(e.target.value)}
            className="w-full px-3 py-2 rounded-sm border border-border text-text text-sm bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="EMAIL">Email</option>
            <option value="ZALO">Zalo</option>
            <option value="PHONE">Phone Call</option>
            <option value="ONLINE_MEETING">Google Meet / Online</option>
          </select>
        </div>
      </div>

      {/* Honeypot field (hidden from sighted users and screen readers) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website (Leave blank)</label>
        <input
          id="website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {/* Consent Checkbox */}
      <div className="pt-2">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border text-primary focus-visible:ring-primary"
            aria-invalid={Boolean(validationErrors.consent)}
          />
          <span className="text-xs text-text-muted leading-relaxed">
            I consent to Phan Cong Danh collecting and using the provided details strictly for reviewing and responding to this project inquiry. Data is not shared with any third parties. <span className="text-red-500">*</span>
          </span>
        </label>
        {validationErrors.consent && (
          <p className="mt-1 text-xs text-error font-medium">{validationErrors.consent}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          No automated price guarantees or unsolicited sales follow-ups.
        </p>

        <Button
          type="submit"
          size="md"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
          className="min-w-[160px]"
        >
          <Send className="w-4 h-4 mr-2" aria-hidden="true" />
          {isLoading ? "Submitting..." : "Submit Inquiry"}
        </Button>
      </div>
    </form>
  );
}
