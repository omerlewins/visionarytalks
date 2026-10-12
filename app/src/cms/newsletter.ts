import type { CollectionConfig } from "payload";
import { admins, editors } from "./access";

export const newsletterRegistrations: CollectionConfig = {
  slug: "newsletter-registrations",
  labels: {
    singular: "Newsletter registration",
    plural: "Newsletter registrations",
  },
  admin: {
    useAsTitle: "email",
    group: "Audience",
    defaultColumns: ["email", "status", "consentedAt", "sourcePath"],
    description:
      "Consented registrations only. Addresses are unverified and no newsletter emails are sent by this website. Connect verification and unsubscribe handling before enabling delivery.",
  },
  access: { read: editors, create: admins, update: admins, delete: admins },
  fields: [
    { name: "email", type: "email", required: true, unique: true, index: true },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "registered",
      options: ["registered", "withdrawn"],
    },
    {
      name: "emailVerified",
      type: "checkbox",
      defaultValue: false,
      admin: { readOnly: true },
    },
    {
      name: "consentedAt",
      type: "date",
      required: true,
      admin: { readOnly: true },
    },
    {
      name: "consentVersion",
      type: "text",
      required: true,
      admin: { readOnly: true },
    },
    {
      name: "sourcePath",
      type: "text",
      required: true,
      admin: { readOnly: true },
    },
  ],
};
