import { Newsletter } from "@/components/Shell";
export const metadata = {
  title: "Register for the Visionary Brief",
  description:
    "Register your interest in Visionary Talks’ newsletter. Registrations are stored privately; email delivery has not started.",
  alternates: { canonical: "/newsletter/" },
};
export default function Page() {
  return (
    <>
      <header className="index-heading">
        <span className="eyebrow">THE VISIONARY BRIEF</span>
        <h1>
          Look a little closer.
          <br />
          <em>Stay curious.</em>
        </h1>
      </header>
      <Newsletter />
    </>
  );
}
