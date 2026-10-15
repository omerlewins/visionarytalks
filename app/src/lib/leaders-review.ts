type Environment = Readonly<Record<string, string | undefined>>;

// Research drafts may be reviewed locally or on the isolated Vercel Preview.
// Neither flag can expose the batch in a Production deployment.
export function isLeadersReview(env: Environment = process.env): boolean {
  if (env.APP_ENV === "production" || env.VERCEL_ENV === "production")
    return false;
  return (
    env.DEMO_MODE === "true" ||
    (env.APP_ENV === "preview" && env.VERCEL_ENV === "preview")
  );
}
