import { publicationSocials } from "@/lib/publication-socials";
export function SocialLinks({ compact = false }: { compact?: boolean }) {
  return (
    <nav
      className={`social-links ${compact ? "social-links-compact" : ""}`}
      aria-label="Visionary Talks social pages"
    >
      {publicationSocials.map((s) => (
        <a
          key={s.name}
          href={s.url}
          target="_blank"
          rel="noopener"
          aria-label={`Visionary Talks on ${s.name}`}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            aria-hidden="true"
            fill="currentColor"
          >
            {s.name === "LinkedIn" ? (
              <path d="M5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3.5 9h3v12h-3V9ZM9 9h3v1.6c.7-1.2 1.8-1.9 3.4-1.9 3.3 0 4.1 2 4.1 5V21h-3v-6.5c0-1.8-.3-3-2.1-3-1.9 0-2.4 1.3-2.4 3V21H9V9Z" />
            ) : s.name === "Instagram" ? (
              <>
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle cx="17.5" cy="6.5" r="1.1" />
              </>
            ) : (
              <path d="M12 2a10 10 0 0 0-3.6 19.3c0-.9 0-2 .2-3l1.3-5.4s-.3-.7-.3-1.8c0-1.7 1-3 2.2-3 1 0 1.4.7 1.4 1.6 0 1-.7 2.6-1 4-.3 1.2.6 2.2 1.8 2.2 2.2 0 3.7-2.8 3.7-6 0-2.5-1.7-4.3-4.8-4.3-3.5 0-5.6 2.6-5.6 5.4 0 1 .3 1.8.8 2.3.2.2.2.3.2.6l-.3 1c0 .3-.3.4-.6.3-1.6-.7-2.4-2.6-2.4-4.7 0-3.5 3-7.8 8.4-7.8 4.5 0 7.4 3.3 7.4 6.9 0 4.7-2.6 8.2-6.3 8.2-1.2 0-2.4-.7-2.8-1.4l-.8 3.1c-.3 1-.8 2-1.3 2.8A10 10 0 1 0 12 2Z" />
            )}
          </svg>
          {!compact && <span>{s.name}</span>}
        </a>
      ))}
    </nav>
  );
}
