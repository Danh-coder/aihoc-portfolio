import { z } from "zod";

export const InquiryTimelineEnum = z.enum([
  "ASAP",
  "1_3_MONTHS",
  "3_6_MONTHS",
  "FLEXIBLE",
  "UNKNOWN",
]);

export const InquiryBudgetRangeEnum = z.enum([
  "NOT_SURE",
  "UNDER_10M",
  "10M_30M",
  "30M_100M",
  "OVER_100M",
]);

export const InquiryPreferredChannelEnum = z.enum([
  "EMAIL",
  "PHONE",
  "ZALO",
  "ONLINE_MEETING",
]);

export const InquirySchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters")
    .trim(),
  email: z
    .string()
    .email("Please provide a valid work email address")
    .toLowerCase()
    .trim(),
  organization: z.string().max(150).trim().optional().default(""),
  phone: z.string().max(30).trim().optional().default(""),
  serviceKey: z.string().min(1, "Please select a service"),
  requirement: z
    .string()
    .min(30, "Requirement description must be at least 30 characters")
    .max(5000, "Requirement cannot exceed 5000 characters")
    .trim(),
  timeline: InquiryTimelineEnum.default("1_3_MONTHS"),
  budgetRange: InquiryBudgetRangeEnum.optional().default("NOT_SURE"),
  preferredChannel: InquiryPreferredChannelEnum.default("EMAIL"),
  sourcePath: z.string().max(255).optional().default("/contact"),
  sourceProjectId: z.string().max(100).nullable().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must consent to being contacted about this inquiry." }),
  }),
  website: z.string().optional().default(""), // Honeypot field
});

export type ValidatedInquiry = z.infer<typeof InquirySchema>;
