import { ImageResponse } from "next/og";
import { storyAt } from "@/lib/content";
import { storySEO } from "@/lib/seo";
import { loadLeaderProfile } from "@/lib/leader-content";
import { leaderProfiles } from "@/lib/leaders";
import { loadOwnershipFile } from "@/lib/ownership-content";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get("path") ?? "/";
  if (!/^\/[a-zA-Z0-9\-/_]*$/.test(path) || path.length > 220)
    return new Response("Invalid path", { status: 400 });
  const candidate = leaderProfiles.find((p) => p.path === path);
  const leader = candidate
    ? await loadLeaderProfile(candidate.slug)
    : undefined;
  const research = !leader ? await loadOwnershipFile(path) : undefined;
  const story = !leader && !research ? await storyAt(path) : undefined;
  const title =
    leader?.seo.title ??
    research?.seo.title ??
    (story ? storySEO(story).title : "Companies. Money. Careers.");
  const category = leader
    ? "THE LEADERS"
    : research
      ? "WHO OWNS"
      : (story?.category.toUpperCase() ?? "VISIONARY TALKS");
  const accent = /OWNERSHIP|WHO OWNS/.test(category)
    ? "#e9d98e"
    : category === "MONEY"
      ? "#dce9ef"
      : "#dce5d8";
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#f5f4ef",
        color: "#171918",
        display: "flex",
        flexDirection: "column",
        padding: 58,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 21,
          letterSpacing: 3,
          borderBottom: "2px solid #171918",
          paddingBottom: 23,
        }}
      >
        <span>VISIONARY TALKS</span>
        <span>BUSINESS, EXPLAINED.</span>
      </div>
      <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 35 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 850,
            gap: 25,
          }}
        >
          <span style={{ fontSize: 19, letterSpacing: 3 }}>{category}</span>
          <span
            style={{
              fontSize: title.length > 65 ? 53 : 62,
              fontWeight: 700,
              lineHeight: 1.12,
            }}
          >
            {title}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            width: 145,
            height: 230,
            position: "relative",
            background: accent,
            border: "2px solid #171918",
            transform: "rotate(-7deg)",
          }}
        >
          <div
            style={{
              display: "flex",
              position: "absolute",
              left: 20,
              top: 20,
              right: 20,
              bottom: 20,
              border: "2px solid #171918",
            }}
          />
          <span
            style={{
              display: "flex",
              position: "absolute",
              left: 36,
              bottom: 32,
              fontSize: 42,
              fontWeight: 700,
            }}
          >
            VT
          </span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid #9faaa1",
          paddingTop: 22,
          fontSize: 19,
        }}
      >
        <span>FOLLOW THE PEOPLE. UNDERSTAND THE BUSINESS.</span>
        <span>visionarytalks.com</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control":
          process.env.APP_ENV === "production"
            ? "public, max-age=3600"
            : "private, no-store",
      },
    },
  );
}
