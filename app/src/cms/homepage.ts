import type { Field } from "payload";
export const homepageFields: Field[] = [
  {
    name: "homepageHero",
    label: "Homepage hero",
    type: "relationship",
    relationTo: "stories",
    filterOptions: {
      and: [
        { _status: { equals: "published" } },
        { kind: { not_equals: "page" } },
        { excludeFromHomepage: { not_equals: true } },
      ],
    },
    admin: {
      description:
        "Choose a published article. Defaults to 100 AI people to watch in 2027. Unpublished choices never appear.",
    },
  },
  {
    name: "homepageLead",
    label: "Newsroom lead: optional editor's pick",
    type: "relationship",
    relationTo: "stories",
    filterOptions: {
      and: [
        { _status: { equals: "published" } },
        { kind: { not_equals: "page" } },
        { excludeFromHomepage: { not_equals: true } },
      ],
    },
    admin: {
      description:
        "Leave blank for the newest editorial update, excluding the hero. A manual choice is labelled Editor's pick.",
    },
  },
  {
    name: "ownershipUpdates",
    label: "This week in ownership",
    type: "array",
    maxRows: 3,
    admin: {
      description:
        "Three dated events selected for this week's reading. Use the event date, not the date you edit this box. Links appear only while their investigations are published.",
    },
    fields: [
      { name: "eventDate", label: "Event date", type: "date", required: true },
      {
        name: "status",
        type: "select",
        required: true,
        options: ["Pending deal", "New round", "IPO filing", "Reported talks"],
      },
      {
        name: "headline",
        type: "text",
        required: true,
        maxLength: 140,
        validate: (value: unknown) =>
          typeof value === "string" && /[\u2013\u2014]/.test(value)
            ? "Use commas or colons instead of long dashes."
            : true,
      },
      {
        name: "story",
        type: "relationship",
        relationTo: "stories",
        required: true,
        filterOptions: {
          and: [
            { _status: { equals: "published" } },
            { kind: { equals: "ownership" } },
            { excludeFromHomepage: { not_equals: true } },
          ],
        },
      },
    ],
  },
  {
    name: "mostReadStories",
    label: "Most Read: manual selection",
    type: "relationship",
    relationTo: "stories",
    hasMany: true,
    maxRows: 5,
    admin: {
      description:
        "Order up to five published stories. Displayed as an editor-selected list until verified analytics rankings are connected.",
    },
    filterOptions: {
      and: [
        { _status: { equals: "published" } },
        { excludeFromHomepage: { not_equals: true } },
      ],
    },
  },
];
