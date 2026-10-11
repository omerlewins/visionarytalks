import profile from "@/data/publication-profile.json";
import type { Story } from "./domain";

export const publicationAuthor = {
  name: profile.name,
  path: "/about/#about-me",
  bio: profile.bio,
};
export function articleAuthor(
  author: Story["author"] | undefined,
): Story["author"] {
  const name = author?.name?.trim() ?? "";
  if (
    /^(visionary\s*talks(?: editorial)?|daniel mercer|omer|editorial team|design fixture.*)?$/i.test(
      name,
    )
  ) {
    return publicationAuthor;
  }
  return author!;
}
