import type { Metadata } from "next";
import { About } from "@/components/About";
import "@/styles/about.css";
export const metadata: Metadata = {
  title: "About Us",
  description:
    "Meet Daniel Mercer, the pen name behind Visionary Talks, and learn about his finance background, independent research methods and corrections contact.",
  alternates: { canonical: "/about/" },
};
export default function AboutPage() {
  return <About />;
}
