import type { CollectionConfig, CollectionSlug, Field } from "payload";
import { revalidatePath } from "next/cache";
import { admins, editors, staff, published, publicationGuard } from "./access";
import { publicPath } from "@/lib/domain";
const text = (name: string, required = false): Field => ({
  name,
  type: "text",
  required,
});
const relation = (
  name: string,
  relationTo: CollectionSlug,
  hasMany = false,
): Field =>
  hasMany
    ? { name, type: "relationship", relationTo, hasMany: true }
    : { name, type: "relationship", relationTo, hasMany: false };
const sources = () => ({
  ...relation("sources", "sources", true),
  required: true,
});
const statusFields: Field[] = [
  {
    name: "_status",
    type: "select",
    options: ["draft", "published"],
    defaultValue: "draft",
    index: true,
  },
];
const privateAccess = {
  read: staff,
  create: staff,
  update: staff,
  delete: admins,
};
function entity(slug: string, fields: Field[]): CollectionConfig {
  return {
    slug,
    admin: { useAsTitle: "name", group: "Structured reporting" },
    access: { read: published, create: staff, update: staff, delete: editors },
    hooks: { beforeChange: [publicationGuard] },
    fields: [
      text("name", true),
      { name: "canonicalKey", type: "text", unique: true, index: true },
      ...statusFields,
      ...fields,
    ],
  };
}
const metricFields: Field[] = [
  text("label", true),
  { name: "value", type: "number" },
  text("currency"),
  text("unit", true),
  text("period", true),
  text("definition", true),
  {
    name: "basis",
    type: "select",
    required: true,
    options: ["reported", "estimated", "calculated"],
  },
  text("geography"),
  { name: "sourceIds", type: "json", required: true },
];
export const collections: CollectionConfig[] = [
  {
    slug: "users",
    auth: { maxLoginAttempts: 5, lockTime: 600000 },
    admin: { useAsTitle: "email", group: "Administration" },
    access: {
      read: admins,
      create: admins,
      update: ({ req, id }) =>
        req.user?.role === "admin" || req.user?.id === id,
      delete: admins,
    },
    fields: [
      text("name", true),
      {
        name: "role",
        type: "select",
        required: true,
        defaultValue: "contributor",
        options: ["admin", "editor", "contributor"],
        access: {
          create: ({ req }) => req.user?.role === "admin",
          update: ({ req }) => req.user?.role === "admin",
        },
      },
    ],
  },
  {
    slug: "authors",
    admin: { useAsTitle: "name" },
    access: {
      read: () => true,
      create: editors,
      update: editors,
      delete: admins,
    },
    fields: [
      text("name", true),
      text("path"),
      { name: "bio", type: "textarea" },
      text("legacyKey"),
    ],
  },
  {
    slug: "sources",
    admin: { useAsTitle: "title" },
    access: { read: published, create: staff, update: staff, delete: editors },
    hooks: { beforeChange: [publicationGuard] },
    fields: [
      text("title", true),
      text("url", true),
      text("publisher", true),
      { name: "publishedAt", type: "date" },
      { name: "reviewedAt", type: "date" },
      { name: "evidence", type: "textarea" },
      ...statusFields,
    ],
  },
  {
    slug: "media",
    access: {
      read: ({ req }) => (req.user ? true : { approved: { equals: true } }),
      create: staff,
      update: editors,
      delete: admins,
    },
    upload: {
      staticDir: "media",
      mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
      imageSizes: [
        { name: "thumbnail", width: 480 },
        { name: "editorial", width: 1200 },
      ],
      focalPoint: true,
    },
    fields: [
      text("alt", true),
      text("caption"),
      text("credit", true),
      text("originalURL"),
      text("checksum"),
      { name: "generated", type: "checkbox" },
      { name: "provenance", type: "json" },
      {
        name: "approved",
        type: "checkbox",
        defaultValue: false,
        access: {
          create: ({ req }) =>
            ["admin", "editor"].includes(req.user?.role ?? ""),
          update: ({ req }) =>
            ["admin", "editor"].includes(req.user?.role ?? ""),
        },
      },
    ],
  },
  {
    slug: "source-documents",
    admin: { group: "Content operations" },
    access: privateAccess,
    upload: {
      staticDir: "media/private",
      mimeTypes: [
        "text/plain",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
      ],
      filesRequiredOnCreate: true,
    },
    fields: [
      text("title", true),
      text("checksum"),
      { name: "retentionUntil", type: "date" },
    ],
  },
  {
    slug: "stories",
    admin: {
      useAsTitle: "title",
      group: "Publication",
      preview: (doc) => `/preview/${doc.id}/`,
    },
    versions: { drafts: { autosave: true }, maxPerDoc: 50 },
    access: { read: published, create: staff, update: staff, delete: editors },
    hooks: {
      beforeChange: [
        publicationGuard,
        ({ data, originalDoc, req }) => {
          if (data.path) publicPath(data.path);
          if (
            originalDoc?.legacyKey &&
            data.path &&
            data.path !== originalDoc.path &&
            !req.context.approvedURLChange
          )
            throw new Error(
              "Migrated URLs require an approved redirect decision",
            );
          if (
            data._status === "published" &&
            !req.context.trustedImport &&
            (!(data.author ?? originalDoc?.author) ||
              !(data.sources ?? originalDoc?.sources)?.length)
          )
            throw new Error(
              "Publication requires a responsible author and sources",
            );
          return data;
        },
      ],
      afterChange: [
        ({ doc }) => {
          try {
            revalidatePath(doc.path);
            revalidatePath("/");
            revalidatePath("/ai-companies/");
            revalidatePath("/ai-salaries/");
          } catch {}
          return doc;
        },
      ],
    },
    fields: [
      text("title", true),
      { name: "path", type: "text", required: true, unique: true, index: true },
      { name: "legacyKey", type: "text", unique: true, index: true },
      text("legacyStatus"),
      {
        name: "kind",
        type: "select",
        required: true,
        options: [
          "article",
          "ownership",
          "leader",
          "salary",
          "company",
          "page",
        ],
      },
      text("category", true),
      { name: "dek", type: "textarea", required: true },
      relation("author", "authors"),
      relation("featuredImage", "media"),
      { name: "publishedAt", type: "date" },
      { name: "modifiedAt", type: "date" },
      {
        name: "sections",
        type: "array",
        fields: [
          text("anchor", true),
          text("heading", true),
          { name: "text", type: "textarea", required: true },
          { name: "sourceIds", type: "json" },
        ],
      },
      { name: "body", type: "richText" },
      { name: "shortAnswer", type: "textarea" },
      {
        name: "facts",
        type: "array",
        fields: [text("label", true), text("value", true)],
      },
      {
        name: "timeline",
        type: "array",
        fields: [
          text("date", true),
          { name: "text", type: "textarea", required: true },
          { name: "sourceIds", type: "json" },
        ],
      },
      {
        name: "relations",
        type: "array",
        fields: [
          text("from", true),
          text("to", true),
          text("label", true),
          { name: "stake", type: "number", min: 0, max: 100 },
        ],
      },
      { name: "chartMetrics", type: "array", fields: metricFields },
      {
        name: "faqs",
        type: "array",
        fields: [
          text("question", true),
          { name: "answer", type: "textarea", required: true },
        ],
      },
      relation("sources", "sources", true),
      relation("companies", "companies", true),
      relation("people", "people", true),
      relation("taxonomy", "taxonomy", true),
      relation("relatedStories", "stories", true),
      {
        name: "seo",
        type: "group",
        fields: [
          text("title"),
          { name: "description", type: "textarea" },
          text("canonical"),
          { name: "noindex", type: "checkbox" },
        ],
      },
      {
        name: "legacyHTML",
        type: "textarea",
        access: { update: ({ req }) => req.user?.role === "admin" },
      },
      {
        name: "importChecksum",
        type: "text",
        access: { read: ({ req }) => Boolean(req.user) },
      },
      {
        name: "sourceJobKey",
        type: "text",
        unique: true,
        access: { read: ({ req }) => Boolean(req.user) },
      },
    ],
  },
  entity("companies", [
    text("vertical", true),
    text("legalEntity"),
    text("website"),
    { name: "description", type: "textarea" },
    relation("profile", "stories"),
    relation("observations", "observations", true),
    sources(),
  ]),
  entity("people", [
    { name: "biography", type: "textarea" },
    relation("portrait", "media"),
    relation("profile", "stories"),
    sources(),
  ]),
  entity("institutions", [text("location"), text("website"), sources()]),
  entity("education", [
    relation("person", "people"),
    relation("institution", "institutions"),
    relation("awardingInstitution", "institutions"),
    text("program"),
    text("subject"),
    text("start"),
    text("end"),
    text("graduation"),
    {
      name: "precision",
      type: "select",
      options: ["day", "month", "year", "unknown"],
    },
    sources(),
  ]),
  entity("company-roles", [
    relation("person", "people"),
    relation("company", "companies"),
    {
      name: "roleType",
      type: "select",
      options: ["executive", "founder", "board", "investor", "partnership"],
    },
    text("start"),
    text("end"),
    sources(),
  ]),
  entity("ownership", [
    relation("parent", "companies"),
    relation("child", "companies"),
    { name: "stake", type: "number", min: 0, max: 100 },
    {
      name: "rights",
      type: "select",
      options: ["equity", "voting", "unknown"],
    },
    text("effectiveAt"),
    sources(),
  ]),
  entity("events", [
    relation("company", "companies"),
    text("eventType"),
    text("effectiveAt"),
    { name: "amount", type: "number" },
    text("currency"),
    sources(),
  ]),
  entity("observations", [
    ...metricFields,
    text("display"),
    relation("company", "companies"),
    relation("person", "people"),
    text("occupation"),
    text("seniority"),
    text("statistic"),
    { name: "sampleSize", type: "number" },
    { name: "methodology", type: "textarea" },
    sources(),
  ]),
  {
    slug: "taxonomy",
    access: {
      read: () => true,
      create: editors,
      update: editors,
      delete: admins,
    },
    fields: [
      text("name", true),
      text("path", true),
      text("legacyKey"),
      { name: "kind", type: "select", options: ["category", "tag"] },
    ],
  },
  {
    slug: "redirects",
    access: { read: editors, create: editors, update: editors, delete: admins },
    fields: [
      { name: "from", type: "text", unique: true, required: true },
      text("to", true),
      text("reason", true),
      { name: "approved", type: "checkbox", defaultValue: false },
    ],
    hooks: {
      beforeValidate: [
        async ({ data, req }) => {
          if (!data) return data;
          publicPath(data.from);
          publicPath(data.to);
          if (data.from === data.to) throw new Error("Self redirect");
          const chains = await req.payload.find({
            collection: "redirects",
            where: {
              or: [
                { from: { equals: data.to } },
                { to: { equals: data.from } },
              ],
            },
            limit: 1,
            req,
          });
          if (chains.docs.length)
            throw new Error("Redirect chains are not allowed");
          return data;
        },
      ],
    },
  },
  {
    slug: "content-inbox",
    labels: { singular: "Content inbox submission", plural: "Content inbox" },
    admin: {
      useAsTitle: "name",
      group: "Content operations",
      description:
        "Save the packet, then request preparation. All generated content remains a draft.",
    },
    access: privateAccess,
    fields: [
      text("name", true),
      {
        name: "workflow",
        type: "select",
        required: true,
        options: ["leader", "salary", "ownership", "article"],
      },
      { name: "text", type: "textarea" },
      { name: "urls", type: "array", fields: [text("url", true)] },
      relation("documents", "source-documents", true),
      relation("referenceImages", "media", true),
      {
        name: "imageMode",
        type: "select",
        defaultValue: "reuse",
        options: ["reuse", "generate", "none"],
      },
      { name: "allowResearch", type: "checkbox", defaultValue: false },
      relation("target", "stories"),
      text("targetVersion"),
      text("proposedPath", true),
      relation("author", "authors"),
      {
        name: "prepare",
        type: "checkbox",
        defaultValue: false,
        admin: { description: "Queue draft preparation on save." },
      },
    ],
    hooks: {
      beforeValidate: [
        async ({ data, req }) => {
          if (data?.target && !data.targetVersion) {
            const target = await req.payload.findByID({
              collection: "stories",
              id:
                typeof data.target === "object" ? data.target.id : data.target,
              req,
            });
            data.targetVersion = target.updatedAt;
            data.proposedPath = target.path;
          }
          return data;
        },
      ],
      afterChange: [
        async ({ doc, req }) => {
          if (doc.prepare) {
            const { enqueue } = await import("@/workflows/engine");
            await enqueue(req.payload, doc, req);
          }
          return doc;
        },
      ],
    },
  },
  ...[
    "content-jobs",
    "claim-evidence",
    "generated-assets",
    "review-decisions",
    "prompt-templates",
    "migration-records",
  ].map((slug): CollectionConfig => ({
    slug,
    admin: {
      group: "Content operations",
      useAsTitle: "name",
      defaultColumns: ["name", "state", "updatedAt", "error"],
    },
    access: { read: staff, create: editors, update: editors, delete: admins },
    ...(slug === "content-jobs"
      ? {
          hooks: {
            afterChange: [
              async ({ doc, req }: any) => {
                if (req.context.jobAction || !doc.action) return doc;
                const state = doc.action === "cancel" ? "canceled" : "queued";
                await req.payload.update({
                  collection: "content-jobs",
                  id: doc.id,
                  req,
                  context: { jobAction: true },
                  data: { state, action: null },
                });
                if (state === "queued")
                  await req.payload.jobs.queue({
                    task: "prepare-content",
                    input: { jobID: String(doc.id) },
                    req,
                  });
                return doc;
              },
            ],
          },
        }
      : {}),
    fields: [
      text("name", true),
      { name: "key", type: "text", unique: true, index: true },
      text("state"),
      { name: "data", type: "json" },
      { name: "error", type: "textarea" },
      ...(slug === "content-jobs"
        ? [
            {
              name: "action",
              type: "select",
              options: ["retry", "cancel"],
              admin: {
                description:
                  "Retry resumes saved stages; cancel stops future stages.",
              },
            } as Field,
          ]
        : []),
    ],
  })),
];
