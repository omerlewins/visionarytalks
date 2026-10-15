import type { GlobalConfig } from "payload";
import { admins, editors } from "./access";
import {
  validMeasurementId,
  validPropertyId,
  validSearchProperty,
  validVerification,
} from "@/lib/integration-validation";
const optional =
  (check: (v: unknown) => boolean, message: string) => (v: unknown) =>
    v === undefined || v === null || v === "" || check(v) ? true : message;
export const integrations: GlobalConfig = {
  slug: "integrations",
  label: "Search & Analytics",
  admin: {
    group: "Settings",
    description:
      "Connect Google Search Console and GA4. Save the settings before checking access. Tracking stays disabled on Preview.",
  },
  access: { read: editors, update: admins },
  fields: [
    {
      name: "searchConsoleProperty",
      label: "Search Console property",
      type: "text",
      validate: optional(
        validSearchProperty,
        "Use sc-domain:visionarytalks.com or an https URL-prefix property.",
      ),
      admin: {
        description:
          "Exact property shown in Google Search Console, for example sc-domain:visionarytalks.com.",
      },
    },
    {
      name: "googleVerificationToken",
      label: "Google site verification token",
      type: "text",
      validate: optional(
        validVerification,
        "Paste only the token, not the full HTML tag.",
      ),
      admin: {
        description:
          "Optional HTML verification token for a URL-prefix property. Domain properties require Google's DNS verification.",
      },
    },
    {
      name: "ga4PropertyId",
      label: "GA4 property ID",
      type: "text",
      validate: optional(validPropertyId, "Use the numeric GA4 property ID."),
      admin: {
        description:
          "Numeric ID from Analytics Admin → Property details. Used for reading reports.",
      },
    },
    {
      name: "ga4MeasurementId",
      label: "GA4 measurement ID",
      type: "text",
      validate: optional(
        validMeasurementId,
        "Use a GA4 measurement ID such as G-ABC1234567.",
      ),
      admin: {
        description:
          "G- ID from the web data stream. Used for website tracking.",
      },
    },
    {
      name: "trackingEnabled",
      label: "Enable GA4 on the live website",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "Production only. Visitors can allow or decline analytics. No tracking runs on staging or in the CMS.",
      },
    },
    {
      name: "connectionCheck",
      type: "ui",
      admin: {
        components: {
          Field: "/components/admin/IntegrationCheck#IntegrationCheck",
        },
      },
    },
  ],
};
